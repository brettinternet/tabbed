import { Tabs, Windows } from 'webextension-polyfill'

import { PartialBy, Valueof } from 'utils/helpers'

import type { CurrentSession, SavedSession } from './session'
import type { CurrentSessionTab, SavedSessionTab } from './session-tab'
import type { CurrentSessionWindow, SavedSessionWindow } from './session-window'

/**
 * Session manager data, collection of sessions
 */
export type SessionsManagerData<
  C extends SessionData = SessionData,
  T extends SessionData = SessionData
> = {
  current: C
  saved: T[]
  previous: T[]
}

/**
 * Session manager class interface
 */
export type SessionsManagerClass = SessionsManagerData<
  CurrentSession,
  SavedSession
>

export type SessionDataExport = {
  exportedDate: Date
  sessions: SessionData[]
}
