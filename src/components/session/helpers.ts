import { useAtom } from 'jotai'

import { useTryToastError } from 'components/error/handlers'

import { sessionsManagerAtom } from './store'

export const useHelpers = () => {
  const tryToastError = useTryToastError()
  const [sessionsManager, setSessionsManager] = useAtom(sessionsManagerAtom)

  return {
    tryToastError,
    sessionsManager,
    setSessionsManager,
  }
}
