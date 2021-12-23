import { atom, SetStateAction, useAtom } from 'jotai'
import { useEffect } from 'react'

import { useBackground } from 'components/app/store'
import { useTryToastError } from 'components/error/handlers'
import {
  createMessageListener,
  CurrentSessionChangeMessage,
  MESSAGE_TYPE_CURRENT_SESSION_CHANGE,
} from 'utils/messages'
import { loadSessionsManager, SessionsManager } from 'utils/sessions-manager'

export const sessionsManagerAtom = atom<SessionsManager | undefined>(undefined)

export const useSessionsManager = (): [
  SessionsManager | undefined,
  (update?: SetStateAction<SessionsManager | undefined>) => void
] => {
  // const port = useBackground()
  const tryToastError = useTryToastError()
  const [sessionsManager, setSessionsManager] = useAtom(sessionsManagerAtom)

  useEffect(() => {
    const load = tryToastError(async () => {
      setSessionsManager(await loadSessionsManager())
    })

    console.log('--------------- LOADING sessions')
    void load()
  }, [])

  // useEffect(() => {
  //   const { startListener, removeListener } =
  //     createMessageListener<CurrentSessionChangeMessage>(
  //       port,
  //       MESSAGE_TYPE_CURRENT_SESSION_CHANGE,
  //       async () => {
  //         if (sessionsManager) {
  //           setSessionsManager(await updateCurrentSession(sessionsManager))
  //         }
  //       }
  //     )

  //   console.log('>>>>>>>>>> loading LISTENER')
  //   startListener()
  //   return removeListener
  // }, [sessionsManager])

  return [sessionsManager, setSessionsManager]
}
