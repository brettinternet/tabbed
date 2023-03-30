import { useCallback } from 'react'

import { Session, update as _updateSession } from 'utils/session'
import {
  removeTabs as _removeTabs,
  update as _updateTab,
} from 'utils/session-tab'
import {
  findWindowIndex,
  removeWindows as _removeWindows,
  filterWindows,
  SessionWindow,
  findWindow,
  isCurrentSessionWindow,
  focus as focusWindow,
  open as openWindow,
  update as _updateWindow,
} from 'utils/session-window'
import {
  updateCurrentSession,
  addSaved,
  getSession,
  save,
  updateSessionsManager,
} from 'utils/sessions-manager'

import { useHelpers } from './helpers'

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
        const updatedSessionsManager = updateSessionsManager(
          sessionsManager,
          session
        )
        if (sessionsManager.current.id === sessionId) {
          setSessionsManager(updatedSessionsManager)
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
          const updatedSessionsManager = updateSessionsManager(
            sessionsManager,
            session
          )
          if (sessionsManager.current.id === sessionId) {
            setSessionsManager(updatedSessionsManager)
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
