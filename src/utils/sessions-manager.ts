import { lightFormat } from 'date-fns'
import { assign, cloneDeep, merge, uniqBy } from 'lodash'
import log from 'loglevel'

import { appName } from 'utils/env'
import { downloadJson, isDefined } from 'utils/helpers'

import { isNewTab, urlsMatch } from './browser'
import { AppError } from './error'
import { PartialBy } from './helpers'
import {
  CurrentSession,
  SavedSession,
  SavedSessionCategory,
  SavedSessionCategoryType,
  Session,
  StoredCurrentSession,
  createSaved as createSavedSession,
  fromBrowser as sessionFromBrowser,
  isCurrentSession,
} from './session'
import { loadSettings } from './settings'
import { LocalStorage } from './storage'

const logContext = 'utils/sessions-manager'

/**
 * Session manager data, collection of sessions
 */
export type SessionsManager = {
  current: CurrentSession
  saved: SavedSession[]
  previous: SavedSession[]
}

/**
 * Shape of the serialized export
 */
export type SessionExport = {
  exportedDate: Date
  sessions: Session[]
}

/**
 * Shape of saved sessions in local extension storage
 */
type StoredSessions = {
  current: StoredCurrentSession
  previous: SavedSession[]
  saved: SavedSession[]
}

/**
 * @usage Gets the current session using the saved window order
 * TODO: When to overwrite current and unshift previous current to "previous" - as autosave?
 */
export const getCurrent = async (
  current?: StoredCurrentSession
): Promise<CurrentSession> => {
  return await sessionFromBrowser({
    windowOrder: current?.windows,
  })
}

/**
 * @usage Updates the current session with the latest windows/tabs snapshot from browser
 * @returns a new sessions manager reference with current field updated
 */
export const updateCurrentSession = async (
  _sessionsManager: SessionsManager
) => {
  const current = await sessionFromBrowser(_sessionsManager.current)
  const sessionsManager = cloneDeep(_sessionsManager)
  sessionsManager.current = current
  return sessionsManager
}

/**
 * @usage loads the session manager from local storage
 */
export const loadSessionsManager = async (): Promise<SessionsManager> => {
  const {
    current,
    saved = [],
    previous = [],
  } = (await LocalStorage.get<StoredSessions>(LocalStorage.key.SESSIONS)) || {}

  // save more fields on current, like window title, etc
  return {
    current: await getCurrent(current),
    saved: saved.map(createSavedSession),
    previous: previous.map(createSavedSession),
  }
}

/**
 * @usage validates and cleans data before saving to local extension storage
 */
const validate = (sessionsManager: SessionsManager) => {
  sessionsManager.saved = uniqBy(sessionsManager.saved, 'id')
  sessionsManager.previous = uniqBy(sessionsManager.previous, 'id')
  return sessionsManager
}

/**
 * @usage saves the sessions manager to local extension storage
 */
export const save = async (sessionsManager: SessionsManager) => {
  sessionsManager = validate(sessionsManager)
  const { current, saved, previous } = sessionsManager
  const storedSessions: StoredSessions = {
    current: {
      windows: current.windows.map(({ assignedWindowId }) => ({
        assignedWindowId,
      })),
    },
    saved,
    previous,
  }
  await LocalStorage.set(LocalStorage.key.SESSIONS, storedSessions)
}

/**
 * @usage Filters out tabs based on user preferences
 */
const filterWindowTabs = async (session: SavedSession) => {
  const settings = await loadSettings()
  session.windows = session.windows.map((win) => {
    win.tabs = win.tabs.filter((tab) => {
      if (!isNewTab(tab)) {
        return settings.excludedUrls.parsed.every((excludedUrl) =>
          excludedUrl.includes('*')
            ? !excludedUrl
                .split('*')
                .filter(Boolean)
                .every((segment) => tab.url.includes(segment))
            : !urlsMatch(excludedUrl, tab.url)
        )
      }
      return false
    })
    return win
  })

  return cloneDeep(session)
}

/**
 * @usage Saves a session to a category list
 * @returns a new session manager reference with the added session
 */
const addSession = async <T extends PartialBy<Session, 'id'>>(
  sessionsManager: SessionsManager,
  session: T,
  category: SavedSessionCategoryType
) => {
  const sessions = cloneDeep(sessionsManager[category])
  let savedSession = createSavedSession(session)
  savedSession = await filterWindowTabs(savedSession)
  sessionsManager[category].unshift(savedSession)
  return assign(cloneDeep(sessionsManager), { [category]: sessions })
}

/**
 * @usage add a session to the list of saved sessions
 */
export const addSaved = async <T extends PartialBy<Session, 'id'>>(
  sessionsManager: SessionsManager,
  session: T
) => await addSession(sessionsManager, session, SavedSessionCategory.SAVED)

/**
 * @usage add a session to the list of saved sessions
 */
export const addPrevious = async <T extends PartialBy<Session, 'id'>>(
  sessionsManager: SessionsManager,
  session: T
) => await addSession(sessionsManager, session, SavedSessionCategory.PREVIOUS)

/**
 * @usage Adds a saved session to sessions manager, doesn't allow session ID to pass through
 * @note Avoids conflicts with imported sessions by forcing a new ID
 * @returns a new sessions manager reference
 */
export const importSessions = async (
  _sessionsManager: SessionsManager,
  { id: _id, ...session }: Session
) => {
  const saveSession = createSavedSession(session)
  const sessionsManager = await addSaved(_sessionsManager, saveSession)
  return sessionsManager
}

/**
 * @usage search saved/previous, throws when not found
 */
export const findSession = (
  sessionsManager: SessionsManager,
  sessionId: Session['id'],
  category?: SavedSessionCategoryType
) => {
  const sessions = category
    ? sessionsManager[category]
    : [...sessionsManager.saved, ...sessionsManager.previous]
  const session = sessions.find(({ id }) => id === sessionId)
  if (!session) {
    throw new AppError(logContext, `Unable to find session by ID ${sessionId}`)
  }

  return cloneDeep(session)
}

/**
 * @usage find session by index, throws when not found
 */
export const findSessionIndex = (
  sessionsManager: SessionsManager,
  sessionId: Session['id'],
  category?: SavedSessionCategoryType
) => {
  const sessions = category
    ? sessionsManager[category]
    : [...sessionsManager.saved, ...sessionsManager.previous]
  const index = sessions.findIndex(({ id }) => id === sessionId)

  if (index === -1) {
    throw new AppError(logContext, `Unable to find session by ID ${sessionId}`)
  }

  return index
}

/**
 * @usage Retrieve for current, saved or previous session
 * @returns a new session object
 */
export const getSession = (
  sessionsManager: SessionsManager,
  sessionId: Session['id'],
  category?: SavedSessionCategoryType
): CurrentSession | SavedSession => {
  if (sessionId === sessionsManager.current.id) {
    return cloneDeep(sessionsManager.current)
  } else {
    const session = findSession(sessionsManager, sessionId, category)
    return cloneDeep(session)
  }
}

/**
 * @usage lookup which category a session is in
 */
const findSessionCategory = (
  sessionsManager: SessionsManager,
  sessionId: Session['id']
): { category: SavedSessionCategoryType; index: number } | undefined => {
  try {
    const index = findSessionIndex(
      sessionsManager,
      sessionId,
      SavedSessionCategory.SAVED
    )
    if (index > -1) {
      return {
        category: SavedSessionCategory.SAVED,
        index,
      }
    }
  } catch {}
  try {
    const index = findSessionIndex(
      sessionsManager,
      sessionId,
      SavedSessionCategory.PREVIOUS
    )
    if (index > -1) {
      return {
        category: SavedSessionCategory.PREVIOUS,
        index,
      }
    }
  } catch {}
}

// const mergeSessions = (
//   sessions: Session[],
//   updateSessions: Session[]
// ): Session[] =>
//   values(merge(keyBy(sessions, 'id'), keyBy(updateSessions, 'id')))

/**
 * @usage patch a session on the sessions manager
 */
export const updateSessionsManager = (
  _sessionsManager: SessionsManager,
  session: CurrentSession | SavedSession
) => {
  const sessionsManager = cloneDeep(_sessionsManager)
  if (isCurrentSession(session)) {
    sessionsManager.current = cloneDeep(session)
    return sessionsManager
  } else {
    const { category, index } =
      findSessionCategory(sessionsManager, session.id) || {}
    if (category && isDefined(index)) {
      sessionsManager[category][index] = cloneDeep(session)
      return sessionsManager
    } else {
      log.warn(
        logContext,
        'updateSessionsManager()',
        'Unable to find session to update sessions manager',
        session
      )
      return sessionsManager
    }
  }
}

/**
 * @usage removes a session from a sessions manager list category
 * @returns a new sessions manager reference
 */
export const removeSession = async (
  sessionsManager: SessionsManager,
  sessionId: Session['id'],
  category: SavedSessionCategoryType
) => {
  const index = findSessionIndex(sessionsManager, sessionId, category)
  const sessions = cloneDeep(sessionsManager[category])
  sessions.splice(index, 1)
  return merge(sessionsManager, { [category]: sessions })
}

/**
 * @usage immediately downloads data from sessions manager by session IDs else all sessions in manager
 * @note _SIDE EFFECT_: initializes a download in the browser
 */
export const downloadSession = async (
  sessionsManager: SessionsManager,
  sessionIds: Session['id'][]
) => {
  sessionsManager = await updateCurrentSession(sessionsManager)
  const storedSessions = [
    createSavedSession(sessionsManager.current),
    ...sessionsManager.saved,
    ...sessionsManager.previous,
  ]
  const sessions = sessionIds
    ? storedSessions.filter(({ id }) => sessionIds.includes(id))
    : storedSessions

  const now = new Date()
  const timestamp = lightFormat(now, 'yyyy-MM-dd-hh-mm-ss-SS')
  const data: SessionExport = {
    exportedDate: now,
    sessions,
  }
  const filename = `${appName}-${timestamp}.json`
  downloadJson(filename, data)
}
