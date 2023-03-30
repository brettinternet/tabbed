import { useCallback } from 'react'

import { useBackground } from 'components/app/store'
import { useTryToastError } from 'components/error/handlers'
import {
  createMessageAction,
  SearchSessionsMessage, // SearchSessionsResponse,
} from 'utils/messages'
import { MESSAGE_TYPE_SEARCH_SESSIONS } from 'utils/messages'

const logContext = 'components/header/api'

export const useSearch = () => {
  const tryToastError = useTryToastError(logContext)
  const port = useBackground()

  const searchSessions = useCallback(
    tryToastError(
      createMessageAction<SearchSessionsMessage>(
        port,
        MESSAGE_TYPE_SEARCH_SESSIONS
      )
    ),
    [tryToastError]
  )

  return { searchSessions }
}
