import { filter } from 'lodash'
import browser from 'webextension-polyfill'

import { Settings } from 'background/app/settings'
import { isDefined, reorder } from 'utils/helpers'
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
  DownloadSessionsMessage, // MESSAGE_TYPE_FIND_DUPLICATE_SESSION_TABS,
  // FindDuplicateSessionTabsMessage,
  MESSAGE_TYPE_IMPORT_SESSIONS_FROM_TEXT,
  ImportSessionsFromTextMessage,
  MESSAGE_TYPE_QUERY_SESSION,
  QuerySessionMessage,
  MoveWindowsMessage,
  MESSAGE_TYPE_MOVE_WINDOWS,
  createMessageListener,
} from 'utils/messages'
import { filterTabs, filterWindows, SessionDataExport } from 'utils/sessions'
import { SettingsData } from 'utils/settings'

import { CurrentSession, SavedSession } from './session'
import { CurrentSessionTab, SavedSessionTab } from './session-tab'
import { CurrentSessionWindow, SavedSessionWindow } from './session-window'
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
    const closedWindow =
      sessionsManager.current.searchWindowByAssignedId(closedWindowId)
    if (closedWindow && !(!saveIncognito && closedWindow.incognito)) {
      // When tabs are moved they can trigger the closed window handler
      const currentTabIds = (await browser.tabs.query({}))?.map(({ id }) => id)
      closedWindow.tabs = closedWindow.tabs.filter(
        (tab) => !currentTabIds.includes(tab.assignedTabId)
      )
      if (closedWindow.tabs.length) {
        await sessionsManager.addPrevious(
          SavedSession.from({
            windows: [closedWindow],
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

  // Listen for window/tab changes in order to update current session
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

  createMessageListener<GetSessionsManagerDataMessage>(
    MESSAGE_TYPE_GET_SESSIONS_MANAGER_DATA,
    () => sessionsManager.toJSON()
  )

  // TODO: for selecting saved sessions to look at?
  createMessageListener<QuerySessionMessage>(
    MESSAGE_TYPE_QUERY_SESSION,
    ({ sessionId }) => sessionsManager.get(sessionId)
  )

  createMessageListener<SaveExistingSessionMessage>(
    MESSAGE_TYPE_SAVE_EXISTING_SESSION,
    ({ sessionId }) => {
      const session = sessionsManager.get(sessionId)
      return sessionsManager.addSaved(session)
    }
  )

  createMessageListener<SaveWindowsMessage>(
    MESSAGE_TYPE_SAVE_WINDOWS,
    async ({ sessionId, windowIds }) => {
      const session = sessionsManager.get(sessionId)
      const windows = filterWindows(session.windows, windowIds)
      await sessionsManager.addSaved({
        windows,
      })
    }
  )

  // TODO: update session windows here on frontend
  createMessageListener<UpdateSessionMessage>(
    MESSAGE_TYPE_UPDATE_SESSION,
    async ({ sessionId, title }) => {
      const session = sessionsManager.get(sessionId)
      session.update({ title })
      await sessionsManager.handleChange()
      return session
    }
  )

  createMessageListener<MoveWindowsMessage>(
    MESSAGE_TYPE_MOVE_WINDOWS,
    async ({ from, to }) => {
      const fromSession = sessionsManager.get(from.sessionId)
      const windows = filterWindows(fromSession.windows, from.windowIds)
      const toSession = sessionsManager.get(to.sessionId)
      if (from.sessionId === to.sessionId) {
        const indices = windows.map((win) => toSession.findWindowIndex(win.id))
        indices.forEach((index) => {
          toSession.reorderWindows(index, to.index)
        })
      } else {
        const tasks = windows.map(async (win) => {
          fromSession.removeWindow(win.id)
          await toSession.addWindow({
            window: win,
            index: to.index,
            focused: true,
          })
        })
        await Promise.all(tasks)
      }
      await sessionsManager.handleChange()
    }
  )

  createMessageListener<MoveTabsMessage>(
    MESSAGE_TYPE_MOVE_TABS,
    async ({ from, to }) => {
      const fromSession = sessionsManager.get(from.sessionId)
      const fromWindow = fromSession.findWindow(from.windowId)
      const toSession = sessionsManager.get(to.sessionId)
      const tabs = filterTabs(fromWindow.tabs, from.tabIds)
      if (to.windowId) {
        const toWindow = toSession.findWindow(to.windowId)
        await toWindow.addTabs(tabs, to.index, to.pinned)
      } else {
        const { incognito, state, height, width, top, left } = fromWindow
        await CurrentSessionWindow.from({
          tabs,
          incognito: isDefined(to.incognito) ? to.incognito : incognito,
          focused: false,
          state,
          height,
          width,
          top,
          left,
        })
        await Promise.all(
          tabs.map(async (t) => await fromWindow.removeTab(t.id))
        )
      }

      if ([from.sessionId, to.sessionId].includes(sessionsManager.current.id)) {
        await sessionsManager.updateCurrent()
      }
      await sessionsManager.handleChange()
    }
  )

  createMessageListener<OpenSessionsMessage>(
    MESSAGE_TYPE_OPEN_SESSIONS,
    async ({ sessionIds }) => {
      const tasks = sessionIds.map(async (sessionId) => {
        const session = sessionsManager.get(sessionId)
        return await session.open()
      })
      await Promise.all(tasks)
    }
  )

  createMessageListener<OpenSessionWindowsMessage>(
    MESSAGE_TYPE_OPEN_SESSION_WINDOWS,
    async ({ sessionId, windowIds, options }) => {
      const session = sessionsManager.get(sessionId)
      const tasks = windowIds.map(async (windowId) => {
        const win = session.findWindow(windowId)
        if (win instanceof CurrentSessionWindow && !options?.forceOpen) {
          return await win.focus()
        } else {
          return await win.open()
        }
      })
      await Promise.all(tasks)
    }
  )

  createMessageListener<OpenSessionTabsMessage>(
    MESSAGE_TYPE_OPEN_SESSION_TABS,
    async ({ sessionId, tabs, options }) => {
      const session = sessionsManager.get(sessionId)
      const tasks: Promise<void>[] = []
      tabs.forEach(({ windowId, tabIds }) => {
        const win = session.findWindow(windowId)
        tabIds.forEach((tabId) => {
          const tab = win.findTab(tabId)
          const task =
            tab instanceof CurrentSessionTab && !options?.forceOpen
              ? tab.focus()
              : tab.open(browser.windows.WINDOW_ID_CURRENT)
          tasks.push(task)
        })
      })
      return await Promise.all(tasks)
    }
  )

  createMessageListener<DeleteSessionsMessage>(
    MESSAGE_TYPE_DELETE_SESSIONS,
    async (sessions) => {
      const tasks = sessions.map(async ({ sessionId, category }) =>
        sessionsManager.delete(sessionId, category)
      )
      return await Promise.all(tasks)
    }
  )

  createMessageListener<RemoveSessionWindowsMessage>(
    MESSAGE_TYPE_REMOVE_SESSION_WINDOWS,
    async ({ sessionId, windowIds }) => {
      const session = sessionsManager.get(sessionId)
      // todo save after
      const tasks = windowIds.map(
        async (windowId) => await session.removeWindow(windowId)
      )
      return await Promise.all(tasks)
    }
  )

  createMessageListener<RemoveSessionTabsMessage>(
    MESSAGE_TYPE_REMOVE_SESSION_TABS,
    async ({ sessionId, tabs }) => {
      const session = sessionsManager.get(sessionId)
      const tasks: Promise<void> | void[] = []
      tabs.forEach(({ windowId, tabIds }) => {
        const win = session.findWindow(windowId)
        tabIds.forEach(async (tabId) => {
          tasks.push(await win.removeTab(tabId))
        })
      })
      return await Promise.all(tasks)
    }
  )

  // TODO: update session after patch with handleChange()
  createMessageListener<PatchWindowMessage>(
    MESSAGE_TYPE_PATCH_WINDOW,
    async ({ sessionId, windowId, options }) => {
      const session = sessionsManager.get(sessionId)
      const win = session.findWindow(windowId)
      return win.update(options)
    }
  )

  createMessageListener<PatchTabMessage>(
    MESSAGE_TYPE_PATCH_TAB,
    async ({ sessionId, windowId, tabId, options }) => {
      const session = sessionsManager.get(sessionId)
      const win = session.findWindow(windowId)
      const tab = win.findTab(tabId)
      return tab.update(options)
      // TODO: send update
    }
  )

  createMessageListener<DiscardTabsMessage>(
    MESSAGE_TYPE_DISCARD_TABS,
    async ({ sessionId, windowId, tabIds }) => {
      const session = sessionsManager.get(sessionId)
      const win = session.findWindow(windowId)
      const tabs = filterTabs(win.tabs, tabIds)
      const tasks = tabs.map(async (t) => await t.update({ discarded: true }))
      return Promise.all(tasks)
    }
  )

  createMessageListener<DownloadSessionsMessage>(
    MESSAGE_TYPE_DOWNLOAD_SESSIONS,
    async ({ sessionIds }) => await sessionsManager.download(sessionIds)
  )

  createMessageListener<ImportSessionsFromTextMessage>(
    MESSAGE_TYPE_IMPORT_SESSIONS_FROM_TEXT,
    async ({ content }) => {
      const data = JSON.parse(content) as SessionDataExport

      if (!data.sessions || !Array.isArray(data.sessions)) {
        throw Error('Unrecognized data format, sessions not found')
      }

      if (!data.sessions[0]?.id) {
        throw Error('No sessions found')
      }

      for (const session of data.sessions.reverse()) {
        await sessionsManager.addSaved(session)
      }
      // TODO: send update
    }
  )

  // TODO: highlight duplicates - use with search also
}
