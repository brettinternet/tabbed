import { getAllWindows } from './browser'
import { AppError } from './error'
import { createId, generateSessionTitle } from './generate'
import { isDefined, PartialBy, reorder, Valueof, XOR } from './helpers'
import {
  SessionWindow,
  CurrentSessionWindow,
  SavedSessionWindow,
  fromBrowser as fromBrowserWindow,
  open as openWindow,
  isCurrentSessionWindows,
  createCurrent as createCurrentWindow,
  createSaved as createSavedWindow,
  close as closeWindow,
} from './session-window'

const logContext = 'utils/session'

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

export type StoredCurrentSessionData = {
  windows: {
    assignedWindowId: CurrentSessionWindow['assignedWindowId']
  }[]
}
export type UpdateCurrentSessionData = Partial<
  Pick<CurrentSession, 'title' | 'windows'>
>
export type UpdateSavedSessionData = Partial<
  Pick<SavedSession, 'title' | 'windows'>
>

export type CurrentSession = Session<CurrentSessionWindow>
export type SavedSession = Session<SavedSessionWindow> & {
  /**
   * Date auto or user saved
   */
  userSavedDate: Date
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

export const updateCurrent = (
  session: CurrentSession,
  values: UpdateCurrentSessionData
): CurrentSession =>
  Object.assign({}, session, values, {
    title: maybeGetTitle(session, values.title),
  })

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

export const updateSaved = (
  session: SavedSession,
  values: UpdateSavedSessionData
): SavedSession =>
  Object.assign({}, session, values, {
    title: maybeGetTitle(session, values.title),
  })

export const findWindow = <T extends SessionWindow>(
  windows: T[],
  id: T['id']
): T => {
  const win = windows.find((w) => w.id === id)
  if (!win) {
    throw new AppError(logContext, `Unable to find window by ID ${id}`)
  }

  return win
}

export const findWindowIndex = <T extends SessionWindow>(
  windows: T[],
  id: T['id']
): number => {
  const index = windows.findIndex((w) => w.id === id)
  if (index === -1) {
    throw new AppError(logContext, `Unable to find window by ID ${id}`)
  }

  return index
}

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

const searchWindowIndexByAssignedId = (
  session: CurrentSession,
  assignedWindowId: CurrentSessionWindow['assignedWindowId']
) => session.windows.findIndex((w) => w.assignedWindowId === assignedWindowId)

export const fromBrowser = async ({
  windowOrder,
  ...options
}: Partial<
  Omit<CurrentSession, 'id' | 'windows' | 'active' | 'status'> & {
    windowOrder: StoredCurrentSessionData['windows']
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
}

export const open = async (session: CurrentSession) => {
  const tasks = session.windows.map((win) => openWindow(win))
  const results = await Promise.all(tasks)
  return results.filter(isDefined)
}

export const addWindow = async (
  session: CurrentSession | SavedSession,
  {
    window: win,
    focused,
    index,
  }: {
    window: CurrentSessionWindow | SavedSessionWindow
  } & XOR<{ focused?: boolean }, { index?: number }>
) => {
  if (isCurrentSession(session)) {
    const { window: openedBrowserWin, tabs: openedBrowserTabs } =
      await openWindow(win, focused)
    if (openedBrowserWin) {
      const openedWindow = fromBrowserWindow({
        ...openedBrowserWin,
        tabs: openedBrowserTabs,
      })
      session.windows.push(openedWindow)
    }
  } else {
    const savedWindow = createSavedWindow(win)
    if (isDefined(index)) {
      session.windows.splice(index, 0, savedWindow)
    } else {
      session.windows.push(savedWindow)
    }
  }
  return session
}

export const removeWindow = async (
  session: CurrentSession | SavedSession,
  id: SessionWindow['id']
) => {
  const index = findWindowIndex(session.windows, id)
  if (isCurrentSession(session)) {
    await closeWindow(session.windows[index])
  }
  session.windows.splice(index, 1)
  return session
}

export const reorderWindows = (
  session: CurrentSession | SavedSession,
  fromIndex: number,
  toIndex: number
) => {
  session.windows = reorder(session.windows, fromIndex, toIndex)
  return session
}
