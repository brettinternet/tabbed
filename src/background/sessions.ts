import { debounce } from 'lodash'
import browser from 'webextension-polyfill'

import { handleMessageError } from 'utils/error'
import { SAVE_SESSIONS } from 'utils/flags'
import { log } from 'utils/logger'
import {
  CurrentSessionChangeMessage,
  MESSAGE_TYPE_CURRENT_SESSION_CHANGE,
  sendMessage,
} from 'utils/messages'
// import { SavedSession } from 'utils/session'
// import { SessionsManager } from 'utils/sessions-manager'
import { Settings } from 'utils/settings'

import { App } from './app'

const logContext = 'background/sessions'

/**
 * setup listener to handle closed windows
 */
// TODO: tell client to update or update session in background?
export const configureClosedWindowListener = ({
  saveIncognito,
  saveClosedWindows,
}: {
  saveIncognito: boolean
  saveClosedWindows: boolean
}) => {
  // Auto save closed windows
  const handleClosedWindow = async (closedWindowId: number) => {
    const win = browser.windows.get(closedWindowId)
    if (SAVE_SESSIONS) {
      // const closedWindow =
      //   sessionsManager.current.searchWindowByAssignedId(closedWindowId)
      // if (closedWindow && !(!saveIncognito && closedWindow.incognito)) {
      //   // When tabs are moved they can trigger the closed window handler
      //   const currentTabIds = (await browser.tabs.query({}))?.map(({ id }) => id)
      //   closedWindow.tabs = closedWindow.tabs.filter(
      //     (tab) => !currentTabIds.includes(tab.assignedTabId)
      //   )
      //   if (closedWindow.tabs.length) {
      //     await sessionsManager.addPrevious(
      //       SavedSession.from({
      //         windows: [closedWindow],
      //       })
      //     )
      //   }
      // }
    }
  }

  if (saveClosedWindows) {
    browser.windows.onRemoved.addListener(handleClosedWindow)
  } else {
    browser.windows.onRemoved.removeListener(handleClosedWindow)
  }
}

export const startBackgroundSessionListeners = async (
  initialSettings: Settings
) => {
  log.debug(logContext, 'startBackgroundSessionListeners()', initialSettings)
  configureClosedWindowListener(initialSettings)
}

const removeSessionListeners = (handler: () => void) => {
  browser.windows.onCreated.removeListener(handler)
  browser.windows.onRemoved.removeListener(handler)
  browser.windows.onFocusChanged.removeListener(handler)
  browser.tabs.onUpdated.addListener(handler)
  browser.tabs.onDetached.removeListener(handler)
  browser.tabs.onCreated.removeListener(handler)
  browser.tabs.onRemoved.removeListener(handler)
  browser.tabs.onMoved.removeListener(handler)
  browser.tabs.onActivated.removeListener(handler)
  browser.tabs.onHighlighted.removeListener(handler)
  browser.tabs.onReplaced.removeListener(handler)
}

const addSessionListeners = (handler: () => void) => {
  removeSessionListeners(handler)
  browser.windows.onCreated.addListener(handler)
  browser.windows.onRemoved.addListener(handler)
  browser.windows.onFocusChanged.addListener(handler)
  browser.tabs.onUpdated.addListener(handler)
  browser.tabs.onDetached.addListener(handler)
  browser.tabs.onCreated.addListener(handler)
  browser.tabs.onRemoved.addListener(handler)
  browser.tabs.onMoved.addListener(handler)
  browser.tabs.onActivated.addListener(handler)
  browser.tabs.onHighlighted.addListener(handler)
  browser.tabs.onReplaced.addListener(handler)
}

export const startClientSessionListeners = (app: App) => {
  log.debug(logContext, 'startClientSessionListeners()', app)

  const currentSessionChange = () => {
    for (const port of app.ports.values()) {
      try {
        sendMessage<CurrentSessionChangeMessage>(
          port,
          MESSAGE_TYPE_CURRENT_SESSION_CHANGE
        )
      } catch (err) {
        handleMessageError(err, port.name)
      }
    }
  }
  const debounceCurrentSessionChange = debounce(currentSessionChange, 250)
  const handleChange = () => {
    debounceCurrentSessionChange()
  }

  const hasClientConnections = app.ports.size !== 0
  if (hasClientConnections) {
    addSessionListeners(handleChange)
  }

  // Listen for window/tab changes in order to update current session when client is connected
  for (const port of app.ports.values()) {
    const cancel = () => {
      debounceCurrentSessionChange.cancel()
      removeSessionListeners(handleChange)
    }
    port.onDisconnect.addListener(cancel)
    window.addEventListener('unload', cancel)
  }
}
