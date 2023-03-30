import { useAtom } from 'jotai'

import { useTryToastError } from 'components/error/handlers'
import { update as _updateSession } from 'utils/session'
import {
  removeTabs as _removeTabs,
  update as _updateTab,
} from 'utils/session-tab'
import {
  removeWindows as _removeWindows,
  update as _updateWindow,
} from 'utils/session-window'

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
