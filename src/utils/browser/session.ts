import { Type } from 'class-transformer'
import { v4 as uuidv4 } from 'uuid'
import { Windows } from 'webextension-polyfill'

import { Valueof } from 'utils/helpers'
import { AppError } from 'utils/logger'

import { getAllWindows } from './query'
import { SessionWindow } from './session-window'

const logContext = 'utils/browser/session'

export const SessionStatus = {
  CURRENT: 'current',
  PREVIOUS: 'previous',
  SAVED: 'saved',
} as const

export type SessionStatusType = Valueof<typeof SessionStatus>

type CreateSessionOptions = {
  id?: string
  title?: string
  windows: Windows.Window[]
  createdDate?: Date
  lastModifiedDate?: string
  userSavedDate?: string
  status: SessionStatusType
  /**
   * Whether current session is the currently active session
   */
  active?: boolean
}

export type UpdateSessionOptions = Partial<{
  title?: string
  windows?: Windows.Window[]
}>

export class Session {
  id: string
  title?: string
  createdDate: Date
  status: SessionStatusType
  lastModifiedDate?: Date
  userSavedDate?: Date
  active: boolean

  @Type(() => SessionWindow)
  windows: SessionWindow[]

  constructor({
    id,
    title,
    windows,
    createdDate,
    status,
    active = false,
  }: CreateSessionOptions) {
    const now = new Date()

    this.active = active
    this.id = id || this.newId()
    this.title = title
    this.windows = this.mapWindows(windows)
    this.createdDate = createdDate || now
    this.lastModifiedDate = now
    this.status = status
  }

  newId() {
    this.id = uuidv4()
    return this.id
  }

  // add(win: CreateWindowOptions) {
  //   new SessionWindow()
  // }

  findWindow(windowId: number) {
    return this.windows.find((w) => w.id === windowId)
  }

  update({ title, windows }: UpdateSessionOptions) {
    if (title) {
      this.title = title
    }
    if (windows) {
      this.windows = this.mapWindows(windows)
    }
    this.lastModifiedDate = new Date()
  }

  delete(windowId: number) {
    const win = this.findWindow(windowId)
    if (win) {
    } else {
      new AppError({
        message: `Unable to find window by ID ${windowId}`,
        context: logContext,
      })
    }
  }

  mapWindows(windows: Windows.Window[]) {
    return windows.map((win) => SessionWindow.fromWindow(win, this.active))
  }

  async updateCurrentWindows() {
    if (this.status === SessionStatus.CURRENT) {
      const windows = await getAllWindows({ populate: true }, true)
      this.windows = this.mapWindows(windows)
    }
  }
}
