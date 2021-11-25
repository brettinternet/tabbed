import browser from 'webextension-polyfill'

import { isProd } from 'utils/env'
import { log } from 'utils/logger'
import {
  MESSAGE_TYPE_GET_SESSION_LISTS,
  MESSAGE_TYPE_SAVE_EXISTING_SESSION,
  MESSAGE_TYPE_SAVE_WINDOW,
  MESSAGE_TYPE_OPEN_SESSION,
  MESSAGE_TYPE_OPEN_SESSION_WINDOW,
  MESSAGE_TYPE_OPEN_SESSION_TAB,
  MESSAGE_TYPE_DELETE_SESSION,
  MESSAGE_TYPE_REMOVE_SESSION_WINDOW,
  MESSAGE_TYPE_REMOVE_SESSION_TAB,
  MESSAGE_TYPE_UPDATE_SESSION,
  MESSAGE_TYPE_PATCH_TAB,
  MESSAGE_TYPE_PATCH_WINDOW,
  MESSAGE_TYPE_DISCARD_TABS,
  MESSAGE_TYPE_MOVE_TABS,
  MESSAGE_TYPE_DOWNLOAD_SESSIONS,
  MESSAGE_TYPE_FIND_DUPLICATE_SESSION_TABS,
  MESSAGE_TYPE_IMPORT_SESSIONS_FROM_TEXT,
  MESSAGE_TYPE_GET_ALL_SESSIONS,
  MESSAGE_TYPE_QUERY_SESSION,
} from 'utils/messages'
import type {
  GetSessionListsMessage,
  QuerySessionMessage,
  SaveExistingSessionMessage,
  SaveWindowMessage,
  OpenSessionMessage,
  OpenSessionWindowMessage,
  OpenSessionTabMessage,
  DeleteSessionMessage,
  RemoveSessionWindowMessage,
  RemoveSessionTabMessage,
  UpdateSessionMessage,
  PatchWindowMessage,
  PatchTabMessage,
  DiscardTabsMessage,
  MoveTabsMessage,
  DownloadSessionsMessage,
  FindDuplicateSessionTabsMessage,
  ImportSessionsFromTextMessage,
  GetAllSessionsMessage,
} from 'utils/messages'
import type { Settings } from 'utils/settings'

import { updateSessionsDebounce } from './actions'
import { autoSaveSession, handleClosedWindow } from './autosave'
import { importSessionsFromText } from './create'
import { downloadSessions } from './export'
import { discardTabs, moveTabs } from './put'
import {
  getSessionLists,
  getAllSessions,
  findDuplicateSessionTabs,
  querySession,
} from './query'
import {
  undoableDeleteSession,
  undoableOpenSession,
  undoableOpenSessionTab,
  undoableOpenSessionWindow,
  undoablePatchTab,
  undoablePatchWindow,
  undoableRemoveTab,
  undoableRemoveWindow,
  undoableSaveExistingSession,
  undoableSaveWindowAsSession,
  undoableUpdateSession,
} from './undo-handlers'

const logContext = 'background/sessions/listeners'

export const loadClosedWindowListener = (
  saveClosedWindows: Settings['saveClosedWindows']
) => {
  log.debug(logContext, 'loadClosedWindowListener()', saveClosedWindows)

  if (saveClosedWindows) {
    browser.windows.onRemoved.addListener(handleClosedWindow)
  } else {
    browser.windows.onRemoved.removeListener(handleClosedWindow)
    browser.windows.onRemoved.addListener(updateSessionsDebounce)
  }
}

export const setupSessionListeners = () => {
  log.debug(logContext, 'setupSessionListeners()')

  // Don't auto save unless prod, else live reload clutters the previous sessions
  if (isProd) {
    void autoSaveSession()
  }

  browser.runtime.onMessage.addListener((message: GetSessionListsMessage) => {
    if (message.type === MESSAGE_TYPE_GET_SESSION_LISTS) {
      return getSessionLists()
    }
  })

  browser.runtime.onMessage.addListener((message: GetAllSessionsMessage) => {
    if (message.type === MESSAGE_TYPE_GET_ALL_SESSIONS) {
      return getAllSessions()
    }
  })

  browser.runtime.onMessage.addListener((message: QuerySessionMessage) => {
    if (message.type === MESSAGE_TYPE_QUERY_SESSION) {
      return querySession(message.value)
    }
  })

  browser.runtime.onMessage.addListener(
    (message: SaveExistingSessionMessage) => {
      if (message.type === MESSAGE_TYPE_SAVE_EXISTING_SESSION) {
        return undoableSaveExistingSession(message.value)
      }
    }
  )

  browser.runtime.onMessage.addListener((message: SaveWindowMessage) => {
    if (message.type === MESSAGE_TYPE_SAVE_WINDOW) {
      return undoableSaveWindowAsSession(message.value)
    }
  })

  browser.runtime.onMessage.addListener((message: UpdateSessionMessage) => {
    if (message.type === MESSAGE_TYPE_UPDATE_SESSION) {
      return undoableUpdateSession(message.value)
    }
  })

  browser.runtime.onMessage.addListener((message: OpenSessionMessage) => {
    if (message.type === MESSAGE_TYPE_OPEN_SESSION) {
      return undoableOpenSession(message.value)
    }
  })

  browser.runtime.onMessage.addListener((message: OpenSessionWindowMessage) => {
    if (message.type === MESSAGE_TYPE_OPEN_SESSION_WINDOW) {
      return undoableOpenSessionWindow(message.value)
    }
  })

  browser.runtime.onMessage.addListener((message: OpenSessionTabMessage) => {
    if (message.type === MESSAGE_TYPE_OPEN_SESSION_TAB) {
      return undoableOpenSessionTab(message.value)
    }
  })

  browser.runtime.onMessage.addListener((message: DeleteSessionMessage) => {
    if (message.type === MESSAGE_TYPE_DELETE_SESSION) {
      return undoableDeleteSession(message.value)
    }
  })

  browser.runtime.onMessage.addListener(
    (message: RemoveSessionWindowMessage) => {
      if (message.type === MESSAGE_TYPE_REMOVE_SESSION_WINDOW) {
        return undoableRemoveWindow(message.value)
      }
    }
  )

  browser.runtime.onMessage.addListener((message: RemoveSessionTabMessage) => {
    if (message.type === MESSAGE_TYPE_REMOVE_SESSION_TAB) {
      return undoableRemoveTab(message.value)
    }
  })

  browser.runtime.onMessage.addListener((message: PatchWindowMessage) => {
    if (message.type === MESSAGE_TYPE_PATCH_WINDOW) {
      return undoablePatchWindow(message.value)
    }
  })

  browser.runtime.onMessage.addListener((message: PatchTabMessage) => {
    if (message.type === MESSAGE_TYPE_PATCH_TAB) {
      return undoablePatchTab(message.value)
    }
  })

  browser.runtime.onMessage.addListener((message: DiscardTabsMessage) => {
    if (message.type === MESSAGE_TYPE_DISCARD_TABS) {
      return discardTabs(message.value.tabIds)
    }
  })

  browser.runtime.onMessage.addListener((message: MoveTabsMessage) => {
    if (message.type === MESSAGE_TYPE_MOVE_TABS) {
      return moveTabs(message.value)
    }
  })

  browser.runtime.onMessage.addListener((message: DownloadSessionsMessage) => {
    if (message.type === MESSAGE_TYPE_DOWNLOAD_SESSIONS) {
      return downloadSessions(message.value)
    }
  })

  browser.runtime.onMessage.addListener(
    (message: FindDuplicateSessionTabsMessage) => {
      if (message.type === MESSAGE_TYPE_FIND_DUPLICATE_SESSION_TABS) {
        return findDuplicateSessionTabs(message.value.sessionId)
      }
    }
  )

  browser.runtime.onMessage.addListener(
    (message: ImportSessionsFromTextMessage) => {
      if (message.type === MESSAGE_TYPE_IMPORT_SESSIONS_FROM_TEXT) {
        return importSessionsFromText(message.value.content)
      }
    }
  )

  browser.windows.onCreated.addListener(updateSessionsDebounce)
  browser.tabs.onUpdated.addListener(updateSessionsDebounce)
  browser.tabs.onDetached.addListener(updateSessionsDebounce)
  browser.tabs.onRemoved.addListener(updateSessionsDebounce)
  browser.tabs.onMoved.addListener(updateSessionsDebounce)
}
