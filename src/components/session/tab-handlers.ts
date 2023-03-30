import { useCallback } from 'react'

import { generateWindowTitle } from 'utils/generate'
import { reorder } from 'utils/helpers'
import { isDefined } from 'utils/helpers'
import { Session, update as _updateSession } from 'utils/session'
import {
  SessionTab,
  removeTabs as _removeTabs,
  isCurrentSessionTab,
  focus as focusTab,
  open as openTab,
  findTab,
  update as _updateTab,
  findTabIndex,
} from 'utils/session-tab'
import {
  findWindowIndex,
  removeWindows as _removeWindows,
  SessionWindow,
  findWindow,
  update as _updateWindow,
} from 'utils/session-window'
import {
  updateCurrentSession,
  getSession,
  save,
  updateSessionsManager,
} from 'utils/sessions-manager'

import { useHelpers } from './helpers'

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
            let toIndex = originalTabs.findIndex((t) => !t.pinned)
            if (toIndex === -1) {
              toIndex = originalTabs.length
            }
            const indexModifier = tabIndex < toIndex ? -1 : 0
            toIndex += indexModifier
            session.windows[winIndex].tabs = reorder(
              session.windows[winIndex].tabs,
              tabIndex,
              toIndex
            )
          }

          if (sessionsManager.current.id === sessionId) {
            setSessionsManager(updateSessionsManager(sessionsManager, session))
          } else {
            void save(sessionsManager)
            setSessionsManager(sessionsManager)
          }
        }
      }
    ),
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
            const targetWindow = session.windows[index]
            session.windows[index].tabs = await _removeTabs(
              targetWindow.tabs,
              tabIds
            )
            if (targetWindow.tabs.length) {
              session.windows[index].title = generateWindowTitle(
                targetWindow.tabs
              )
            } else {
              session.windows = await _removeWindows(session.windows, [
                targetWindow.id,
              ])
            }
          }
          if (sessionsManager.current.id === sessionId) {
            setSessionsManager(updateSessionsManager(sessionsManager, session))
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
