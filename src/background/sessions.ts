import { debounce } from 'lodash'
import browser from 'webextension-polyfill'

import { handleMessageError } from 'utils/error'
import { log } from 'utils/logger'
import {
  CurrentSessionChangeMessage,
  MESSAGE_TYPE_CURRENT_SESSION_CHANGE,
  sendMessage,
} from 'utils/messages'
import { SavedSession } from 'utils/session'
import { SessionsManager } from 'utils/sessions-manager'
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
    console.log('win: ', win)
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

export const startClientSessionListeners = async (app: App) => {
  log.debug(logContext, 'startClientSessionListeners()', app)

  const hasClientConnections = app.clients.size !== 0

  // const currentSessionChange = async () => {
  //   try {
  //     await sendMessage<CurrentSessionChangeMessage>(
  //       MESSAGE_TYPE_CURRENT_SESSION_CHANGE
  //     )
  //   } catch (err) {
  //     handleMessageError(err)
  //   }
  // }
  // const debounceCurrentSessionChange = debounce(currentSessionChange, 250)

  // // Listen for window/tab changes in order to update current session when client is connected
  // if (clientConnected) {
  //   browser.windows.onCreated.addListener(debounceCurrentSessionChange)
  //   browser.windows.onRemoved.addListener(debounceCurrentSessionChange)
  //   browser.windows.onFocusChanged.addListener(debounceCurrentSessionChange)
  //   browser.tabs.onUpdated.addListener(debounceCurrentSessionChange)
  //   browser.tabs.onDetached.addListener(debounceCurrentSessionChange)
  //   browser.tabs.onCreated.addListener(debounceCurrentSessionChange)
  //   browser.tabs.onRemoved.addListener(debounceCurrentSessionChange)
  //   browser.tabs.onMoved.addListener(debounceCurrentSessionChange)
  //   browser.tabs.onActivated.addListener(debounceCurrentSessionChange)
  //   browser.tabs.onHighlighted.addListener(debounceCurrentSessionChange)
  //   browser.tabs.onReplaced.addListener(debounceCurrentSessionChange)
  // } else {
  //   browser.windows.onCreated.removeListener(debounceCurrentSessionChange)
  //   browser.windows.onRemoved.removeListener(debounceCurrentSessionChange)
  //   browser.windows.onFocusChanged.removeListener(debounceCurrentSessionChange)
  //   browser.tabs.onUpdated.addListener(debounceCurrentSessionChange)
  //   browser.tabs.onDetached.removeListener(debounceCurrentSessionChange)
  //   browser.tabs.onCreated.removeListener(debounceCurrentSessionChange)
  //   browser.tabs.onRemoved.removeListener(debounceCurrentSessionChange)
  //   browser.tabs.onMoved.removeListener(debounceCurrentSessionChange)
  //   browser.tabs.onActivated.removeListener(debounceCurrentSessionChange)
  //   browser.tabs.onHighlighted.removeListener(debounceCurrentSessionChange)
  //   browser.tabs.onReplaced.removeListener(debounceCurrentSessionChange)
  // }
}
