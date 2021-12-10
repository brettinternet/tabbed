import browser from 'webextension-polyfill'

import { Settings } from 'background/app/settings'
import { focusWindow, focusWindowTab } from 'background/browser'
import { reorder } from 'utils/helpers'
import {
  MESSAGE_TYPE_GET_SESSIONS_MANAGER_DATA,
  GetSessionsManagerDataMessage,
  MESSAGE_TYPE_SAVE_EXISTING_SESSION,
  SaveExistingSessionMessage,
  MESSAGE_TYPE_SAVE_WINDOWS,
  SaveWindowsMessage,
  MESSAGE_TYPE_OPEN_SESSIONS,
  OpenSessionsMessage,
  MESSAGE_TYPE_OPEN_SESSION_WINDOWS,
  OpenSessionWindowsMessage,
  MESSAGE_TYPE_OPEN_SESSION_TABS,
  OpenSessionTabsMessage,
  MESSAGE_TYPE_DELETE_SESSIONS,
  DeleteSessionsMessage,
  MESSAGE_TYPE_REMOVE_SESSION_WINDOWS,
  RemoveSessionWindowsMessage,
  MESSAGE_TYPE_REMOVE_SESSION_TABS,
  RemoveSessionTabsMessage,
  MESSAGE_TYPE_UPDATE_SESSION,
  UpdateSessionMessage,
  MESSAGE_TYPE_PATCH_WINDOW,
  PatchWindowMessage,
  MESSAGE_TYPE_PATCH_TAB,
  PatchTabMessage,
  MESSAGE_TYPE_DISCARD_TABS,
  DiscardTabsMessage,
  MESSAGE_TYPE_MOVE_TABS,
  MoveTabsMessage, //
  // MESSAGE_TYPE_MOVE_WINDOWS,
  // MoveWindowsMessage,
  MESSAGE_TYPE_DOWNLOAD_SESSIONS,
  DownloadSessionsMessage,
  MESSAGE_TYPE_FIND_DUPLICATE_SESSION_TABS,
  FindDuplicateSessionTabsMessage,
  MESSAGE_TYPE_IMPORT_SESSIONS_FROM_TEXT,
  ImportSessionsFromTextMessage,
  MESSAGE_TYPE_QUERY_SESSION,
  QuerySessionMessage,
} from 'utils/messages'
import { SessionDataExport, SessionStatus } from 'utils/sessions'
import { SettingsData } from 'utils/settings'

import { Session } from './session'
import { SessionsManager } from './sessions-manager'

/**
 * setup listener to handle closed windows
 */
export const configureClosedWindowListener = (
  { saveIncognito, saveClosedWindows }: SettingsData,
  sessionsManager: SessionsManager
) => {
  // Auto save closed windows
  const handleClosedWindow = async (closedWindowId: number) => {
    const closedWindow = sessionsManager.current.findWindow(closedWindowId)
    if (closedWindow && !(!saveIncognito && closedWindow.incognito)) {
      // When tabs are moved they can trigger the closed window handler
      const currentTabIds = (await browser.tabs.query({}))?.map(({ id }) => id)
      closedWindow.tabs = closedWindow.tabs.filter(
        (tab) => !currentTabIds.includes(tab.id)
      )
      if (closedWindow.tabs.length) {
        await sessionsManager.addPrevious(
          new Session({
            windows: [closedWindow],
            status: SessionStatus.PREVIOUS,
          })
        )
      }
    }
  }

  if (saveClosedWindows) {
    browser.windows.onRemoved.addListener(handleClosedWindow)
  } else {
    const updateCurrent = async () => {
      await sessionsManager.updateCurrentDebounce()
    }

    browser.windows.onRemoved.removeListener(handleClosedWindow)
    browser.windows.onRemoved.addListener(updateCurrent)
  }
}

export const startListeners = async (
  sessionsManager: SessionsManager,
  settings: Settings
) => {
  configureClosedWindowListener(settings, sessionsManager)

  const updateCurrent = async () => {
    await sessionsManager.updateCurrentDebounce()
  }

  browser.windows.onCreated.addListener(updateCurrent)
  browser.windows.onFocusChanged.addListener(updateCurrent)
  browser.tabs.onUpdated.addListener(updateCurrent)
  browser.tabs.onDetached.addListener(updateCurrent)
  browser.tabs.onCreated.addListener(updateCurrent)
  browser.tabs.onRemoved.addListener(updateCurrent)
  browser.tabs.onMoved.addListener(updateCurrent)
  browser.tabs.onActivated.addListener(updateCurrent)
  browser.tabs.onHighlighted.addListener(updateCurrent)
  browser.tabs.onReplaced.addListener(updateCurrent)
  browser.tabs.onAttached.addListener(updateCurrent)

  browser.runtime.onMessage.addListener(
    (message: GetSessionsManagerDataMessage) => {
      if (message.type === MESSAGE_TYPE_GET_SESSIONS_MANAGER_DATA) {
        return Promise.resolve(sessionsManager.toJSON())
      }
    }
  )

  browser.runtime.onMessage.addListener((message: QuerySessionMessage) => {
    if (message.type === MESSAGE_TYPE_QUERY_SESSION) {
      const { current, sessionId } = message.value
      return new Promise((resolve) => {
        if (current) {
          return resolve(sessionsManager.current)
        } else if (sessionId) {
          return resolve(sessionsManager.get(sessionId))
        } else {
          // TODO: send toast to frontend
        }
      })
    }
  })

  browser.runtime.onMessage.addListener(
    (message: SaveExistingSessionMessage) => {
      if (message.type === MESSAGE_TYPE_SAVE_EXISTING_SESSION) {
        return new Promise((resolve) => {
          const { sessionId } = message.value
          const session = sessionsManager.get(sessionId)
          return resolve(sessionsManager.addSaved(session))
        })
      }
    }
  )

  browser.runtime.onMessage.addListener((message: SaveWindowsMessage) => {
    if (message.type === MESSAGE_TYPE_SAVE_WINDOWS) {
      const { sessionId, windowIds } = message.value
      return new Promise(async (resolve) => {
        const session = sessionsManager.get(sessionId)
        const windows = session.windows.filter(({ id }) =>
          windowIds.includes(id)
        )
        const newSession = new Session({
          windows,
          status: SessionStatus.SAVED,
        })
        await sessionsManager.addSaved(newSession)
        resolve(newSession)
      })
    }
  })

  // TODO: update session windows here on frontend
  browser.runtime.onMessage.addListener((message: UpdateSessionMessage) => {
    if (message.type === MESSAGE_TYPE_UPDATE_SESSION) {
      return new Promise(async (resolve) => {
        const { sessionId, title } = message.value
        const session = sessionsManager.get(sessionId)
        session.update({ title })
        await sessionsManager.handleChange()
        resolve(session)
      })
    }
  })

  browser.runtime.onMessage.addListener((message: OpenSessionsMessage) => {
    if (message.type === MESSAGE_TYPE_OPEN_SESSIONS) {
      return new Promise(async (resolve) => {
        const tasks = message.value.sessionIds.map(async (sessionId) => {
          const session = sessionsManager.get(sessionId)
          return await session.open()
        })
        resolve(await Promise.all(tasks))
      })
    }
  })

  browser.runtime.onMessage.addListener(
    (message: OpenSessionWindowsMessage) => {
      if (message.type === MESSAGE_TYPE_OPEN_SESSION_WINDOWS) {
        return new Promise(async (resolve) => {
          const { sessionId, windowIds, options } = message.value
          const session = sessionsManager.get(sessionId)
          const tasks = windowIds.map(async (windowId) => {
            if (
              !options?.forceOpen &&
              sessionsManager.current.id === session.id
            ) {
              return await focusWindow(windowId)
            } else {
              const win = session.findWindow(windowId)
              return await win.open()
            }
          })
          resolve(await Promise.all(tasks))
        })
      }
    }
  )

  browser.runtime.onMessage.addListener((message: OpenSessionTabsMessage) => {
    if (message.type === MESSAGE_TYPE_OPEN_SESSION_TABS) {
      return new Promise(async (resolve) => {
        const { sessionId, tabs, options } = message.value
        const session = sessionsManager.get(sessionId)
        const tasks: Promise<void>[] = []
        tabs.forEach(({ windowId, tabIds }) => {
          if (
            !options?.forceOpen &&
            sessionsManager.current.id === session.id
          ) {
            tabIds.forEach((tabId) => {
              tasks.push(focusWindowTab(windowId, tabId))
            })
          } else {
            const win = session.findWindow(windowId)
            tabIds.forEach((tabId) => {
              const tab = win.findTab(tabId)
              tasks.push(tab.open())
            })
          }
        })
        resolve(await Promise.all(tasks))
      })
    }
  })

  browser.runtime.onMessage.addListener((message: DeleteSessionsMessage) => {
    if (message.type === MESSAGE_TYPE_DELETE_SESSIONS) {
      return new Promise(async (resolve) => {
        const tasks = message.value.map(async ({ sessionId, status }) =>
          sessionsManager.delete(sessionId, status)
        )
        resolve(await Promise.all(tasks))
      })
    }
  })

  browser.runtime.onMessage.addListener(
    (message: RemoveSessionWindowsMessage) => {
      if (message.type === MESSAGE_TYPE_REMOVE_SESSION_WINDOWS) {
        return new Promise(async (resolve) => {
          const { sessionId, windowIds } = message.value
          const session = sessionsManager.get(sessionId)
          // todo save after
          const tasks = windowIds.map(async (windowId) =>
            session.removeWindow(windowId)
          )
          resolve(await Promise.all(tasks))
        })
      }
    }
  )

  browser.runtime.onMessage.addListener((message: RemoveSessionTabsMessage) => {
    if (message.type === MESSAGE_TYPE_REMOVE_SESSION_TABS) {
      return new Promise(async (resolve) => {
        const { sessionId, tabs } = message.value
        const session = sessionsManager.get(sessionId)
        const tasks: Promise<void>[] = []
        tabs.forEach(({ windowId, tabIds }) => {
          const win = session.findWindow(windowId)
          tabIds.forEach((tabId) => {
            tasks.push(win.removeTab(tabId))
          })
        })
        resolve(await Promise.all(tasks))
      })
    }
  })

  // TODO: consolidate options with class update options - probably separate current into new handler
  // update session after patch with handleChange()
  browser.runtime.onMessage.addListener((message: PatchWindowMessage) => {
    if (message.type === MESSAGE_TYPE_PATCH_WINDOW) {
      return new Promise(async (resolve) => {
        const { sessionId, windowId, options } = message.value
        const session = sessionsManager.get(sessionId)
        if (session.id === sessionsManager.current.id) {
          resolve(await browser.windows.update(windowId, options))
        } else {
          const win = session.findWindow(windowId)
          resolve(win.update(options))
        }
      })
    }
  })

  // TODO: consolidate options with class update options - probably separate current into new handler
  browser.runtime.onMessage.addListener((message: PatchTabMessage) => {
    if (message.type === MESSAGE_TYPE_PATCH_TAB) {
      return new Promise(async (resolve) => {
        const { sessionId, windowId, tabId, options } = message.value
        const session = sessionsManager.get(sessionId)
        if (session.id === sessionsManager.current.id) {
          await browser.tabs.update(tabId, options)
        } else {
          const win = session.findWindow(windowId)
          const tab = win.findTab(tabId)
          resolve(tab.update(options))
        }
        // send update
      })
    }
  })

  browser.runtime.onMessage.addListener((message: DiscardTabsMessage) => {
    if (message.type === MESSAGE_TYPE_DISCARD_TABS) {
      return new Promise(async (resolve) => {
        const { sessionId, windowId, tabIds } = message.value
        const session = sessionsManager.get(sessionId)
        if (session.id === sessionsManager.current.id) {
          resolve(await browser.tabs.discard(tabIds))
        } else {
          const win = session.findWindow(windowId)
          if (Array.isArray(tabIds)) {
            const tabs = win.tabs.filter((t) => tabIds.includes(t.id))
            tabs.forEach((t) => {
              t.discarded = true
            })
            resolve(tabs)
          } else {
            const tab = win.findTab(tabIds)
            tab.discarded = true
            resolve(tab)
          }
        }
      })
    }
  })

  // TODO: add "fromWindowId" and "fromSessionId"
  browser.runtime.onMessage.addListener((message: MoveTabsMessage) => {
    if (message.type === MESSAGE_TYPE_MOVE_TABS) {
      return new Promise((resolve) => {
        const { sessionId, windowId, tabIds, index: toIndex } = message.value
        const session = sessionsManager.get(sessionId)
        const win = session.findWindow(windowId)
        const tabIdsArr = Array.isArray(tabIds) ? tabIds : [tabIds]
        const tabIndices = win.tabs.reduce<number[]>(
          (acc, { id }, index) =>
            tabIdsArr.includes(id) ? acc.concat(index) : acc,
          []
        )
        tabIndices.forEach((fromIndex, i) => {
          reorder(win.tabs, fromIndex, toIndex + i)
        })
        resolve(win.tabs)
      })
    }
  })

  browser.runtime.onMessage.addListener((message: DownloadSessionsMessage) => {
    if (message.type === MESSAGE_TYPE_DOWNLOAD_SESSIONS) {
      return new Promise(async (resolve) => {
        const { sessionIds } = message.value
        resolve(await sessionsManager.download(sessionIds))
      })
    }
  })

  browser.runtime.onMessage.addListener(
    (message: ImportSessionsFromTextMessage) => {
      if (message.type === MESSAGE_TYPE_IMPORT_SESSIONS_FROM_TEXT) {
        return new Promise((resolve) => {
          const { content } = message.value
          const data = JSON.parse(content) as SessionDataExport

          if (!data.sessions || !Array.isArray(data.sessions)) {
            throw Error('Unrecognized data format, sessions not found')
          }

          if (!data.sessions[0]?.id) {
            throw Error('No sessions found')
          }

          for (const session of data.sessions.reverse()) {
            sessionsManager.addSaved(session)
          }
          resolve(undefined)
          // TODO: send update
        })
      }
    }
  )

  // TODO: highlight duplicates - use with search also
}
