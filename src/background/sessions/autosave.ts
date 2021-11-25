import browser from 'webextension-polyfill'

import {
  localStorageKeys,
  readSession,
  removeSession,
  readSettings,
} from 'utils/browser/storage'
import { log } from 'utils/logger'

import { updateSessionsDebounce } from './actions'
import { saveWindow, saveSession } from './create'
import { getCurrentSession } from './query'

const logContext = 'background/sessions/autosave'

/**
 * TODO: how to manage multiple closed windows on browser exit https://stackoverflow.com/a/3390760
 * In the meantime, we auto-save the current on startup in order to supplement on exit
 */
export const autoSaveSession = async (closedWindowId?: number) => {
  log.debug(logContext, 'autoSaveSession()', closedWindowId)

  const settings = await readSettings()
  let currentSession = await readSession(localStorageKeys.CURRENT_SESSION)

  if (closedWindowId !== undefined) {
    if (!currentSession) {
      currentSession = await getCurrentSession()
    }

    // if a window was closed
    const closedWindow = currentSession.windows.find(
      ({ id }) => id === closedWindowId
    )

    if (closedWindow && !(!settings.saveIncognito && closedWindow.incognito)) {
      // When tabs are moved they can trigger the closed window handler
      const currentTabIds = (await browser.tabs.query({}))?.map(({ id }) => id)
      closedWindow.tabs = closedWindow.tabs?.filter(
        (tab) => !currentTabIds.includes(tab.id)
      )
      if (closedWindow.tabs) {
        await saveWindow({
          key: localStorageKeys.PREVIOUS_SESSIONS,
          win: closedWindow,
        })
      }
      return
    }
  } else if (currentSession) {
    if (!settings.saveIncognito) {
      currentSession.windows = currentSession.windows.filter(
        (w) => !w.incognito
      )
    }

    // otherwise save the entire session
    // TODO: consolidate with browser.sessions.getRecentlyClosed() https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/sessions/getRecentlyClosed
    await saveSession({
      key: localStorageKeys.PREVIOUS_SESSIONS,
      session: currentSession,
      generateTitle: true,
    })
    await removeSession(localStorageKeys.CURRENT_SESSION)
  }
}

export const handleClosedWindow = async (closedWindowId: number) => {
  log.debug(logContext, 'handleClosedWindow()', closedWindowId)

  try {
    await autoSaveSession(closedWindowId)
    await updateSessionsDebounce()
  } catch (err) {
    log.error(logContext, 'handleClosedWindow', err)
  }
}
