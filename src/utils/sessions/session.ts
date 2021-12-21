import { Type } from 'class-transformer'

import { closeWindow, getAllWindows } from 'utils/browser'
import { AppError } from 'utils/error'
import { isDefined, reorder } from 'utils/helpers'
import {
  CurrentSessionClass,
  CurrentSessionWindowData,
  SavedSessionClass,
  SavedSessionData,
  SessionData,
  SessionWindowData,
  StoredCurrentSessionData,
  UpdateCurrentSessionData,
  UpdateSavedSessionData,
} from 'utils/sessions/types'

import { createId } from './generate'
import { generateSessionTitle } from './generate'
import { SavedSessionTab } from './session-tab'
import { CurrentSessionWindow, SavedSessionWindow } from './session-window'

const logContext = 'background/sessions/session'

const findWindow = <T extends SessionWindowData>(
  windows: T[],
  id: T['id']
): T => {
  const win = windows.find((w) => w.id === id)
  if (!win) {
    throw new AppError(logContext, `Unable to find window by ID ${id}`)
  }

  return win
}

const findWindowIndex = <T extends SessionWindowData>(
  windows: T[],
  id: T['id']
): number => {
  const index = windows.findIndex((w) => w.id === id)
  if (index === -1) {
    throw new AppError(logContext, `Unable to find window by ID ${id}`)
  }

  return index
}

/**
 * Session with active windows/tabs
 */
export interface CurrentSession extends CurrentSessionClass {}
export class CurrentSession {
  @Type(() => CurrentSessionWindow)
  windows: CurrentSessionWindow[]

  constructor({
    title,
    windows,
    createdDate,
  }: Omit<SessionData<CurrentSessionWindow>, 'id' | 'lastModifiedDate'>) {
    const now = new Date()

    this.id = createId('session')
    this.title = title
    this.windows = windows
    this.createdDate = createdDate || now
    this.lastModifiedDate = now
  }

  static async fromBrowser({
    title,
    windowOrder,
    ...options
  }: Partial<
    Omit<
      SessionData<CurrentSessionWindow>,
      'id' | 'windows' | 'active' | 'status'
    > & {
      windowOrder: StoredCurrentSessionData['windows']
    }
  > = {}): Promise<CurrentSession> {
    const browserWindows = await getAllWindows({ populate: true }, true)
    const windows: CurrentSessionWindow[] =
      browserWindows.map<CurrentSessionWindow>((win) =>
        CurrentSessionWindow.fromWindow(win)
      )
    return new CurrentSession({
      windows: windowOrder
        ? CurrentSession.sortWindows(
            windows,
            windowOrder.map(({ assignedWindowId }) => assignedWindowId)
          )
        : windows,
      title: title || generateSessionTitle(windows),
      ...options,
    })
  }

  async updateFromBrowser() {
    const windows = await getAllWindows({ populate: true }, true)
    const updatedWindows = windows.map((win) => {
      return CurrentSessionWindow.fromWindow(
        win,
        isDefined(win.id)
          ? this.searchWindowByAssignedId(win.id)?.id
          : undefined
      )
    })
    this.windows = CurrentSession.sortWindows(
      updatedWindows,
      this.windows.map(({ assignedWindowId }) => assignedWindowId)
    )
    this.title = generateSessionTitle(this.windows)
  }

  static sortWindows(
    windows: CurrentSessionWindow[],
    ids: CurrentSessionWindow['assignedWindowId'][]
  ) {
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

  searchWindowByAssignedId(
    assignedWindowId: CurrentSessionWindowData['assignedWindowId']
  ) {
    return this.windows.find((w) => w.assignedWindowId === assignedWindowId)
  }

  findWindow(id: SessionWindowData['id']) {
    return findWindow(this.windows, id)
  }

  findWindowIndex(id: SessionWindowData['id']) {
    return findWindowIndex(this.windows, id)
  }

  async open() {
    const tasks = this.windows.map((win) => win.open())
    const results = await Promise.all(tasks)
    return results.filter(isDefined)
  }

  async addWindow({
    window: win,
    focused,
  }: {
    window: CurrentSessionWindow | SavedSessionWindow
    focused?: boolean
  }) {
    await win.open(focused)
  }

  update({ title }: UpdateCurrentSessionData) {
    this.title = title || this.title
    this.lastModifiedDate = new Date()
  }

  async removeWindow(id: SessionWindowData['id']) {
    const win = this.findWindow(id)
    await closeWindow(win.assignedWindowId)
  }

  reorderWindows(fromIndex: number, toIndex: number) {
    this.windows = reorder(this.windows, fromIndex, toIndex)
  }
}

/**
 * Saved session
 */
export interface SavedSession extends SavedSessionClass {}
export class SavedSession {
  @Type(() => SavedSessionWindow)
  windows: SavedSessionWindow[]

  constructor({
    title,
    windows,
    createdDate,
  }: Omit<
    SavedSessionData<SavedSessionWindow>,
    'id' | 'lastModifiedDate' | 'userSavedDate'
  >) {
    const now = new Date()

    this.id = createId('session')
    this.title = title
    this.windows = windows
    this.createdDate = createdDate || now
    this.lastModifiedDate = now
    this.userSavedDate = now
  }

  static from<T extends Omit<SessionData, 'id'>>(session: T): SavedSession {
    return new SavedSession({
      ...session,
      windows: session.windows.map(
        (win) =>
          new SavedSessionWindow({
            ...win,
            tabs: win.tabs.map((tab) => new SavedSessionTab(tab)),
          })
      ),
    })
  }

  async open() {
    const tasks = this.windows.map((win) => win.open())
    const results = await Promise.all(tasks)
    return results.filter(isDefined)
  }

  findWindow(id: SessionWindowData['id']) {
    return findWindow(this.windows, id)
  }

  findWindowIndex(id: SessionWindowData['id']) {
    return findWindowIndex(this.windows, id)
  }

  async addWindow({
    window: win,
    index,
  }: {
    window: SavedSessionWindow | CurrentSessionWindow
    index?: number
  }) {
    const savedWindow = SavedSessionWindow.from(win)
    if (isDefined(index)) {
      this.windows.splice(index, 0, savedWindow)
    } else {
      this.windows.push(savedWindow)
    }
    return savedWindow
  }

  update({ title }: UpdateSavedSessionData) {
    this.title = title || this.title
    this.lastModifiedDate = new Date()
  }

  removeWindow(id: SavedSessionWindow['id']) {
    const index = this.findWindowIndex(id)
    if (index === -1) {
      throw new AppError(logContext, `Unable to find window by ID ${id}`)
    }
    const [removed] = this.windows.splice(index, 1)
    return removed
  }

  reorderWindows(fromIndex: number, toIndex: number) {
    this.windows = reorder(this.windows, fromIndex, toIndex)
  }
}
