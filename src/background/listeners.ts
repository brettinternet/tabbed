import browser from 'webextension-polyfill'

import { updateLogLevel, log } from 'utils/logger'
import {
  MESSAGE_TYPE_RELOAD_ACTIONS,
  MESSAGE_TYPE_RELOAD_TAB_LISTENERS,
  MESSAGE_TYPE_UPDATE_LOG_LEVEL,
  MESSAGE_TYPE_RELOAD_CLOSED_WINDOW_LISTENER,
  MESSAGE_TYPE_UPDATE_POPOUT_POSITION,
} from 'utils/messages'
import type {
  ReloadActionsMessage,
  ReloadTabListenersMessage,
  UpdateLogLevelMessage,
  ReloadClosedWindowListenerMessage,
  UpdatePopoutPositionMessage,
} from 'utils/messages'
import type { Settings } from 'utils/settings'

import {
  updatePopoutPosition,
  loadExtensionActions,
  loadTabCountListeners,
} from './configuration'
// import { setupSearchListeners } from './search/listeners'
// import {
//   setupSessionListeners,
//   loadClosedWindowListener,
// } from './sessions/listeners'
import { setupUndoListeners } from './undo/listeners'

const logContext = 'background/listeners'

const setupConfigurationListeners = () => {
  browser.runtime.onMessage.addListener((message: ReloadActionsMessage) => {
    if (message.type === MESSAGE_TYPE_RELOAD_ACTIONS) {
      void loadExtensionActions(message.value)
    }
  })

  browser.runtime.onMessage.addListener(
    (message: ReloadTabListenersMessage) => {
      if (message.type === MESSAGE_TYPE_RELOAD_TAB_LISTENERS) {
        loadTabCountListeners(message.value)
      }
    }
  )

  browser.runtime.onMessage.addListener((message: UpdateLogLevelMessage) => {
    if (message.type === MESSAGE_TYPE_UPDATE_LOG_LEVEL) {
      void updateLogLevel(message.value)
    }
  })

  // browser.runtime.onMessage.addListener(
  //   (message: ReloadClosedWindowListenerMessage) => {
  //     if (message.type === MESSAGE_TYPE_RELOAD_CLOSED_WINDOW_LISTENER) {
  //       void loadClosedWindowListener(message.value)
  //     }
  //   }
  // )

  browser.runtime.onMessage.addListener(
    (message: UpdatePopoutPositionMessage) => {
      if (message.type === MESSAGE_TYPE_UPDATE_POPOUT_POSITION) {
        return updatePopoutPosition(message.value)
      }
    }
  )
}

export const setupListeners = (settings: Settings) => {
  log.debug(logContext, 'setupListeners()', settings)

  void setupConfigurationListeners()
  // void setupSessionListeners()
  void loadTabCountListeners(settings.showTabCountBadge)
  // void loadClosedWindowListener(settings.saveClosedWindows)
  // void setupSearchListeners()
  void setupUndoListeners()
}
