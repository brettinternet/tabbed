import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { useTryToastError } from 'components/error/handlers'
import type { ActiveDraggable } from 'components/session/dnd-store'
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
  filterTabs,
  createSaved,
  isCurrentSessionWindow,
  focus as focusWindow,
  open as openWindow,
  update as _updateWindow,
  CurrentSessionWindow,
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
  updateSessionsManager,
} from 'utils/sessions-manager'

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

export const useTabHandlers = () => {
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
    tryToastError(async ({ sessionId, windowId, tabId, options }) => {
      if (sessionsManager) {
        const session = getSession(sessionsManager, sessionId)
        const winIndex = findWindowIndex(session.windows, windowId)
        const tabIndex = findTabIndex(session.windows[winIndex].tabs, tabId)
        session.windows[winIndex].tabs[tabIndex] = await _updateTab(
          session.windows[winIndex].tabs[tabIndex],
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

export const useDndHandlers = () => {
  const { tryToastError, sessionsManager, setSessionsManager } = useHelpers()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const moveWindows = useCallback(
    tryToastError(
      ({
        source,
        destination,
      }: {
        source: {
          sessionId: Session['id']
          windowIds: SessionWindow['id'][]
        }
        destination: {
          sessionId: Session['id']
          index: number
        }
      }) => {
        if (sessionsManager) {
          const fromSession = getSession(sessionsManager, source.sessionId)
          const windows = filterWindows(fromSession.windows, source.windowIds)
          const toSession = getSession(sessionsManager, destination.sessionId)
          let _sessionsManager = sessionsManager
          if (source.sessionId === destination.sessionId) {
            // Move within same session
            const indices = windows.map((win) =>
              findWindowIndex(toSession.windows, win.id)
            )
            indices.forEach((index) => {
              toSession.windows = reorder(
                toSession.windows,
                index,
                destination.index
              )
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
            //     index: destination.index,
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
    tryToastError(
      async ({
        source,
        destination,
        dryRun,
      }: {
        source: ActiveDraggable
        destination: ActiveDraggable & {
          incognito?: boolean // when no windowId is defined, otherwise incognito state depends on existing window
        }
        dryRun?: boolean
      }) => {
        console.log('move', sessionsManager, source, destination)
        if (
          sessionsManager &&
          isDefined(source.windowIndex) &&
          isDefined(source.tabIndex) &&
          isDefined(destination.windowIndex) &&
          isDefined(destination.tabIndex)
        ) {
          // TODO: Support multiple sessions and find windows from session
          const windows = sessionsManager.current.windows.slice() // clone
          // based on target, previous and next tabs, should the moved tab be pinned?
          if (destination.windowId && isDefined(destination.windowId)) {
            // default destination index to end of list
            destination.tabIndex =
              destination.tabIndex ??
              windows[destination.windowIndex].tabs.length

            const nextTabIndex =
              source.tabIndex > destination.tabIndex
                ? destination.tabIndex
                : destination.tabIndex + 1
            const previousTabIndex =
              nextTabIndex -
              1 -
              (source.windowId !== destination.windowId ? 1 : 0)
            const nextTab: SessionWindow['tabs'][number] | undefined =
              windows[destination.windowIndex].tabs[nextTabIndex]
            const previousTab: SessionWindow['tabs'][number] | undefined =
              windows[destination.windowIndex].tabs[previousTabIndex]

            // optimistically reorder for DND
            if (source.windowId === destination.windowId) {
              // moving to same window list
              windows[source.windowIndex].tabs = reorder(
                windows[destination.windowIndex].tabs,
                source.tabIndex,
                destination.tabIndex
              )
            } else {
              // moving to different window list
              // remove from original window tab list & insert into next window tab list
              const [modifiedFrom, modifiedTo] = spliceSeparate(
                windows[source.windowIndex].tabs,
                windows[destination.windowIndex].tabs,
                source.tabIndex,
                destination.tabIndex
              )
              windows[source.windowIndex].tabs = modifiedFrom
              windows[destination.windowIndex].tabs = modifiedTo
            }

            const targetTab =
              windows[destination.windowIndex].tabs[destination.tabIndex]
            targetTab.pinned = shouldPin(targetTab, previousTab, nextTab)
            windows[destination.windowIndex].tabs[destination.tabIndex] =
              targetTab

            if (!dryRun) {
              // side effects in browser
              addCurrentTabs(
                windows[destination.windowIndex],
                [targetTab],
                destination.tabIndex,
                targetTab.pinned
              )
            }
          } else {
            // TODO:
            // move tabs destination newly created window in a session
            const { incognito, state, height, width, top, left } =
              windows[source.windowIndex]
            const tab = windows[source.windowIndex].tabs[source.tabIndex]
            // create saved but `addWindow` will coerce window destination match windows list
            if (!dryRun) {
              const newWindow = createSaved({
                tabs: [tab],
                incognito: isDefined(destination.incognito)
                  ? destination.incognito
                  : incognito,
                focused: false,
                state,
                height,
                width,
                top,
                left,
              })
              sessionsManager.current.windows = (await addWindow(windows, {
                window: newWindow,
                index: destination.windowIndex || windows.length,
              })) as CurrentSessionWindow[]
            } else {
              // TODO: dry run window creation on sessionsManager
            }
          }
          // if (!destination.windowId || from.sessionId !== sessionsManager.current.id) {
          //   tabs.forEach((t) => {
          //     const index = findTabIndex(
          //       fromSession.windows[fromWindowIndex].tabs,
          //       t.id
          //     )
          //     tabs.splice(index, 1)
          //   })
          // }

          // Set optimistically so DND doesn't have destination wait
          setSessionsManager(sessionsManager)
          if (!dryRun) {
            void save(sessionsManager)
          }
          // if (
          //   [source.sessionId, destination.sessionId].includes(
          //     sessionsManager.current.id
          //   )
          // ) {
          //   const asyncUpdate = async () => {
          //     setSessionsManager(await updateCurrentSessionNow(sessionsManager))
          //   }

          //   void asyncUpdate()
          // }
        } else {
          throw Error(
            'Unable destination save changes, please refresh the extension and try again.'
          )
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
