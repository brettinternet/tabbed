import { Tabs, Windows } from 'webextension-polyfill'

import type { ToastOptions } from 'components/toast/store'
// import type { SearchSessionsResults } from 'background/search/sessions'
import {
  SessionsManagerClass,
  SessionClass,
  SessionStatusType,
} from 'utils/sessions'
import type { SettingsOptions } from 'utils/settings'

type MessageWithValue<T, U = undefined> = {
  type: T
  value: U
}

type Message<T> = {
  type: T
}

// TODO: add detailed comments describing each message's usage

// settings
export const MESSAGE_TYPE_UPDATE_SETTINGS = 'update_settings'
export type UpdateSettingsMessage = MessageWithValue<
  typeof MESSAGE_TYPE_UPDATE_SETTINGS,
  Partial<SettingsOptions>
>

export const MESSAGE_TYPE_UPDATE_LOG_LEVEL = 'update_log_level'
export type UpdateLogLevelMessage = MessageWithValue<
  typeof MESSAGE_TYPE_UPDATE_LOG_LEVEL,
  boolean
>

export const MESSAGE_TYPE_UPDATE_POPOUT_POSITION = 'update_popout_position'
export type UpdatePopoutPositionMessage = MessageWithValue<
  typeof MESSAGE_TYPE_UPDATE_POPOUT_POSITION,
  SettingsOptions['popoutState']
>

// session list
export const MESSAGE_TYPE_PUSH_UPDATE_SESSION_LISTS =
  'push_update_session_lists'
export type PushUpdateSessionListsMessage = MessageWithValue<
  typeof MESSAGE_TYPE_PUSH_UPDATE_SESSION_LISTS,
  SessionsManagerClass
>

export const MESSAGE_TYPE_GET_SESSION_LISTS = 'get_session_lists'
export type GetSessionListsMessage = Message<
  typeof MESSAGE_TYPE_GET_SESSION_LISTS
>
export type GetSessionListsResponse = SessionsManagerClass

export const MESSAGE_TYPE_GET_ALL_SESSIONS = 'get_all_sessions'
export type GetAllSessionsMessage = Message<
  typeof MESSAGE_TYPE_GET_ALL_SESSIONS
>
export type GetAllSessionsResponse = SessionClass[]

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
export type QuerySessionResponse = SessionClass | undefined

// session actions

// update selected from background
export const MESSAGE_TYPE_UPDATE_SELECTED_SESSION_ID =
  'update_selected_session_id'
export type UpdateSelectedSessionIdMessage = MessageWithValue<
  typeof MESSAGE_TYPE_UPDATE_SELECTED_SESSION_ID,
  string
>

// save
export const MESSAGE_TYPE_SAVE_EXISTING_SESSION = 'save_existing_session'
export type SaveExistingSessionMessage = MessageWithValue<
  typeof MESSAGE_TYPE_SAVE_EXISTING_SESSION,
  { sessionId: string }
>

export const MESSAGE_TYPE_SAVE_WINDOW = 'save_window'
export type SaveWindowMessage = MessageWithValue<
  typeof MESSAGE_TYPE_SAVE_WINDOW,
  { sessionId: string; windowId: number }
>

// open
export const MESSAGE_TYPE_OPEN_SESSION = 'open_session'
export type OpenSessionMessage = MessageWithValue<
  typeof MESSAGE_TYPE_OPEN_SESSION,
  { sessionId: string }
>

export type OpenWindowOptions = {
  forceOpen?: boolean
}
export const MESSAGE_TYPE_OPEN_SESSION_WINDOW = 'open_session_window'
export type OpenSessionWindowMessage = MessageWithValue<
  typeof MESSAGE_TYPE_OPEN_SESSION_WINDOW,
  { sessionId: string; windowId: number; options?: OpenWindowOptions }
>

export type OpenTabOptions = {
  forceOpen?: boolean
}
export const MESSAGE_TYPE_OPEN_SESSION_TAB = 'open_session_tab'
export type OpenSessionTabMessage = MessageWithValue<
  typeof MESSAGE_TYPE_OPEN_SESSION_TAB,
  {
    sessionId: string
    windowId: number
    tabId: number
    options?: OpenTabOptions
  }
>

// remove
export const MESSAGE_TYPE_DELETE_SESSION = 'delete_session'
export type DeleteSessionMessage = MessageWithValue<
  typeof MESSAGE_TYPE_DELETE_SESSION,
  {
    sessionId: string
    status: Exclude<SessionStatusType, 'current'>
  }
>

export const MESSAGE_TYPE_REMOVE_SESSION_WINDOW = 'remove_session_window'
export type RemoveSessionWindowMessage = MessageWithValue<
  typeof MESSAGE_TYPE_REMOVE_SESSION_WINDOW,
  { sessionId: string; windowId: number }
>

export const MESSAGE_TYPE_REMOVE_SESSION_TAB = 'remove_session_tab'
export type RemoveSessionTabMessage = MessageWithValue<
  typeof MESSAGE_TYPE_REMOVE_SESSION_TAB,
  { sessionId: string; windowId: number; tabId: number }
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
    sessionId: string
    windowId: number
    tabIds: number | number[]
    index: Tabs.MoveMovePropertiesType['index']
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
