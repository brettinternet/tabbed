import { atom, SetStateAction, useAtom } from 'jotai'
import { cloneDeep } from 'lodash'
import { useEffect } from 'react'

import { useBackground } from 'components/app/store'
import { useTryToastError } from 'components/error/handlers'
import { useSettings } from 'components/settings/store'
import { log } from 'utils/logger'
import {
  createPortMessageListener,
  CurrentSessionChangeMessage,
  MESSAGE_TYPE_CURRENT_SESSION_CHANGE,
} from 'utils/messages'
import {
  loadSessionsManager,
  save,
  SessionsManager,
  updateCurrentSession,
} from 'utils/sessions-manager'

const logContext = 'components/session/store'

export const sessionsManagerAtom = atom<SessionsManager | undefined>(undefined)

export const useSessionsManager = (): [
  SessionsManager | undefined,
  (update?: SetStateAction<SessionsManager | undefined>) => void
] => {
  const port = useBackground()
  const tryToastError = useTryToastError()
  const [settings] = useSettings()
  const sortFocusedWindowFirst = settings.sortFocusedWindowFirst
  const [sessionsManager, setSessionsManager] = useAtom(sessionsManagerAtom)

  useEffect(() => {
    const load = tryToastError(async () => {
      setSessionsManager(await loadSessionsManager())
    })

    void load()
  }, [setSessionsManager, tryToastError])

  useEffect(() => {
    if (!port || !sessionsManager) {
      return
    }

    const removeListener =
      createPortMessageListener<CurrentSessionChangeMessage>(
        port,
        MESSAGE_TYPE_CURRENT_SESSION_CHANGE,
        async () => {
          if (sessionsManager) {
            setSessionsManager(
              await updateCurrentSession(
                sessionsManager,
                sortFocusedWindowFirst
              )
            )
          }
        }
      )

    return removeListener
  }, [port, sessionsManager, setSessionsManager, sortFocusedWindowFirst])

  useEffect(() => {
    const handleUnload = async () => {
      if (sessionsManager) {
        await save(sessionsManager)
      }
    }
    window.addEventListener('unload', handleUnload)
    return () => {
      window.removeEventListener('unload', handleUnload)
    }
  }, [sessionsManager])

  // Prevent mutations with clone
  const _sessionsManager = cloneDeep(sessionsManager)
  log.debug(logContext, 'useSessionsManager()', _sessionsManager)
  return [_sessionsManager, setSessionsManager]
}
