import { debounce } from 'lodash'
import browser from 'webextension-polyfill'

import { throwSessionId, throwWindowId, throwTabId } from 'background/errors'
import { updateSessionMessage } from 'background/send'
import {
  focusWindow,
  focusWindowTab,
  getTabUrl,
  openTab,
  openWindow,
  openWindows,
} from 'utils/browser/query'
import { localStorageKeys } from 'utils/browser/storage'
import { log } from 'utils/logger'
import type { OpenWindowOptions, OpenTabOptions } from 'utils/messages'

import {
  getSessionLists,
  getCurrentSession,
  findSession,
  findWindow,
  findSessionWithKey,
} from './query'

const logContext = 'background/sessions'

export const updateSessions = async () => {
  log.debug(logContext, 'updateSessions')

  try {
    const sessions = await getSessionLists()
    await updateSessionMessage(sessions)
  } catch (err) {
    log.error(logContext, 'updateSessions', err)
  }
}
export const updateSessionsDebounce = debounce(updateSessions, 250)

export const openSession = async ({ sessionId }: { sessionId: string }) => {
  log.debug(logContext, 'openSession()', sessionId)

  const session = await findSession(sessionId)
  if (session) {
    const windowIds = await openWindows(session.windows)
    return windowIds
  } else {
    throwSessionId(sessionId)
  }
}

/**
 * If available, focus the window; Otherwise, open the window anew
 */
export const openSessionWindow = async ({
  sessionId,
  windowId,
  options,
}: {
  sessionId: string
  windowId: number
  options?: OpenWindowOptions
}) => {
  log.debug(logContext, 'openSessionWindow()', { sessionId, windowId, options })

  const currentSession = await getCurrentSession()
  if (!options?.noFocus && sessionId === currentSession?.id) {
    await focusWindow(windowId)
    return { windowId, created: false }
  } else {
    const session = await findSession(sessionId)
    if (session) {
      const win = findWindow(windowId, session)
      if (win) {
        const windowId = await openWindow(win)
        return { windowId, created: true }
      } else {
        throwWindowId(windowId)
      }
    } else {
      throwSessionId(sessionId)
    }
  }
}

export const openSessionTab = async ({
  sessionId,
  windowId,
  tabId,
  options,
}: {
  sessionId: string
  windowId: number
  tabId: number
  options?: OpenTabOptions
}) => {
  log.debug(logContext, 'openSessionTab()', {
    sessionId,
    windowId,
    tabId,
    options,
  })

  const { key, session } = await findSessionWithKey(sessionId)

  if (key && session) {
    if (!options?.noFocus && key === localStorageKeys.CURRENT_SESSION) {
      await focusWindowTab(windowId, tabId)
      const tab = await browser.tabs.get(tabId)
      return { tab, created: false }
    } else {
      const win = findWindow(windowId, session)
      if (win) {
        const tab = win.tabs?.find((t) => t.id === tabId)
        if (tab) {
          const url = getTabUrl(tab)
          if (url) {
            const newTab = await openTab({
              url,
              pinned: tab.pinned,
              incognito: win.incognito,
            })
            return { tab: newTab, created: true }
          } else {
            throw Error(`No tab url found for tab ID ${tabId}`)
          }
        } else {
          throwTabId(tabId)
        }
      } else {
        throwWindowId(windowId)
      }
    }
  } else {
    throwSessionId(sessionId)
  }
}
