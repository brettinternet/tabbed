import { cloneDeep, merge } from 'lodash'

import { getAllWindows } from './browser'
import { BrandedUuid, createId, generateSessionTitle } from './generate'
import { isDefined, PartialBy, Valueof } from './helpers'
import {
  SessionWindow,
  CurrentSessionWindow,
  SavedSessionWindow,
  fromBrowser as fromBrowserWindow,
  open as openWindow,
  isCurrentSessionWindows,
} from './session-window'

/**
 * Session categories, group together in session manager
 */
export const SavedSessionCategory = {
  PREVIOUS: 'previous',
  SAVED: 'saved',
} as const

export type SavedSessionCategoryType = Valueof<typeof SavedSessionCategory>

/**
 * Session data
 */

export type Session<T extends SessionWindow = SessionWindow> = {
  id: BrandedUuid<'session'>
  title?: string
  windows: T[]
  /**
   * Date originally generated
   */
  createdDate?: Date
}

export type UpdateSession = Partial<Pick<Session, 'title' | 'windows'>>

export type CurrentSession = Session<CurrentSessionWindow>
export type SavedSession = Session<SavedSessionWindow> & {
  /**
   * Date auto or user saved
   */
  userSavedDate: Date
}

export type StoredCurrentSession = {
  windows: {
    assignedWindowId: CurrentSessionWindow['assignedWindowId']
  }[]
}

/**
 * @usage Type guard
 * @returns true when session is current
 */
export const isCurrentSession = (
  session: CurrentSession | SavedSession
): session is CurrentSession => isCurrentSessionWindows(session.windows)

/**
 * @note update when title is user-editable to nullish coelesce and avoid overriding a
 * user-edited title: `maybeTitle ?? (session.title || generateSessionTitle(session.windows))`
 */
const maybeGetTitle = (
  session: CurrentSession | SavedSession,
  _maybeTitle?: SessionWindow['title']
) => generateSessionTitle(session.windows)

export const createCurrent = ({
  id,
  title,
  windows,
  createdDate,
}: PartialBy<CurrentSession, 'id' | 'createdDate'>): CurrentSession => {
  const now = new Date()
  const session: CurrentSession = {
    id: id || createId('session'),
    title,
    windows,
    createdDate: createdDate || now,
  }

  if (!session.title) {
    session.title = maybeGetTitle(session)
  }

  return cloneDeep(session)
}

export const createSaved = ({
  id,
  title,
  windows,
  createdDate,
}: PartialBy<
  SavedSession,
  'id' | 'createdDate' | 'userSavedDate'
>): SavedSession => {
  const now = new Date()
  const session: SavedSession = {
    id: id || createId('session'),
    title,
    windows,
    createdDate: createdDate || now,
    userSavedDate: now,
  }

  if (!session.title) {
    session.title = maybeGetTitle(session)
  }

  return cloneDeep(session)
}

/**
 * @usage updates the session
 * @returns a new session
 */
export const update = <T extends CurrentSession | SavedSession>(
  session: T,
  values: UpdateSession
): T =>
  merge(session, values, {
    title: maybeGetTitle(session, values.title),
  })

/**
 * @usage sorts `CurrentSessionWindow[]` with a list of `assignedWindowId[]`.
 * Used to update `CurrentSession` with the user-defined window order
 */
const sortWindows = (
  windows: CurrentSessionWindow[],
  ids: CurrentSessionWindow['assignedWindowId'][]
) => {
  return windows.sort((a, b) => {
    const aIndex = ids.findIndex((id) => id === a.assignedWindowId)
    const bIndex = ids.findIndex((id) => id === b.assignedWindowId)

    // sort missing (new) values to end
    if (aIndex === -1) {
      return 1
    }

    if (bIndex === -1) {
      return -1
    }

    // otherwise match sort to `ids`
    return aIndex - bIndex
  })
}

/**
 * @usage search for a window by the `assignedWindowId`
 * @note does not produce side effects
 */
const searchWindowByAssignedId = (
  session: CurrentSession,
  assignedWindowId: CurrentSessionWindow['assignedWindowId']
) => session.windows.find((w) => w.assignedWindowId === assignedWindowId)

/**
 * @usage Generate current session from browser API
 * TODO: perform more surgical update so entire board doesn't need rerender
 */
export const fromBrowser = async ({
  windows: existingWindows,
  windowOrder = existingWindows,
  ...options
}: Partial<
  Omit<CurrentSession, 'active' | 'status'> & {
    windowOrder: StoredCurrentSession['windows']
  }
>): Promise<CurrentSession> => {
  const browserWindows = await getAllWindows({ populate: true }, true)
  const windows: CurrentSessionWindow[] =
    browserWindows.map<CurrentSessionWindow>((win) => {
      const existingWindow = existingWindows?.find(
        (w) => win.id && win.id === w.assignedWindowId
      )
      return fromBrowserWindow(win, existingWindow?.id, existingWindow?.tabs)
    })
  return createCurrent({
    ...options,
    windows: windowOrder
      ? sortWindows(
          windows,
          windowOrder.map(({ assignedWindowId }) => assignedWindowId)
        )
      : windows,
  })
}

/**
 * @usage Regenerates current session windows and title
 * @returns a new session reference but same ID
 */
export const updateFromBrowser = async (_session: CurrentSession) => {
  const session = cloneDeep(_session)
  const windows = await getAllWindows({ populate: true }, true)
  const updatedWindows = windows.map((win) => {
    return fromBrowserWindow(
      win,
      isDefined(win.id)
        ? searchWindowByAssignedId(session, win.id)?.id
        : undefined
    )
  })
  session.windows = sortWindows(
    updatedWindows,
    session.windows.map(({ assignedWindowId }) => assignedWindowId)
  )
  session.title = generateSessionTitle(session.windows)
  return session
}

/**
 * @usage open a session with all its windows and tabs into the current session
 */
export const open = async (session: CurrentSession | SavedSession) => {
  const tasks = session.windows.map((win) => openWindow(win))
  const results = await Promise.all(tasks)
  return results.filter(isDefined)
}
