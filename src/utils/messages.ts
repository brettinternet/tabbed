import browser from 'webextension-polyfill'
import { Tabs, Windows } from 'webextension-polyfill'

import type { ToastOptions } from 'components/toast/store'
// import type { SearchSessionsResults } from 'background/search/sessions'
import {
  SessionsManagerData,
  SessionData,
  SessionStatusType,
} from 'utils/sessions'
import type { SettingsData } from 'utils/settings'

export const sendMessage = <
  T extends { type: string; value?: unknown },
  R = void
>(
  type: T['type'],
  value?: T['value']
): Promise<R> => {
  return browser.runtime.sendMessage({
    type,
    value,
  })
}

type MaybeValue<T> = T extends { value: unknown } ? [T['value']] : [undefined?]

/**
 * @note because value is not always required, but we want it to be when contained in T
 * something like this doesn't seem to work, so I had to use `...args`
 * T extends { value: unknown } ? T['value'] : undefined?
 */
export const createMessageAction =
  <T extends { type: string; value?: unknown }, R = void>(
    type: T['type'],
    parse?: boolean
  ) =>
  async (...[value]: MaybeValue<T>): Promise<R> => {
    const maybeResponse = await browser.runtime.sendMessage({
      type,
      value,
    })
    return parse && maybeResponse
      ? JSON.parse(maybeResponse as unknown as string)
      : maybeResponse
  }

export const createMessageListener = <
  T extends { value?: unknown; type: string },
  C extends (value: T['value']) => void = (value: T['value']) => void
>(
  type: T['type'],
  handler: C,
  parse?: boolean
) => {
  browser.runtime.onMessage.addListener((message: T) => {
    if (message.type === type) {
      const { value } = message
      return Promise.resolve(
        handler(parse && value ? JSON.parse(value as string) : value)
      )
    }
  })
}

type MessageWithValue<T, U = undefined> = {
  type: T
  value: U
}

type Message<T> = {
  type: T
}

// TODO: add detailed comments describing each message's usage

// settings
export const MESSAGE_TYPE_GET_SETTINGS = 'get_settings'
export type GetSettingsMessage = Message<typeof MESSAGE_TYPE_GET_SETTINGS>
export type GetSettingsResponse = SettingsData

// huh? when?
export const MESSAGE_TYPE_PUSH_SETTINGS = 'push_settings'
export type PushSettingsMessage = MessageWithValue<
  typeof MESSAGE_TYPE_PUSH_SETTINGS,
  SettingsData
>

export const MESSAGE_TYPE_UPDATE_SETTINGS = 'update_settings'
export type UpdateSettingsMessage = MessageWithValue<
  typeof MESSAGE_TYPE_UPDATE_SETTINGS,
  Partial<SettingsData>
>
export type UpdateSettingsResponse = SettingsData

// session list
export const MESSAGE_TYPE_GET_SESSIONS_MANAGER_DATA =
  'get_sessions_manager_data'
export type GetSessionsManagerDataMessage = Message<
  typeof MESSAGE_TYPE_GET_SESSIONS_MANAGER_DATA
>
export type GetSessionListsResponse = SessionsManagerData

export const MESSAGE_TYPE_PUSH_SESSIONS_MANAGER_DATA =
  'push_sessions_manager_data'
export type PushSessionManagerDataMessage<T = string> = MessageWithValue<
  typeof MESSAGE_TYPE_PUSH_SESSIONS_MANAGER_DATA,
  T // stringified `SessionsManagerData`
>

export const MESSAGE_TYPE_GET_ALL_SESSIONS = 'get_all_sessions'
export type GetAllSessionsMessage = Message<
  typeof MESSAGE_TYPE_GET_ALL_SESSIONS
>
export type GetAllSessionsResponse = SessionData[]

// query sessions
export type SessionQuery = {
  current?: boolean
  sessionId?: string
}
export const MESSAGE_TYPE_QUERY_SESSION = 'query_session'
export type QuerySessionMessage = MessageWithValue<
  typeof MESSAGE_TYPE_QUERY_SESSION,
  SessionQuery
>
export type QuerySessionResponse = SessionData | undefined

// session actions

// update selected from background
export const MESSAGE_TYPE_UPDATE_SELECTED_SESSION_ID =
  'update_selected_session_id'
export type UpdateSelectedSessionIdMessage = MessageWithValue<
  typeof MESSAGE_TYPE_UPDATE_SELECTED_SESSION_ID,
  {
    sessionId: string
    status: Exclude<SessionStatusType, 'current'>
  }
>

// save
export const MESSAGE_TYPE_SAVE_EXISTING_SESSION = 'save_existing_session'
export type SaveExistingSessionMessage = MessageWithValue<
  typeof MESSAGE_TYPE_SAVE_EXISTING_SESSION,
  { sessionId: string }
>

export const MESSAGE_TYPE_SAVE_WINDOWS = 'save_windows'
export type SaveWindowsMessage = MessageWithValue<
  typeof MESSAGE_TYPE_SAVE_WINDOWS,
  { sessionId: string; windowIds: number[] }
>

// open
export const MESSAGE_TYPE_OPEN_SESSIONS = 'open_sessions'
export type OpenSessionsMessage = MessageWithValue<
  typeof MESSAGE_TYPE_OPEN_SESSIONS,
  { sessionIds: string[] }
>

export type OpenWindowOptions = {
  forceOpen?: boolean
}
export const MESSAGE_TYPE_OPEN_SESSION_WINDOWS = 'open_session_windows'
export type OpenSessionWindowsMessage = MessageWithValue<
  typeof MESSAGE_TYPE_OPEN_SESSION_WINDOWS,
  { sessionId: string; windowIds: number[]; options?: OpenWindowOptions }
>

export type OpenTabOptions = {
  forceOpen?: boolean
}
export const MESSAGE_TYPE_OPEN_SESSION_TABS = 'open_session_tabs'
export type OpenSessionTabsMessage = MessageWithValue<
  typeof MESSAGE_TYPE_OPEN_SESSION_TABS,
  {
    sessionId: string
    tabs: { windowId: number; tabIds: number[] }[]
    options?: OpenTabOptions
  }
>

// remove
export const MESSAGE_TYPE_DELETE_SESSIONS = 'delete_sessions'
export type DeleteSessionsMessage = MessageWithValue<
  typeof MESSAGE_TYPE_DELETE_SESSIONS,
  {
    sessionId: string
    status: Exclude<SessionStatusType, 'current'>
  }[]
>

export const MESSAGE_TYPE_REMOVE_SESSION_WINDOWS = 'remove_session_windows'
export type RemoveSessionWindowsMessage = MessageWithValue<
  typeof MESSAGE_TYPE_REMOVE_SESSION_WINDOWS,
  { sessionId: string; windowIds: number[] }
>

export const MESSAGE_TYPE_REMOVE_SESSION_TABS = 'remove_session_tabs'
export type RemoveSessionTabsMessage = MessageWithValue<
  typeof MESSAGE_TYPE_REMOVE_SESSION_TABS,
  { sessionId: string; tabs: { windowId: number; tabIds: number[] }[] }
>

// update
export const MESSAGE_TYPE_UPDATE_SESSION = 'update_session'
export type UpdateSessionMessage = MessageWithValue<
  typeof MESSAGE_TYPE_UPDATE_SESSION,
  { sessionId: string; title: string }
>

export type PatchWindowOptions = Pick<
  Windows.UpdateUpdateInfoType,
  'drawAttention' | 'focused' | 'state' | 'left' | 'top'
>
export const MESSAGE_TYPE_PATCH_WINDOW = 'patch_window'
export type PatchWindowMessage = MessageWithValue<
  typeof MESSAGE_TYPE_PATCH_WINDOW,
  { sessionId: string; windowId: number; options: PatchWindowOptions }
>

export const MESSAGE_TYPE_MOVE_WINDOWS = 'move_windows'
export type MoveWindowsMessage = MessageWithValue<
  typeof MESSAGE_TYPE_MOVE_WINDOWS,
  {
    from: {
      sessionId: string
      windowIds: number[]
    }
    to: {
      sessionId: string
      index: number
    }
  }
>

export type PatchTabOptions = Pick<
  Tabs.UpdateUpdatePropertiesType,
  'url' | 'active' | 'highlighted' | 'pinned' | 'muted'
>
export const MESSAGE_TYPE_PATCH_TAB = 'patch_tab'
export type PatchTabMessage = MessageWithValue<
  typeof MESSAGE_TYPE_PATCH_TAB,
  {
    sessionId: string
    windowId: number
    tabId: number
    options: PatchTabOptions
  }
>

// extra tab actions
export const MESSAGE_TYPE_MOVE_TABS = 'move_tabs'
export type MoveTabsMessage = MessageWithValue<
  typeof MESSAGE_TYPE_MOVE_TABS,
  {
    from: {
      sessionId: string
      windowId: number
      tabIds: number[]
    }
    to: {
      sessionId: string
      windowId: number
      index: Tabs.MoveMovePropertiesType['index']
    }
  }
>

export const MESSAGE_TYPE_DISCARD_TABS = 'discard_tabs'
export type DiscardTabsMessage = MessageWithValue<
  typeof MESSAGE_TYPE_DISCARD_TABS,
  { sessionId: string; windowId: number; tabIds: number | number[] }
>

export const MESSAGE_TYPE_FIND_DUPLICATE_SESSION_TABS =
  'find_duplicate_session_tabs'
export type FindDuplicateSessionTabsMessage = MessageWithValue<
  typeof MESSAGE_TYPE_FIND_DUPLICATE_SESSION_TABS,
  { sessionId: string }
>
export type FindDuplicateSessionTabsResponse = string[] // urls

// download/backup
export type DownloadSessionsOptions = {
  sessionIds?: string[]
}
export const MESSAGE_TYPE_DOWNLOAD_SESSIONS = 'download_sessions'
export type DownloadSessionsMessage = MessageWithValue<
  typeof MESSAGE_TYPE_DOWNLOAD_SESSIONS,
  DownloadSessionsOptions
>

export const MESSAGE_TYPE_IMPORT_SESSIONS_FROM_TEXT =
  'import_sessions_from_text'
export type ImportSessionsFromTextMessage = MessageWithValue<
  typeof MESSAGE_TYPE_IMPORT_SESSIONS_FROM_TEXT,
  { content: string }
>

// search
export const MESSAGE_TYPE_SEARCH_SESSIONS = 'search_sessions'
export type SearchSessionsMessage = MessageWithValue<
  typeof MESSAGE_TYPE_SEARCH_SESSIONS,
  { text: string }
>
// export type SearchSessionsResponse = SearchSessionsResults

// undo
export const MESSAGE_TYPE_UNDO = 'undo'
export type UndoMessage = Message<typeof MESSAGE_TYPE_UNDO>

export const MESSAGE_TYPE_REDO = 'redo'
export type RedoMessage = Message<typeof MESSAGE_TYPE_REDO>

export const MESSAGE_TYPE_CAN_UNDO_REDO = 'can_undo_redo'
export type CanUndoRedoMessage = Message<typeof MESSAGE_TYPE_CAN_UNDO_REDO>
export type CanUndoRedoResponse = { undo: boolean; redo: boolean }

// toast from background
export const MESSAGE_TYPE_TOAST = 'toast'
export type ToastMessage = MessageWithValue<
  typeof MESSAGE_TYPE_TOAST,
  ToastOptions
>
