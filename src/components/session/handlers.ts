import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { Tabs } from 'webextension-polyfill'

import { useTryToastError } from 'components/error/handlers'
import { XOR } from 'utils/helpers'
import { isDefined } from 'utils/helpers'
import {
  Session,
  open as openSession,
  update as _updateSession,
  SavedSessionCategoryType,
} from 'utils/session'
import {
  SessionTab,
  removeTabs as _removeTabs,
  isCurrentSessionTab,
  focus as focusTab,
  open as openTab,
  findTab,
  update as _updateTab,
} from 'utils/session-tab'
import {
  addWindow,
  addTabs,
  findWindowIndex,
  removeWindows as _removeWindows,
  reorderWindows,
  filterWindows,
  SessionWindow,
  findWindow,
  filterTabs,
  createSaved,
  isCurrentSessionWindow,
  focus as focusWindow,
  open as openWindow,
  update as _updateWindow,
} from 'utils/session-window'
import {
  updateCurrentSession,
  addSaved,
  getSession,
  removeSession,
  downloadSession,
  SessionExport,
  save,
  updateCurrentSessionNow,
} from 'utils/sessions-manager'

import { sessionsManagerAtom } from './store'

export const useSessionHandlers = () => {
  const tryToastError = useTryToastError()
  const [sessionsManager, setSessionsManager] = useAtom(sessionsManagerAtom)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveSession = useCallback(
    tryToastError(async (sessionId: Session['id']) => {
      if (sessionsManager) {
        const session = getSession(sessionsManager, sessionId)
        const _sessionsManager = await addSaved(sessionsManager, session)
        save(_sessionsManager)
        setSessionsManager(_sessionsManager)
      }
    }),
    [sessionsManager]
  )

  const openSessions = useCallback(
    tryToastError(async ({ sessionIds }: { sessionIds: Session['id'][] }) => {
      if (sessionsManager) {
        const tasks = sessionIds.map(async (sessionId) => {
          const session = getSession(sessionsManager, sessionId)
          return await openSession(session)
        })
        await Promise.all(tasks)
        setSessionsManager(await updateCurrentSession(sessionsManager))
      }
    }),
    [sessionsManager]
  )

  const updateSession = useCallback(
    tryToastError(
      async ({
        sessionId,
        title,
      }: {
        sessionId: Session['id']
        title: string
      }) => {
        if (sessionsManager) {
          const session = getSession(sessionsManager, sessionId)
          _updateSession(session, { title })
          await save(sessionsManager)
          setSessionsManager(sessionsManager)
        }
      }
    ),
    [sessionsManager]
  )

  const removeSessions = useCallback(
    tryToastError(
      async (
        sessions: {
          sessionId: Session['id']
          category: SavedSessionCategoryType
        }[]
      ) => {
        if (sessionsManager) {
          let _sessionsManager = Object.assign({}, sessionsManager)
          for (const { sessionId, category } of sessions) {
            _sessionsManager = await removeSession(
              _sessionsManager,
              sessionId,
              category
            )
          }
          await save(_sessionsManager)
          setSessionsManager(_sessionsManager)
        }
      }
    ),
    [sessionsManager]
  )

  // TODO ////////////////////////

  const downloadSessions = useCallback(
    tryToastError(async ({ sessionIds }: { sessionIds: Session['id'][] }) => {
      if (sessionsManager) {
        await downloadSession(sessionsManager, sessionIds)
      }
    }),
    [sessionsManager]
  )

  const importSessionsFromText = useCallback(
    tryToastError(async ({ content }: { content: string }) => {
      if (sessionsManager) {
        const data = JSON.parse(content) as SessionExport

        if (!data.sessions || !Array.isArray(data.sessions)) {
          throw Error('Unrecognized data format, sessions not found')
        }

        if (!data.sessions[0]?.id) {
          throw Error('No sessions found')
        }

        let newSessionsManager = sessionsManager
        for (const session of data.sessions.reverse()) {
          newSessionsManager = await addSaved(newSessionsManager, session)
        }

        await save(sessionsManager)
        setSessionsManager(newSessionsManager)
      }
    }),
    [sessionsManager]
  )

  return {
    sessionsManager,
    saveSession,
    openSessions,
    updateSession,
    removeSessions,
    downloadSessions,
    importSessionsFromText,
  }
}

export const useWindowHandlers = () => {
  const tryToastError = useTryToastError()
  const [sessionsManager, setSessionsManager] = useAtom(sessionsManagerAtom)

  const openWindows = useCallback(
    tryToastError(
      async ({
        sessionId,
        windowIds,
        options = { focus: true },
      }: {
        sessionId: Session['id']
        windowIds: SessionWindow['id'][]
        options?: { focus?: boolean }
      }) => {
        if (sessionsManager) {
          const session = getSession(sessionsManager, sessionId)
          const tasks = windowIds.map(async (windowId) => {
            const win = findWindow(session.windows, windowId)
            if (isCurrentSessionWindow(win) && options.focus) {
              return await focusWindow(win)
            } else {
              return await openWindow(win)
            }
          })
          await Promise.all(tasks)
          setSessionsManager(await updateCurrentSession(sessionsManager))
        }
      }
    ),
    [sessionsManager]
  )

  const saveWindow = useCallback(
    tryToastError(
      async ({
        sessionId,
        windowIds,
      }: {
        sessionId: Session['id']
        windowIds: SessionWindow['id'][]
      }) => {
        if (sessionsManager) {
          const session = getSession(sessionsManager, sessionId)
          const windows = filterWindows(session.windows, windowIds)
          const updatedSessionsManager = await addSaved(sessionsManager, {
            windows,
          })
          await save(sessionsManager)
          setSessionsManager(updatedSessionsManager)
        }
      }
    ),
    [sessionsManager]
  )

  const updateWindow = useCallback(
    tryToastError(async ({ sessionId, windowId, options }) => {
      if (sessionsManager) {
        const session = getSession(sessionsManager, sessionId)
        const win = findWindow(session.windows, windowId)
        _updateWindow(win, options)
        if (sessionsManager.current.id === sessionId) {
          setSessionsManager(await updateCurrentSession(sessionsManager))
        } else {
          await save(sessionsManager)
          setSessionsManager(sessionsManager)
        }
      }
    }),
    [sessionsManager]
  )

  const removeWindows = useCallback(
    tryToastError(
      async ({
        sessionId,
        windowIds,
      }: {
        sessionId: Session['id']
        windowIds: SessionWindow['id'][]
      }) => {
        if (sessionsManager) {
          const session = getSession(sessionsManager, sessionId)
          await _removeWindows(session.windows, windowIds)
          if (sessionsManager.current.id === sessionId) {
            setSessionsManager(await updateCurrentSession(sessionsManager))
          } else {
            await save(sessionsManager)
            setSessionsManager(sessionsManager)
          }
        }
      }
    ),
    [sessionsManager]
  )

  return {
    openWindows,
    saveWindow,
    updateWindow,
    removeWindows,
  }
}

export const useTabHandlers = () => {
  const tryToastError = useTryToastError()
  const [sessionsManager, setSessionsManager] = useAtom(sessionsManagerAtom)

  const openTabs = useCallback(
    tryToastError(
      async ({
        sessionId,
        tabs,
        options,
      }: {
        sessionId: Session['id']
        tabs: {
          windowId: SessionWindow['id']
          tabIds: SessionTab['id'][]
        }[]
        options?: { forceOpen?: boolean }
      }) => {
        if (sessionsManager) {
          const session = getSession(sessionsManager, sessionId)
          const tasks: Promise<unknown>[] = []
          tabs.forEach(({ windowId, tabIds }) => {
            const win = findWindow(session.windows, windowId)
            tabIds.forEach((tabId) => {
              const tab = findTab(win.tabs, tabId)
              const task =
                isCurrentSessionTab(tab) && !options?.forceOpen
                  ? focusTab(tab)
                  : openTab(tab, { incognito: win.incognito })
              tasks.push(task)
            })
          })
          await Promise.all(tasks)
          setSessionsManager(await updateCurrentSession(sessionsManager))
        }
      }
    ),
    [sessionsManager]
  )

  const updateTab = useCallback(
    tryToastError(async ({ sessionId, windowId, tabId, options }) => {
      if (sessionsManager) {
        const session = getSession(sessionsManager, sessionId)
        const win = findWindow(session.windows, windowId)
        const tab = findTab(win.tabs, tabId)
        _updateTab(tab, options)
        if (sessionsManager.current.id === sessionId) {
          setSessionsManager(await updateCurrentSession(sessionsManager))
        } else {
          await save(sessionsManager)
          setSessionsManager(sessionsManager)
        }
      }
    }),
    [sessionsManager]
  )

  const removeTabs = useCallback(
    tryToastError(
      async ({
        sessionId,
        tabs,
      }: {
        sessionId: Session['id']
        tabs: {
          windowId: SessionWindow['id']
          tabIds: SessionTab['id'][]
        }[]
      }) => {
        if (sessionsManager) {
          const session = getSession(sessionsManager, sessionId)
          const tasks: Promise<unknown> | unknown[] = []
          tabs.forEach(({ windowId, tabIds }) => {
            const win = findWindow(session.windows, windowId)
            tasks.push(_removeTabs(win.tabs, tabIds))
          })
          await Promise.all(tasks)
          if (sessionsManager.current.id === sessionId) {
            setSessionsManager(await updateCurrentSession(sessionsManager))
          } else {
            await save(sessionsManager)
            setSessionsManager(sessionsManager)
          }
        }
      }
    ),
    [sessionsManager]
  )

  return {
    openTabs,
    updateTab,
    removeTabs,
  }
}

export const useDndHandlers = () => {
  const tryToastError = useTryToastError()
  const [sessionsManager, setSessionsManager] = useAtom(sessionsManagerAtom)

  const moveWindows = useCallback(
    tryToastError(
      async ({
        from,
        to,
      }: {
        from: {
          sessionId: Session['id']
          windowIds: SessionWindow['id'][]
        }
        to: {
          sessionId: Session['id']
          index: number
        }
      }) => {
        if (sessionsManager) {
          const fromSession = getSession(sessionsManager, from.sessionId)
          const windows = filterWindows(fromSession.windows, from.windowIds)
          const toSession = getSession(sessionsManager, to.sessionId)
          if (from.sessionId === to.sessionId) {
            const indices = windows.map((win) =>
              findWindowIndex(toSession.windows, win.id)
            )
            indices.forEach((index) => {
              toSession.windows = reorderWindows(
                toSession.windows,
                index,
                to.index
              )
            })
          } else {
            const tasks = windows.map(async (win) => {
              fromSession.windows = await _removeWindows(fromSession.windows, [
                win.id,
              ])
              toSession.windows = await addWindow(toSession.windows, {
                window: win,
                index: to.index,
              })
            })
            await Promise.all(tasks)
          }
          await save(sessionsManager)
          setSessionsManager(sessionsManager)
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
          sessionId: Session['id']
          windowId: SessionWindow['id']
          tabIds: SessionTab['id'][]
        }
        to: {
          sessionId: Session['id']
          pinned?: boolean
        } & XOR<
          {
            windowId: SessionWindow['id'] // when undefined, create new window
            index: Tabs.MoveMovePropertiesType['index']
          },
          {
            windowId?: undefined
            incognito?: boolean // when no windowId is defined, otherwise incognito state depends on existing window
          }
        >
      }) => {
        if (sessionsManager) {
          const fromSession = getSession(sessionsManager, from.sessionId)
          const fromWindow = findWindow(fromSession.windows, from.windowId)
          const toSession = getSession(sessionsManager, to.sessionId)
          const tabs = filterTabs(fromWindow.tabs, from.tabIds)
          if (to.windowId) {
            const toWindowIndex = findWindowIndex(
              toSession.windows,
              to.windowId
            )
            toSession.windows[toWindowIndex] = await addTabs(
              toSession.windows[toWindowIndex],
              tabs,
              to.index,
              to.pinned
            )
          } else {
            const { incognito, state, height, width, top, left } = fromWindow
            const newWindow = createSaved({
              tabs,
              incognito: isDefined(to.incognito) ? to.incognito : incognito,
              focused: false,
              state,
              height,
              width,
              top,
              left,
            })
            toSession.windows = await addWindow(toSession.windows, {
              window: newWindow,
              index: to.index,
            })
            await Promise.all(
              tabs.map(async (t) => await _removeTabs(fromWindow.tabs, [t.id]))
            )
          }

          if (
            [from.sessionId, to.sessionId].includes(sessionsManager.current.id)
          ) {
            setSessionsManager(await updateCurrentSessionNow(sessionsManager))
          } else {
            await save(sessionsManager)
            setSessionsManager(sessionsManager)
          }
        }
      }
    ),
    [sessionsManager]
  )

  return {
    moveWindows,
    moveTabs,
  }
}
