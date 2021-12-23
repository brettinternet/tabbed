import { getAllWindows } from './browser'
import { createId, generateSessionTitle } from './generate'
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
  id: string
  title?: string
  windows: T[]
  /**
   * Date originally generated
   */
  createdDate?: Date
}

export type UpdateCurrentSession = Partial<
  Pick<CurrentSession, 'title' | 'windows'>
>
export type UpdateSavedSession = Partial<
  Pick<SavedSession, 'title' | 'windows'>
>

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
 * Type guards
 */

export const isCurrentSession = (
  session: CurrentSession | SavedSession
): session is CurrentSession => isCurrentSessionWindows(session.windows)

/**
 * Session helpers
 */

const maybeGetTitle = (
  session: CurrentSession | SavedSession,
  maybeTitle?: SessionWindow['title']
) => maybeTitle ?? (session.title || generateSessionTitle(session.windows))

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

  return session
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

  return session
}

export const update = <T extends CurrentSession | SavedSession>(
  session: T,
  values: UpdateCurrentSession
): T =>
  Object.assign(session, values, {
    title: maybeGetTitle(session, values.title),
  })

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

const searchWindowByAssignedId = (
  session: CurrentSession,
  assignedWindowId: CurrentSessionWindow['assignedWindowId']
) => session.windows.find((w) => w.assignedWindowId === assignedWindowId)

export const fromBrowser = async ({
  windowOrder,
  ...options
}: Partial<
  Omit<CurrentSession, 'id' | 'windows' | 'active' | 'status'> & {
    windowOrder: StoredCurrentSession['windows']
  }
> = {}): Promise<CurrentSession> => {
  const browserWindows = await getAllWindows({ populate: true }, true)
  const windows: CurrentSessionWindow[] =
    browserWindows.map<CurrentSessionWindow>((win) => fromBrowserWindow(win))
  return createCurrent({
    windows: windowOrder
      ? sortWindows(
          windows,
          windowOrder.map(({ assignedWindowId }) => assignedWindowId)
        )
      : windows,
    ...options,
  })
}

export const updateFromBrowser = async (session: CurrentSession) => {
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

export const open = async (session: CurrentSession | SavedSession) => {
  const tasks = session.windows.map((win) => openWindow(win))
  const results = await Promise.all(tasks)
  return results.filter(isDefined)
}
