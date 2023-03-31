import browser, { Runtime } from 'webextension-polyfill'

// import type { ToastOptions } from 'components/toast/store'
import { log } from 'utils/logger'
// import type { SearchSessionsResults } from 'background/search/sessions'
import type { Settings } from 'utils/settings'

import { isDefined, tryParse } from './helpers'

export type BaseMessage = { type: string; value?: unknown }

/**
 * Messages sent to all instances (background, clients, tabs, etc)
 */
export const broadcastMessage = <T extends BaseMessage, R = void>(
  type: T['type'],
  value?: T['value']
): Promise<R> => {
  log.debug('broadcastMessage()', type, tryParse(value))
  return browser.runtime.sendMessage({
    type,
    value,
  })
}

export const createBroadcastMessageListener = <
  T extends BaseMessage,
  C extends (value: T['value']) => void = (value: T['value']) => void
>(
  type: T['type'],
  handler: C,
  parse?: boolean
) => {
  const _handler = (message: T) => {
    if (message.type === type) {
      const { value } = message
      const parsedValue =
        parse && isDefined(value) ? JSON.parse(value as string) : value
      log.debug('message listener', type, parsedValue)
      return Promise.resolve(handler(parsedValue))
    }
  }

  browser.runtime.onMessage.addListener(_handler)
  return () => {
    browser.runtime.onMessage.removeListener(_handler)
  }
}

/**
 * Port messages sent to specific targets
 */
export const sendMessage = <T extends BaseMessage>(
  port: Runtime.Port | undefined,
  type: T['type'],
  value?: T['value']
): void => {
  log.debug('postMessage()', type, tryParse(value))
  if (port) {
    port.postMessage({
      type,
      value,
    })
  }
}

type MaybeValue<T> = T extends { value: unknown } ? [T['value']] : [undefined?]

/**
 * @note because value is not always required, but we want it to be when contained in T
 * something like this doesn't seem to work, so I had to use `...args`
 * T extends { value: unknown } ? T['value'] : undefined?
 */
export const createMessageAction =
  <T extends BaseMessage>(port: Runtime.Port | undefined, type: T['type']) =>
  (...[value]: MaybeValue<T>): void => {
    sendMessage(port, type, value)
  }

export const createPortMessageListener = <
  T extends BaseMessage,
  C extends (value: T['value']) => void = (value: T['value']) => void
>(
  port: Runtime.Port,
  type: T['type'],
  handler: C,
  parse?: boolean
) => {
  const _handler = (message: T) => {
    if (message.type === type) {
      const { value } = message
      const parsedValue = parse && value ? JSON.parse(value as string) : value
      log.debug('message listener', type, parsedValue)
      return Promise.resolve(handler(parsedValue))
    }
  }

  port.onMessage.addListener(_handler)
  return () => {
    port.onMessage.removeListener(_handler)
  }
}

type MessageWithValue<T, U = undefined> = {
  type: T
  value: U
}

type Message<T> = {
  type: T
}

/**
 * Handle background side effects when a setting is changed
 */
export const MESSAGE_TYPE_UPDATED_SETTING = 'updated_setting'
export type UpdatedSettingMessage = MessageWithValue<
  typeof MESSAGE_TYPE_UPDATED_SETTING,
  Partial<Settings>
>

/**
 * Tell client when current session has changed, e.g. tab closed, window focused, etc
 */
export const MESSAGE_TYPE_CURRENT_SESSION_CHANGE = 'current_session_change'
export type CurrentSessionChangeMessage = Message<
  typeof MESSAGE_TYPE_CURRENT_SESSION_CHANGE
>

export const MESSAGE_TYPE_SEARCH_SESSIONS = 'search_sessions'
export type SearchSessionsMessage = MessageWithValue<
  typeof MESSAGE_TYPE_SEARCH_SESSIONS,
  { text: string }
>
// export type SearchSessionsResponse = SearchSessionsResults

///////////////////

// session actions

// update selected from background
// export const MESSAGE_TYPE_UPDATE_SELECTED_SESSION_ID =
//   'update_selected_session_id'
// export type UpdateSelectedSessionIdMessage = MessageWithValue<
//   typeof MESSAGE_TYPE_UPDATE_SELECTED_SESSION_ID,
//   {
//     sessionId: Session['id']
//     category: SavedSessionCategoryType
//   }
// >

// // remove
// export const MESSAGE_TYPE_DELETE_SESSIONS = 'delete_sessions'
// export type DeleteSessionsMessage = MessageWithValue<
//   typeof MESSAGE_TYPE_DELETE_SESSIONS,
//   {
//     sessionId: Session['id']
//     category: SavedSessionCategoryType
//   }[]
// >

// export const MESSAGE_TYPE_REMOVE_SESSION_WINDOWS = 'remove_session_windows'
// export type RemoveSessionWindowsMessage = MessageWithValue<
//   typeof MESSAGE_TYPE_REMOVE_SESSION_WINDOWS
// >

// export const MESSAGE_TYPE_REMOVE_SESSION_TABS = 'remove_session_tabs'
// export type RemoveSessionTabsMessage = MessageWithValue<
//   typeof MESSAGE_TYPE_REMOVE_SESSION_TABS
// >

// // update
// export const MESSAGE_TYPE_UPDATE_SESSION = 'update_session'
// export type UpdateSessionMessage = MessageWithValue<
//   typeof MESSAGE_TYPE_UPDATE_SESSION,
//   { sessionId: Session['id']; title: string }
// >

// export type PatchWindowOptions = Pick<
//   Windows.UpdateUpdateInfoType,
//   'drawAttention' | 'focused' | 'state' | 'left' | 'top'
// >
// export const MESSAGE_TYPE_PATCH_WINDOW = 'patch_window'
// export type PatchWindowMessage = MessageWithValue<
//   typeof MESSAGE_TYPE_PATCH_WINDOW,
//   {
//     sessionId: Session['id']
//     windowId: SessionWindowData['id']
//     options: PatchWindowOptions
//   }
// >

// export const MESSAGE_TYPE_PATCH_TAB = 'patch_tab'
// export type PatchTabMessage = MessageWithValue<
//   typeof MESSAGE_TYPE_PATCH_TAB,
//   {
//     sessionId: Session['id']
//     windowId: SessionWindowData['id']
//     tabId: SessionTabData['id']
//     options: UpdateCurrentSessionTabData | UpdateSavedSessionTabData
//   }
// >

// // extra tab actions
// export const MESSAGE_TYPE_DISCARD_TABS = 'discard_tabs'
// export type DiscardTabsMessage = MessageWithValue<
//   typeof MESSAGE_TYPE_DISCARD_TABS,
//   {
//     sessionId: Session['id']
//     windowId: SessionWindowData['id']
//     tabIds: SessionTabData['id'][]
//   }
// >

// // search
// export const MESSAGE_TYPE_SEARCH_SESSIONS = 'search_sessions'
// export type SearchSessionsMessage = MessageWithValue<
//   typeof MESSAGE_TYPE_SEARCH_SESSIONS,
//   { text: string }
// >
// // export type SearchSessionsResponse = SearchSessionsResults

// // undo
// export const MESSAGE_TYPE_UNDO = 'undo'
// export type UndoMessage = Message<typeof MESSAGE_TYPE_UNDO>

// export const MESSAGE_TYPE_REDO = 'redo'
// export type RedoMessage = Message<typeof MESSAGE_TYPE_REDO>

// export const MESSAGE_TYPE_CAN_UNDO_REDO = 'can_undo_redo'
// export type CanUndoRedoMessage = Message<typeof MESSAGE_TYPE_CAN_UNDO_REDO>
// export type CanUndoRedoResponse = { undo: boolean; redo: boolean }

// // toast from background
// export const MESSAGE_TYPE_TOAST = 'toast'
// export type ToastMessage = MessageWithValue<
//   typeof MESSAGE_TYPE_TOAST,
//   ToastOptions
// >
