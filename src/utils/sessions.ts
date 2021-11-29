import { Windows } from 'webextension-polyfill'

import type { Session } from 'background/sessions/session'
import type { SessionTab } from 'background/sessions/session-tab'
import type { SessionWindow } from 'background/sessions/session-window'
import { Valueof } from 'utils/helpers'

export type SessionTabOptions = {
  id: number
  url: string
  title?: string
  windowId: number
  active: boolean
  pinned: boolean
  muted: boolean
  discarded: boolean
  attention: boolean
  groupId?: number
  incognito: boolean
  activeSession: boolean
}

export type SessionTabClass = SessionTabOptions

export type SessionWindowOptions = {
  id: number
  tabs: SessionTab[]
  title?: string
  incognito: boolean
  focused: boolean
  state: Windows.WindowState
  height: number | undefined
  width: number | undefined
  top: number | undefined
  left: number | undefined
  /**
   * Whether window is part of an active session
   */
  activeSession: boolean
}

export type SessionWindowClass = SessionWindowOptions

export const SessionStatus = {
  CURRENT: 'current',
  PREVIOUS: 'previous',
  SAVED: 'saved',
} as const

export type SessionStatusType = Valueof<typeof SessionStatus>

export type SessionOptions = {
  id?: string
  title?: string
  windows: SessionWindow[]
  createdDate?: Date
  lastModifiedDate?: Date
  userSavedDate?: Date
  status: SessionStatusType
  /**
   * Whether current session is the currently active session
   */
  active?: boolean
}

export type UpdateSessionOptions = Partial<
  Pick<SessionOptions, 'title' | 'windows'>
>

export type SessionClass = SessionOptions & {
  id: string
}

export type SessionsManagerOptions = {
  current: Session
  saved: Session[]
  previous: Session[]
}

export type SessionsManagerClass = SessionsManagerOptions

export type SessionDataExport = {
  exportedDate: Date
  sessions: Session[]
}
