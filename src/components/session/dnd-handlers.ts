import { cloneDeep, merge } from 'lodash'
import { useCallback } from 'react'
import { Tabs } from 'webextension-polyfill'

import { generateWindowTitle } from 'utils/generate'
import { reorder, spliceSeparate } from 'utils/helpers'
import { isDefined } from 'utils/helpers'
import { Session, isCurrentSession } from 'utils/session'
import { isCurrentSessionTab, shouldPin } from 'utils/session-tab'
import {
  findWindowIndex,
  filterWindows,
  SessionWindow,
  createSaved as createSavedWindow,
  isCurrentSessionWindow,
  createCurrentDraft as createCurrentDraftWindow,
  move as moveWindowTab,
} from 'utils/session-window'
import { getSession, save, updateSessionsManager } from 'utils/sessions-manager'

import { useHelpers } from './helpers'

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

  // Cannot be async for DnD library!
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const moveTabs = useCallback(
    tryToastError(({ from, to }: MoveTabArgs) => {
      if (sessionsManager) {
        const isSameSessionMove = from.sessionId === to.sessionId
        const isSameWindowMove = from.windowId === to.windowId
        const toSession = getSession(sessionsManager, to.sessionId)
        const fromSession = isSameSessionMove
          ? cloneDeep(toSession)
          : getSession(sessionsManager, from.sessionId)
        const fromWindowIndex = findWindowIndex(
          fromSession.windows,
          from.windowId
        )

        // create target window if none
        let draftWindowParams:
          | ReturnType<typeof createCurrentDraftWindow>
          | undefined
        if (!to.windowId) {
          const {
            incognito,
            state,
            height,
            width,
            top,
            left,
            focused: fromWindowFocused,
          } = fromSession.windows[fromWindowIndex]
          const tab = fromSession.windows[fromWindowIndex].tabs[from.index]
          const focused = fromWindowFocused && tab.active
          const newWindowProps = {
            tabs: [],
            incognito: isDefined(to.incognito) ? to.incognito : incognito,
            focused,
            state,
            height,
            width,
            top,
            left,
          }
          if (isCurrentSession(toSession)) {
            draftWindowParams = createCurrentDraftWindow(newWindowProps)
            toSession.windows.push(draftWindowParams.window)
            to.windowId = draftWindowParams.window.id
          } else {
            const newWindow = createSavedWindow(newWindowProps)
            toSession.windows.push(newWindow)
            to.windowId = newWindow.id
          }
        }

        if (to.windowId) {
          if (!isDefined(to.index)) {
            to.index = 0
          }
          // move tabs to specific session window
          const toWindowIndex = findWindowIndex(toSession.windows, to.windowId)
          const toTabs = cloneDeep(toSession.windows[toWindowIndex].tabs)

          if (isSameWindowMove) {
            // move within same window
            toSession.windows[toWindowIndex].tabs = reorder(
              toTabs,
              from.index,
              to.index
            )
          } else {
            // move tabs to separate window
            const fromTabs = fromSession.windows[fromWindowIndex].tabs
            const [updatedFromTabs, updatedToTabs] = spliceSeparate(
              fromTabs,
              toTabs,
              from.index,
              to.index
            )
            toSession.windows[toWindowIndex].tabs = updatedToTabs
            if (updatedFromTabs.length > 0) {
              // assign tabs with target tab removed
              fromSession.windows[fromWindowIndex].tabs = updatedFromTabs
              fromSession.windows[fromWindowIndex].title =
                generateWindowTitle(updatedFromTabs)
              if (updatedFromTabs.length === 1) {
                // remaining tab is active
                fromSession.windows[fromWindowIndex].tabs[0].active = true
              }
            } else {
              // remove empty window
              fromSession.windows.splice(fromWindowIndex, 1)
            }
          }

          // Update moved tab for side effects/value changes
          const targetWindow = toSession.windows[toWindowIndex]
          toSession.windows[toWindowIndex].title = generateWindowTitle(
            targetWindow.tabs
          )
          const target = targetWindow.tabs[to.index]
          // based on target, previous and next tabs, should the moved tab be pinned?
          const indexModifier = from.index > to.index ? 0 : 1
          const index = to.index + indexModifier
          const nextTab: SessionWindow['tabs'][number] | undefined =
            toTabs[index]
          const previousTab: SessionWindow['tabs'][number] | undefined =
            toTabs[index - 1 - (from.windowId !== to.windowId ? 1 : 0)]
          target.pinned = shouldPin(target, previousTab, nextTab)
          target.active = false
          if (
            !draftWindowParams &&
            isCurrentSessionTab(target) &&
            isCurrentSessionWindow(targetWindow)
          ) {
            target.assignedWindowId = targetWindow.assignedWindowId
            // side effects in browser
            void moveWindowTab(
              [target],
              to.index,
              target.pinned,
              targetWindow.assignedWindowId
            )
          }

          // maybe combine to and from windows into session
          let updatedSession = toSession
          if (isSameSessionMove && !isSameWindowMove) {
            // commbine to and from windows
            const fromWindow = fromSession.windows[fromWindowIndex]
            if (fromWindow) {
              updatedSession.windows[fromWindowIndex] = cloneDeep(fromWindow)
            } else {
              updatedSession.windows.splice(fromWindowIndex, 1)
            }
          }

          // update session manager
          let updatedSessionsManager = updateSessionsManager(
            sessionsManager,
            updatedSession
          )
          if (!isSameSessionMove) {
            updatedSessionsManager = updateSessionsManager(
              updatedSessionsManager,
              fromSession
            )
          }
          setSessionsManager(updatedSessionsManager)

          // update drafted new window with real browser window and tab IDs
          if (draftWindowParams && isCurrentSessionTab(target)) {
            void draftWindowParams.commit(async (newWindow) => {
              setSessionsManager((sessionsManager) => {
                if (sessionsManager) {
                  const index = sessionsManager.current.windows.findIndex(
                    (w) =>
                      w.assignedWindowId ===
                      draftWindowParams?.draftAssignedWindowId
                  )
                  target.assignedWindowId = newWindow.assignedWindowId
                  newWindow.tabs = [target]
                  if (index > -1) {
                    const mergedWindow = merge(
                      sessionsManager.current.windows[index],
                      newWindow
                    )
                    sessionsManager.current.windows[index] = mergedWindow
                    void moveWindowTab(
                      [target],
                      0,
                      target.pinned,
                      mergedWindow.assignedWindowId
                    )
                  }
                  return sessionsManager
                }
              })
            })
          }

          if (
            ![from.sessionId, to.sessionId].includes(
              updatedSessionsManager.current.id
            )
          ) {
            void save(updatedSessionsManager)
          }
          return {
            windowId: to.windowId,
            tabId: target.id,
          }
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
