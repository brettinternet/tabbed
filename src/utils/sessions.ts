import { Windows } from 'webextension-polyfill'

import type { Session } from 'background/sessions/session'
import type { SessionTab } from 'background/sessions/session-tab'
import type { SessionWindow } from 'background/sessions/session-window'
import { Valueof } from 'utils/helpers'

export type SessionTabData = {
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

export type SessionTabClass = SessionTabData

export type SessionWindowData = {
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

export type SessionWindowClass = SessionWindowData

export const SessionStatus = {
  CURRENT: 'current',
  PREVIOUS: 'previous',
  SAVED: 'saved',
} as const

export type SessionStatusType = Valueof<typeof SessionStatus>

export type SessionData = {
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

export type UpdateSessionData = Partial<Pick<SessionData, 'title' | 'windows'>>

export type SessionClass = SessionData & {
  id: string
}

export type SessionsManagerData = {
  current: Session
  saved: Session[]
  previous: Session[]
}

export type SessionsManagerClass = SessionsManagerData

export type SessionDataExport = {
  exportedDate: Date
  sessions: Session[]
}
