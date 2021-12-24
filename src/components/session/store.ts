import { atom, SetStateAction, useAtom } from 'jotai'
import { useEffect } from 'react'

import { useBackground } from 'components/app/store'
import { useTryToastError } from 'components/error/handlers'
import {
  createMessageListener,
  CurrentSessionChangeMessage,
  MESSAGE_TYPE_CURRENT_SESSION_CHANGE,
} from 'utils/messages'
import {
  loadSessionsManager,
  save,
  SessionsManager, // updateCurrentSession,
} from 'utils/sessions-manager'

export const sessionsManagerAtom = atom<SessionsManager | undefined>(undefined)

export const useSessionsManager = (): [
  SessionsManager | undefined,
  (update?: SetStateAction<SessionsManager | undefined>) => void
] => {
  const port = useBackground()
  const tryToastError = useTryToastError()
  const [sessionsManager, setSessionsManager] = useAtom(sessionsManagerAtom)
  console.log('SESSIONS/STORE: sessionsManager: ', sessionsManager)

  useEffect(() => {
    const load = tryToastError(async () => {
      setSessionsManager(await loadSessionsManager())
    })

    console.log('--------------- LOADING sessions')
    void load()
  }, [setSessionsManager, tryToastError])

  useEffect(() => {
    const { startListener, removeListener } =
      createMessageListener<CurrentSessionChangeMessage>(
        port,
        MESSAGE_TYPE_CURRENT_SESSION_CHANGE,
        async () => {
          if (sessionsManager) {
            console.log('told to reload sessions.........')
            // setSessionsManager(await updateCurrentSession(sessionsManager))
          }
        }
      )

    console.log('>>>>>>>>>> loading LISTENER')
    startListener()

    const handleUnload = async () => {
      if (sessionsManager) {
        await save(sessionsManager)
      }
    }
    window.addEventListener('unload', handleUnload)
    return () => {
      removeListener()
      window.removeEventListener('unload', handleUnload)
    }
  }, [port, sessionsManager])

  return [sessionsManager, setSessionsManager]
}
