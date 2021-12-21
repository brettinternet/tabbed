import { atom, useAtom } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'
import browser, { Tabs } from 'webextension-polyfill'

import { useTryToastError } from 'components/error/handlers'
import { useSettings } from 'components/settings/store'
import { XOR } from 'utils/helpers'
import { isDefined } from 'utils/helpers'
import {
  createMessageListener,
  CurrentSessionChangeMessage,
  MESSAGE_TYPE_CURRENT_SESSION_CHANGE,
} from 'utils/messages'

import { CurrentSessionTab } from './session-tab'
import { CurrentSessionWindow } from './session-window'
import { SessionsManager } from './sessions-manager'
import {
  filterTabs,
  filterWindows,
  SavedSessionCategoryType,
  SessionData,
  SessionDataExport,
  SessionTabData,
  SessionWindowData,
} from './types'

const sessionsManagerAtom = atom<SessionsManager | undefined>(undefined)

export const useSessionsManager = () => {
  const [, , settingsManager] = useSettings()
  const tryToastError = useTryToastError()
  const [sessionsManager, setSessionsManager] = useAtom(sessionsManagerAtom)
  console.log('sessionsManager: ', sessionsManager)

  const updateSettingsManager = useCallback(
    (mutatedSessionsManager: SessionsManager) => {
      console.log('UPDATE mutatedSessionsManager: ', mutatedSessionsManager)
      if (settingsManager) {
        setSessionsManager(
          new SessionsManager(mutatedSessionsManager, settingsManager)
        )
      }
    },
    [settingsManager]
  )

  const previousSettings = useRef(settingsManager)
  useEffect(() => {
    if (settingsManager && settingsManager !== previousSettings.current) {
      const load = tryToastError(async () => {
        setSessionsManager(await SessionsManager.load(settingsManager))
      })
      void load()
      console.log('LOADING SESSINOS MANAGER.................')
    }
  }, [settingsManager, tryToastError])

  // useEffect(() => {
  //   if (settingsManager) {
  //     const load = tryToastError(async () => {
  //       if (sessionsManager) {
  //         updateSettingsManager(sessionsManager)
  //       } else {
  //         setSessionsManager(await SessionsManager.load(settingsManager))
  //       }
  //     })
  //     void load()
  //   }
  // }, [tryToastError])

  useEffect(() => {
    const { startListener, removeListener } =
      createMessageListener<CurrentSessionChangeMessage>(
        MESSAGE_TYPE_CURRENT_SESSION_CHANGE,
        async () => {
          if (sessionsManager) {
            await sessionsManager.updateCurrent()
            updateSettingsManager(sessionsManager)
          }
        }
      )
    startListener()
    return removeListener
  }, [updateSettingsManager, sessionsManager])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveSession = useCallback(
    tryToastError(async (sessionId: SessionData['id']) => {
      if (sessionsManager) {
        const session = sessionsManager.get(sessionId)
        await sessionsManager.addSaved(session)
        updateSettingsManager(sessionsManager)
      }
    }),
    [sessionsManager]
  )

  const saveWindow = useCallback(
    tryToastError(
      async ({
        sessionId,
        windowIds,
      }: {
        sessionId: SessionData['id']
        windowIds: SessionWindowData['id'][]
      }) => {
        if (sessionsManager) {
          const session = sessionsManager.get(sessionId)
          const windows = filterWindows(session.windows, windowIds)
          await sessionsManager.addSaved({
            windows,
          })
          updateSettingsManager(sessionsManager)
        }
      }
    ),
    [sessionsManager]
  )

  const moveWindows = useCallback(
    tryToastError(
      async ({
        from,
        to,
      }: {
        from: {
          sessionId: SessionData['id']
          windowIds: SessionWindowData['id'][]
        }
        to: {
          sessionId: SessionData['id']
          index: number
        }
      }) => {
        if (sessionsManager) {
          const fromSession = sessionsManager.get(from.sessionId)
          const windows = filterWindows(fromSession.windows, from.windowIds)
          const toSession = sessionsManager.get(to.sessionId)
          if (from.sessionId === to.sessionId) {
            const indices = windows.map((win) =>
              toSession.findWindowIndex(win.id)
            )
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
          await sessionsManager.updateCurrent()
          updateSettingsManager(sessionsManager)
        }
      }
    ),
    [sessionsManager]
  )

  const moveTabs = useCallback(
    tryToastError(
      async ({
        from,
        to,
      }: {
        from: {
          sessionId: SessionData['id']
          windowId: SessionWindowData['id']
          tabIds: SessionTabData['id'][]
        }
        to: {
          sessionId: SessionData['id']
          pinned?: boolean
        } & XOR<
          {
            windowId: SessionWindowData['id'] // when undefined, create new window
            index: Tabs.MoveMovePropertiesType['index']
          },
          {
            windowId?: undefined
            incognito?: boolean // when no windowId is defined, otherwise incognito state depends on existing window
          }
        >
      }) => {
        if (sessionsManager) {
          console.log('MOVE TABS', from, to)
          const fromSession = sessionsManager.get(from.sessionId)
          const fromWindow = fromSession.findWindow(from.windowId)
          const toSession = sessionsManager.get(to.sessionId)
          const tabs = filterTabs(fromWindow.tabs, from.tabIds)
          console.log('tabs: ', tabs)
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

          if (
            [from.sessionId, to.sessionId].includes(sessionsManager.current.id)
          ) {
            await sessionsManager.updateCurrent()
          }
          await sessionsManager.updateCurrent()
          updateSettingsManager(sessionsManager)
        }
      }
    ),
    [sessionsManager]
  )

  const openSessions = useCallback(
    tryToastError(
      async ({ sessionIds }: { sessionIds: SessionData['id'][] }) => {
        if (sessionsManager) {
          const tasks = sessionIds.map(async (sessionId) => {
            const session = sessionsManager.get(sessionId)
            return await session.open()
          })
          await Promise.all(tasks)
          await sessionsManager.updateCurrent()
          updateSettingsManager(sessionsManager)
        }
      }
    ),
    [sessionsManager]
  )

  const openWindows = useCallback(
    tryToastError(
      async ({
        sessionId,
        windowIds,
        options,
      }: {
        sessionId: SessionData['id']
        windowIds: SessionWindowData['id'][]
        options?: { forceOpen?: boolean }
      }) => {
        if (sessionsManager) {
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
          await sessionsManager.updateCurrent()
          updateSettingsManager(sessionsManager)
        }
      }
    ),
    [sessionsManager]
  )

  const openTabs = useCallback(
    tryToastError(
      async ({
        sessionId,
        tabs,
        options,
      }: {
        sessionId: SessionData['id']
        tabs: {
          windowId: SessionWindowData['id']
          tabIds: SessionTabData['id'][]
        }[]
        options?: { forceOpen?: boolean }
      }) => {
        if (sessionsManager) {
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
          await Promise.all(tasks)
          await sessionsManager.updateCurrent()
          updateSettingsManager(sessionsManager)
        }
      }
    ),
    [sessionsManager]
  )

  const updateSession = useCallback(
    tryToastError(
      async ({
        sessionId,
        title,
      }: {
        sessionId: SessionData['id']
        title: string
      }) => {
        if (sessionsManager) {
          const session = sessionsManager.get(sessionId)
          session.update({ title })
          updateSettingsManager(sessionsManager)
        }
      }
    ),
    [sessionsManager]
  )

  const updateWindow = useCallback(
    tryToastError(async ({ sessionId, windowId, options }) => {
      if (sessionsManager) {
        const session = sessionsManager.get(sessionId)
        const win = session.findWindow(windowId)
        win.update(options)
        if (sessionsManager.current.id === sessionId) {
          await sessionsManager.updateCurrent()
        }
        updateSettingsManager(sessionsManager)
      }
    }),
    [sessionsManager]
  )

  const updateTab = useCallback(
    tryToastError(async ({ sessionId, windowId, tabId, options }) => {
      if (sessionsManager) {
        const session = sessionsManager.get(sessionId)
        const win = session.findWindow(windowId)
        const tab = win.findTab(tabId)
        tab.update(options)
        if (sessionsManager.current.id === sessionId) {
          await sessionsManager.updateCurrent()
        }
        updateSettingsManager(sessionsManager)
      }
    }),
    [sessionsManager]
  )

  const removeSessions = useCallback(
    tryToastError(
      async (
        sessions: {
          sessionId: SessionData['id']
          category: SavedSessionCategoryType
        }[]
      ) => {
        if (sessionsManager) {
          const tasks = sessions.map(async ({ sessionId, category }) =>
            sessionsManager.delete(sessionId, category)
          )
          await Promise.all(tasks)
          updateSettingsManager(sessionsManager)
        }
      }
    ),
    [sessionsManager]
  )

  const removeWindows = useCallback(
    tryToastError(
      async ({
        sessionId,
        windowIds,
      }: {
        sessionId: SessionData['id']
        windowIds: SessionWindowData['id'][]
      }) => {
        if (sessionsManager) {
          const session = sessionsManager.get(sessionId)
          // todo save after
          const tasks = windowIds.map(
            async (windowId) => await session.removeWindow(windowId)
          )
          await Promise.all(tasks)
          if (sessionsManager.current.id === sessionId) {
            await sessionsManager.updateCurrent()
          }
          updateSettingsManager(sessionsManager)
        }
      }
    ),
    [sessionsManager]
  )

  const removeTabs = useCallback(
    tryToastError(
      async ({
        sessionId,
        tabs,
      }: {
        sessionId: SessionData['id']
        tabs: {
          windowId: SessionWindowData['id']
          tabIds: SessionTabData['id'][]
        }[]
      }) => {
        if (sessionsManager) {
          const session = sessionsManager.get(sessionId)
          const tasks: Promise<void> | void[] = []
          tabs.forEach(({ windowId, tabIds }) => {
            const win = session.findWindow(windowId)
            tabIds.forEach(async (tabId) => {
              tasks.push(await win.removeTab(tabId))
            })
          })
          await Promise.all(tasks)
          if (sessionsManager.current.id === sessionId) {
            await sessionsManager.updateCurrent()
          }
          updateSettingsManager(sessionsManager)
        }
      }
    ),
    [sessionsManager]
  )

  const downloadSessions = useCallback(
    tryToastError(
      async ({ sessionIds }: { sessionIds: SessionData['id'][] }) => {
        if (sessionsManager) {
          await sessionsManager.download(sessionIds)
          updateSettingsManager(sessionsManager)
        }
      }
    ),
    [sessionsManager]
  )

  const importSessionsFromText = useCallback(
    tryToastError(async ({ content }: { content: string }) => {
      if (sessionsManager) {
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

        updateSettingsManager(sessionsManager)
      }
    }),
    [sessionsManager]
  )

  return {
    sessionsManager,
    saveSession,
    saveWindow,
    moveWindows,
    moveTabs,
    openSessions,
    openWindows,
    openTabs,
    updateSession,
    updateWindow,
    updateTab,
    removeSessions,
    removeWindows,
    removeTabs,
    downloadSessions,
    importSessionsFromText,
  }
}
