import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { Tabs } from 'webextension-polyfill'

import { useTryToastError } from 'components/error/handlers'
import { reorder, spliceSeparate } from 'utils/helpers'
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
  findTabIndex,
  shouldPin,
} from 'utils/session-tab'
import {
  addWindow,
  addCurrentTabs,
  findWindowIndex,
  removeWindows as _removeWindows,
  filterWindows,
  SessionWindow,
  findWindow,
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
  updateSessionsManager,
} from 'utils/sessions-manager'

import { ApiControllerRef, programmticallyMoveTab } from './dnd-store'
import { sessionsManagerAtom } from './store'

const useHelpers = () => {
  const tryToastError = useTryToastError()
  const [sessionsManager, setSessionsManager] = useAtom(sessionsManagerAtom)

  return {
    tryToastError,
    sessionsManager,
    setSessionsManager,
  }
}

export const useSessionHandlers = () => {
  const { tryToastError, sessionsManager, setSessionsManager } = useHelpers()

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const downloadSessions = useCallback(
    tryToastError(async ({ sessionIds }: { sessionIds: Session['id'][] }) => {
      if (sessionsManager) {
        await downloadSession(sessionsManager, sessionIds)
      }
    }),
    [sessionsManager]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

        let _sessionsManager = Object.assign({}, sessionsManager)
        for (const session of data.sessions.reverse()) {
          _sessionsManager = await addSaved(_sessionsManager, session)
        }

        await save(_sessionsManager)
        setSessionsManager(_sessionsManager)
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
  const { tryToastError, sessionsManager, setSessionsManager } = useHelpers()

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          const _sessionsManager = await addSaved(sessionsManager, {
            windows,
          })
          await save(_sessionsManager)
          setSessionsManager(_sessionsManager)
        }
      }
    ),
    [sessionsManager]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateWindow = useCallback(
    tryToastError(async ({ sessionId, windowId, options }) => {
      if (sessionsManager) {
        const session = getSession(sessionsManager, sessionId)
        const index = findWindowIndex(session.windows, windowId)
        session.windows[index] = await _updateWindow(
          session.windows[index],
          options
        )
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          session.windows = await _removeWindows(session.windows, windowIds)
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

export const useTabHandlers = (apiControllerRef: ApiControllerRef) => {
  const { tryToastError, sessionsManager, setSessionsManager } = useHelpers()

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateTab = useCallback(
    tryToastError(
      async ({
        sessionId,
        windowId,
        tabId,
        options,
      }: {
        sessionId: Session['id']
        windowId: SessionWindow['id']
        tabId: SessionTab['id']
        options: Parameters<typeof _updateTab>[1]
      }) => {
        if (sessionsManager) {
          const session = getSession(sessionsManager, sessionId)
          const winIndex = findWindowIndex(session.windows, windowId)
          const tabIndex = findTabIndex(session.windows[winIndex].tabs, tabId)
          const originalTabs = session.windows[winIndex].tabs.slice()
          session.windows[winIndex].tabs[tabIndex] = await _updateTab(
            originalTabs[tabIndex],
            options
          )

          if (isDefined(options.pinned)) {
            // DnD programmatically move tab to last pinned position / first non-pinned position
            void programmticallyMoveTab(
              apiControllerRef,
              windowId,
              {
                index: tabIndex,
                tabId,
              },
              {
                index: originalTabs.findIndex((t) => !t.pinned) ?? 0,
              }
            )
          }

          if (sessionsManager.current.id === sessionId) {
            setSessionsManager(await updateCurrentSession(sessionsManager))
          } else {
            void save(sessionsManager)
            setSessionsManager(sessionsManager)
          }
        }
      }
    ),
    [sessionsManager, apiControllerRef.current]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          for (const { windowId, tabIds } of tabs) {
            const index = findWindowIndex(session.windows, windowId)
            session.windows[index].tabs = await _removeTabs(
              session.windows[index].tabs,
              tabIds
            )
            if (!session.windows[index].tabs.length) {
              _removeWindows(session.windows, [session.windows[index].id])
            }
          }
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

type MoveTabArgs = {
  from: {
    sessionId: Session['id']
    windowId: SessionWindow['id']
    index: Tabs.MoveMovePropertiesType['index']
  }
  to: {
    sessionId: Session['id']
    windowId?: SessionWindow['id']
    index?: Tabs.MoveMovePropertiesType['index']
    incognito?: boolean
  }
}

export const useDndHandlers = () => {
  const { tryToastError, sessionsManager, setSessionsManager } = useHelpers()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const moveWindows = useCallback(
    tryToastError(
      ({
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
          let _sessionsManager = sessionsManager
          if (from.sessionId === to.sessionId) {
            // Move within same session
            const indices = windows.map((win) =>
              findWindowIndex(toSession.windows, win.id)
            )
            indices.forEach((index) => {
              toSession.windows = reorder(toSession.windows, index, to.index)
            })
            _sessionsManager = updateSessionsManager(
              _sessionsManager,
              toSession
            )
          } else {
            // Move between sessions
            // TODO: handle synchronously/optimistically somehow
            //
            // for (const win of windows) {
            //   fromSession.windows = void _removeWindows(fromSession.windows, [
            //     win.id,
            //   ])
            //   toSession.windows = void addWindow(toSession.windows, {
            //     window: win,
            //     index: to.index,
            //   })
            //   _sessionsManager = updateSessionsManager(
            //     _sessionsManager,
            //     fromSession
            //   )
            //   _sessionsManager = updateSessionsManager(
            //     _sessionsManager,
            //     toSession
            //   )
            // }
          }
          setSessionsManager(_sessionsManager)
          void save(_sessionsManager)
        }
      }
    ),
    [sessionsManager]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const moveTabs = useCallback(
    tryToastError(async ({ from, to }: MoveTabArgs) => {
      if (sessionsManager) {
        const fromSession = getSession(sessionsManager, from.sessionId)
        const fromWindowIndex = findWindowIndex(
          fromSession.windows,
          from.windowId
        )
        const toSession = getSession(sessionsManager, to.sessionId)

        if (to.windowId && isDefined(to.index)) {
          // move tabs to specific session window
          const toWindowIndex = findWindowIndex(toSession.windows, to.windowId)
          const fromTabs = fromSession.windows[fromWindowIndex].tabs

          // based on target, previous and next tabs, should the moved tab be pinned?
          let target = fromSession.windows[fromWindowIndex].tabs[from.index]
          const indexModifier = from.index > to.index ? 0 : 1
          const index = to.index + indexModifier
          const nextTab: SessionWindow['tabs'][number] | undefined =
            toSession.windows[toWindowIndex].tabs[index]
          const previousTab: SessionWindow['tabs'][number] | undefined =
            toSession.windows[toWindowIndex].tabs[
              index - 1 - (from.windowId !== to.windowId ? 1 : 0)
            ]

          if (
            from.sessionId === to.sessionId &&
            from.windowId === to.windowId
          ) {
            // move within same window
            fromSession.windows[fromWindowIndex].tabs = reorder(
              fromTabs,
              from.index,
              to.index
            )
          } else {
            // move tabs to separate window
            const toTabs = toSession.windows[toWindowIndex].tabs
            const [updatedFromTabs, updatedToTabs] = spliceSeparate(
              fromTabs,
              toTabs,
              from.index,
              to.index
            )
            if (updatedFromTabs.length > 0) {
              fromSession.windows[fromWindowIndex].tabs = updatedFromTabs
            } else {
              fromSession.windows.splice(fromWindowIndex, 1)
            }
            toSession.windows[toWindowIndex].tabs = updatedToTabs
          }
          target = toSession.windows[toWindowIndex].tabs[to.index]
          target.pinned = shouldPin(target, previousTab, nextTab)
          toSession.windows[toWindowIndex].tabs[to.index] = target
          // side effects in browser
          addCurrentTabs(
            toSession.windows[toWindowIndex],
            [target],
            to.index,
            target.pinned
          )
        } else {
          // TODO: incomplete? remove tabs in fromWindow
          // move tabs to newly created window in a session
          const { incognito, state, height, width, top, left } =
            fromSession.windows[fromWindowIndex]
          const tab = fromSession.windows[fromWindowIndex].tabs[from.index]
          // create saved but `addWindow` will coerce window to match windows list
          const newWindow = createSaved({
            tabs: [tab],
            incognito: isDefined(to.incognito) ? to.incognito : incognito,
            focused: false,
            state,
            height,
            width,
            top,
            left,
          })
          console.log('new window', newWindow, to)
          toSession.windows = await addWindow(toSession.windows, {
            window: newWindow,
            index: to.index,
          })
        }
        // if (!to.windowId || from.sessionId !== sessionsManager.current.id) {
        //   tabs.forEach((t) => {
        //     const index = findTabIndex(
        //       fromSession.windows[fromWindowIndex].tabs,
        //       t.id
        //     )
        //     tabs.splice(index, 1)
        //   })
        // }

        // Set optimistically so DND doesn't have to wait
        setSessionsManager(sessionsManager)
        void save(sessionsManager)
        if (
          [from.sessionId, to.sessionId].includes(sessionsManager.current.id)
        ) {
          const asyncUpdate = async () => {
            setSessionsManager(await updateCurrentSession(sessionsManager))
          }

          void asyncUpdate()
        }
      } else {
        throw Error(
          'Unable to save changes, please refresh the extension and try again.'
        )
      }
    }),
    [sessionsManager]
  )

  return {
    moveWindows,
    moveTabs,
  }
}
