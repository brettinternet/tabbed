import { Type } from 'class-transformer'
import { v4 as uuidv4 } from 'uuid'

import { closeWindow, getAllWindows, openWindows } from 'background/browser'
import { isDefined } from 'utils/helpers'
import { AppError } from 'utils/logger'
import {
  SessionClass,
  SessionData,
  SessionStatus,
  UpdateSessionData,
} from 'utils/sessions'

import { generateSessionTitle } from './generate'
import { SessionWindow } from './session-window'

const logContext = 'utils/browser/session'

export interface Session extends SessionClass {}
export class Session {
  @Type(() => SessionWindow)
  windows: SessionWindow[]

  constructor({
    id,
    title,
    windows,
    createdDate,
    status,
    active = false,
  }: Omit<SessionData<SessionWindow>, 'id'> & { id?: string }) {
    const now = new Date()

    this.active = active
    this.id = id || this.newId()
    this.title = title
    this.windows = windows
    this.createdDate = createdDate || now
    this.lastModifiedDate = now
    this.status = status
  }

  static async createFromCurrentWindows(
    options?: Partial<
      Omit<SessionData<SessionWindow>, 'windows' | 'active' | 'status'>
    >
  ): Promise<Session> {
    const browserWindows = await getAllWindows({ populate: true }, true)
    const windows: SessionWindow[] = browserWindows.map<SessionWindow>((win) =>
      SessionWindow.fromWindow(win, true)
    )
    return new Session({
      windows,
      status: SessionStatus.CURRENT,
      active: true,
      title: generateSessionTitle(windows),
      ...options,
    })
  }

  async updateCurrentWindows() {
    if (this.status === SessionStatus.CURRENT) {
      const windows = await getAllWindows({ populate: true }, true)
      this.windows = windows.map((win) => SessionWindow.fromWindow(win, true))
      this.title = generateSessionTitle(this.windows)
    }
  }

  newId() {
    this.id = uuidv4()
    return this.id
  }

  async open() {
    const tasks = this.windows.map((win) => win.open())
    const results = await Promise.all(tasks)
    return results.filter(isDefined)
  }

  // addWindow(win: CreateWindowOptions) {
  //   new SessionWindow()
  // }

  findWindow(windowId: number) {
    return this.windows.find((w) => w.id === windowId)
  }

  findWindowIndex(windowId: number) {
    return this.windows.findIndex((w) => w.id === windowId)
  }

  update({ title, windows }: UpdateSessionData) {
    this.title = title || this.title
    this.windows = windows || this.windows
    this.lastModifiedDate = new Date()
  }

  removeWindow(windowId: number) {
    if (this.active) {
      closeWindow(windowId)
    } else {
      this.deleteWindow(windowId)
    }
  }

  private deleteWindow(windowId: number) {
    const index = this.findWindowIndex(windowId)
    if (index > -1) {
      this.windows.splice(index, 1)
    } else {
      new AppError({
        message: `Unable to find window by ID ${windowId}`,
        context: logContext,
      })
    }
  }
}
