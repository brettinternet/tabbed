import { useCallback } from 'react'

import {
  Session,
  open as openSession,
  update as _updateSession,
  SavedSessionCategoryType,
} from 'utils/session'
import {
  removeTabs as _removeTabs,
  update as _updateTab,
} from 'utils/session-tab'
import {
  removeWindows as _removeWindows,
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
} from 'utils/sessions-manager'

import { useHelpers } from './helpers'

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
