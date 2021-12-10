import { useCallback } from 'react'

import { useTryToastError } from 'components/error/handlers'
import {
  createMessageAction,
  SearchSessionsMessage, // SearchSessionsResponse,
} from 'utils/messages'
import { MESSAGE_TYPE_SEARCH_SESSIONS } from 'utils/messages'

const logContext = 'components/header/api'

export const useSearch = () => {
  const tryToastError = useTryToastError(logContext)

  const searchSessions = useCallback(
    tryToastError(
      createMessageAction<SearchSessionsMessage, {}>(
        MESSAGE_TYPE_SEARCH_SESSIONS
      )
    ),
    [tryToastError]
  )

  return { searchSessions }
}
