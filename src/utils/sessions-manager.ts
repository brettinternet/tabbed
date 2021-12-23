import { lightFormat } from 'date-fns'
import { uniqBy, debounce } from 'lodash'

import { appName } from 'utils/env'
import { downloadJson } from 'utils/helpers'

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
  UpdateSavedSession,
  createSaved as createSavedSession,
  fromBrowser as sessionFromBrowser,
  update as _updateSession,
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

export type SessionExport = {
  exportedDate: Date
  sessions: Session[]
}

type StoredSessions = {
  current: StoredCurrentSession
  previous: SavedSession[]
  saved: SavedSession[]
}

// TODO: When to overwrite current and unshift previous current to "previous" - as autosave
export const getCurrent = async (
  current?: StoredCurrentSession
): Promise<CurrentSession> => {
  return await sessionFromBrowser({
    windowOrder: current?.windows,
  })
}

const updateCurrentSessionNow = async (sessionsManager: SessionsManager) => {
  sessionsManager.current = await sessionFromBrowser(sessionsManager.current)
  return sessionsManager
}

const updateCurrentSessionDebounced = debounce(updateCurrentSessionNow, 250)

export const updateCurrentSession = async (sessionsManager: SessionsManager) =>
  (await updateCurrentSessionDebounced(sessionsManager)) || sessionsManager

export const loadSessionsManager = async () => {
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

const validate = (sessionsManager: SessionsManager) => {
  sessionsManager.saved = uniqBy(sessionsManager.saved, 'uuid')
  sessionsManager.previous = uniqBy(sessionsManager.previous, 'uuid')
  return sessionsManager
}

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
    })
    return win
  })

  return session
}

const addSession = async <T extends PartialBy<Session, 'id'>>(
  sessionsManager: SessionsManager,
  session: T,
  category: SavedSessionCategoryType
) => {
  let savedSession = createSavedSession(session)
  savedSession = await filterWindowTabs(savedSession)
  sessionsManager[category].unshift(savedSession)
  save(sessionsManager)
  return sessionsManager
}

export const addSaved = async <T extends PartialBy<Session, 'id'>>(
  sessionsManager: SessionsManager,
  session: T
) => await addSession(sessionsManager, session, SavedSessionCategory.SAVED)

export const addPrevious = async <T extends PartialBy<Session, 'id'>>(
  sessionsManager: SessionsManager,
  session: T
) => await addSession(sessionsManager, session, SavedSessionCategory.PREVIOUS)

/**
 * Avoid conflicts with imported sessions by assigned a new ID
 */
export const importSessions = async (
  sessionsManager: SessionsManager,
  { id: _id, ...session }: Session
) => {
  const saveSession = createSavedSession(session)
  sessionsManager = await addSaved(sessionsManager, saveSession)
  save(sessionsManager)
  return sessionsManager
}

/**
 * Search saved/previous
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

  return session
}

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
 * Look for current, saved or previous
 */
export const getSession = (
  sessionsManager: SessionsManager,
  sessionId: Session['id'],
  category?: SavedSessionCategoryType
) => {
  if (sessionId === sessionsManager.current.id) {
    return sessionsManager.current
  } else {
    return findSession(sessionsManager, sessionId, category)
  }
}

export const removeSession = async (
  sessionsManager: SessionsManager,
  sessionId: Session['id'],
  category: SavedSessionCategoryType
) => {
  const index = findSessionIndex(sessionsManager, sessionId, category)
  sessionsManager[category].splice(index, 1)
  await save(sessionsManager)
}

export const downloadSession = async (
  sessionsManager: SessionsManager,
  sessionIds: Session['id'][]
) => {
  sessionsManager = await updateCurrentSessionNow(sessionsManager)
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
