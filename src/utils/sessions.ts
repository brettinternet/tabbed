import { Windows } from 'webextension-polyfill'

import type { Session } from 'background/sessions/session'
import type { SessionTab } from 'background/sessions/session-tab'
import type { SessionWindow } from 'background/sessions/session-window'
import { Valueof } from 'utils/helpers'

/**
 * Tab data
 */
export type SessionTabData = {
  id: number
  url: string
  favIconUrl?: string
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

/**
 * Tab class interface with data
 */
export type SessionTabClass = SessionTabData

/**
 * Window data
 */
export type SessionWindowData<T extends SessionTabData = SessionTabData> = {
  id: number
  tabs: T[]
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

/**
 * Window class interface with data
 */
export type SessionWindowClass = SessionWindowData<SessionTab>

/**
 * Session categories, group together in session manager
 */
export const SessionStatus = {
  CURRENT: 'current',
  PREVIOUS: 'previous',
  SAVED: 'saved',
} as const

export type SessionStatusType = Valueof<typeof SessionStatus>

/**
 * Session data
 */
export type SessionData<T extends SessionWindowData = SessionWindowData> = {
  id: string
  title?: string
  windows: T[]
  createdDate?: Date
  lastModifiedDate?: Date
  userSavedDate?: Date
  status: SessionStatusType
  /**
   * Whether current session is the currently active session
   */
  active?: boolean
}

export type UpdateSessionData = Partial<
  Pick<SessionData<SessionWindow>, 'title' | 'windows'>
>

/**
 * Session class interface with data
 */
export type SessionClass = SessionData<SessionWindow>

/**
 * Session manager data, collection of sessions
 */
export type SessionsManagerData<T extends SessionData = SessionData> = {
  current: T
  saved: T[]
  previous: T[]
}

/**
 * Session manager class interface
 */
export type SessionsManagerClass = SessionsManagerData<Session>

export type SessionDataExport = {
  exportedDate: Date
  sessions: Session[]
}
