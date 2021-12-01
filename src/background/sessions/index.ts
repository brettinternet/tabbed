import browser, { sessions, Windows } from 'webextension-polyfill'

import { Settings } from 'background/app/settings'
import { focusWindow, focusWindowTab } from 'background/browser'
import { reorder } from 'utils/helpers'
import { AppError } from 'utils/logger'
import {
  MESSAGE_TYPE_GET_SESSIONS_MANAGER_DATA,
  GetSessionsManagerDataMessage,
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
  MESSAGE_TYPE_QUERY_SESSION,
} from 'utils/messages'
import type {
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
} from 'utils/messages'
import { SessionDataExport, SessionStatus } from 'utils/sessions'
import { SettingsData } from 'utils/settings'

import { Session } from './session'
import { SessionsManager } from './sessions-manager'

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
          return resolve(sessionsManager.find(sessionId))
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
          const session = sessionsManager.find(sessionId)
          if (session) {
            return resolve(sessionsManager.addSaved(session))
          }
        })
      }
    }
  )

  browser.runtime.onMessage.addListener((message: SaveWindowMessage) => {
    if (message.type === MESSAGE_TYPE_SAVE_WINDOW) {
      const { sessionId, windowId } = message.value
      return new Promise(async (resolve) => {
        const session = sessionsManager.find(sessionId)
        if (session) {
          const win = session.findWindow(windowId)
          if (win) {
            const newSession = new Session({
              windows: [win],
              status: SessionStatus.SAVED,
            })
            await sessionsManager.addSaved(newSession)
            resolve(newSession)
          }
        }
      })
    }
  })

  // TODO: update session windows here on frontend
  browser.runtime.onMessage.addListener((message: UpdateSessionMessage) => {
    if (message.type === MESSAGE_TYPE_UPDATE_SESSION) {
      return new Promise((resolve) => {
        const { sessionId, title } = message.value
        const session = sessionsManager.find(sessionId)
        if (session) {
          session.update({ title })
          resolve(session)
        }
      })
    }
  })

  browser.runtime.onMessage.addListener((message: OpenSessionMessage) => {
    if (message.type === MESSAGE_TYPE_OPEN_SESSION) {
      return new Promise(async (resolve) => {
        const { sessionId } = message.value
        const session = sessionsManager.find(sessionId)
        if (session) {
          resolve(await session.open())
        }
      })
    }
  })

  browser.runtime.onMessage.addListener((message: OpenSessionWindowMessage) => {
    if (message.type === MESSAGE_TYPE_OPEN_SESSION_WINDOW) {
      return new Promise(async (resolve) => {
        const { sessionId, windowId, options } = message.value
        const session = sessionsManager.find(sessionId)
        if (session) {
          if (
            !options?.forceOpen &&
            sessionsManager.current.id === session.id
          ) {
            resolve(await focusWindow(windowId))
          } else {
            const win = session.findWindow(windowId)
            if (win) {
              resolve(win.open())
            }
          }
        }
      })
    }
  })

  browser.runtime.onMessage.addListener((message: OpenSessionTabMessage) => {
    if (message.type === MESSAGE_TYPE_OPEN_SESSION_TAB) {
      return new Promise(async (resolve) => {
        const { sessionId, windowId, tabId, options } = message.value
        const session = sessionsManager.find(sessionId)
        if (session) {
          if (
            !options?.forceOpen &&
            sessionsManager.current.id === session.id
          ) {
            resolve(await focusWindowTab(windowId, tabId))
          } else {
            const win = session.findWindow(windowId)
            if (win) {
              const tab = win.findTab(tabId)
              if (tab) {
                resolve(tab.open())
              }
            }
          }
        }
      })
    }
  })

  browser.runtime.onMessage.addListener((message: DeleteSessionMessage) => {
    if (message.type === MESSAGE_TYPE_DELETE_SESSION) {
      return new Promise((resolve) => {
        const { sessionId, status } = message.value
        resolve(sessionsManager.delete(sessionId, status))
      })
    }
  })

  browser.runtime.onMessage.addListener(
    (message: RemoveSessionWindowMessage) => {
      if (message.type === MESSAGE_TYPE_REMOVE_SESSION_WINDOW) {
        return new Promise((resolve) => {
          const { sessionId, windowId } = message.value
          const session = sessionsManager.find(sessionId)
          if (session) {
            resolve(session.removeWindow(windowId))
          }
        })
      }
    }
  )

  browser.runtime.onMessage.addListener((message: RemoveSessionTabMessage) => {
    if (message.type === MESSAGE_TYPE_REMOVE_SESSION_TAB) {
      return new Promise((resolve) => {
        const { sessionId, windowId, tabId } = message.value
        const session = sessionsManager.find(sessionId)
        if (session) {
          const win = session.findWindow(windowId)
          if (win) {
            resolve(win.removeTab(tabId))
          }
        }
      })
    }
  })

  // TODO: consolidate options with class update options - probably separate current into new handler
  // update session after patch with handleChange()
  browser.runtime.onMessage.addListener((message: PatchWindowMessage) => {
    if (message.type === MESSAGE_TYPE_PATCH_WINDOW) {
      return new Promise(async (resolve) => {
        const { sessionId, windowId, options } = message.value
        const session = sessionsManager.find(sessionId)
        if (session) {
          if (session.id === sessionsManager.current.id) {
            resolve(await browser.windows.update(windowId, options))
          } else {
            const win = session.findWindow(windowId)
            if (win) {
              resolve(win.update(options))
            }
          }
        }
      })
    }
  })

  // TODO: consolidate options with class update options - probably separate current into new handler
  browser.runtime.onMessage.addListener((message: PatchTabMessage) => {
    if (message.type === MESSAGE_TYPE_PATCH_TAB) {
      return new Promise(async (resolve) => {
        const { sessionId, windowId, tabId, options } = message.value
        const session = sessionsManager.find(sessionId)
        if (session) {
          if (session.id === sessionsManager.current.id) {
            await browser.tabs.update(tabId, options)
          } else {
            const win = session.findWindow(windowId)
            if (win) {
              const tab = win.findTab(tabId)
              if (tab) {
                resolve(tab.update(options))
              }
            }
          }
          // send update
        }
      })
    }
  })

  browser.runtime.onMessage.addListener((message: DiscardTabsMessage) => {
    if (message.type === MESSAGE_TYPE_DISCARD_TABS) {
      return new Promise(async (resolve) => {
        const { sessionId, windowId, tabIds } = message.value
        const session = sessionsManager.find(sessionId)
        if (session) {
          if (session.id === sessionsManager.current.id) {
            resolve(await browser.tabs.discard(tabIds))
          } else {
            const win = session.findWindow(windowId)
            if (win) {
              if (Array.isArray(tabIds)) {
                const tabs = win.tabs.filter((t) => tabIds.includes(t.id))
                tabs.forEach((t) => {
                  t.discarded = true
                })
                resolve(tabs)
              } else {
                const tab = win.findTab(tabIds)
                if (tab) {
                  tab.discarded = true
                  resolve(tab)
                }
              }
            }
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
        const session = sessionsManager.find(sessionId)
        if (session) {
          const win = session.findWindow(windowId)
          if (win) {
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
          }
        }
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
