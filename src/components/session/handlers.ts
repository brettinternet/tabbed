import { useCallback, useEffect } from 'react'

import { useTryToastError } from 'components/error/handlers'
import {
  MESSAGE_TYPE_GET_SESSIONS_MANAGER_DATA,
  GetSessionsManagerDataMessage,
  GetSessionListsResponse,
  MESSAGE_TYPE_SAVE_EXISTING_SESSION,
  SaveExistingSessionMessage,
  MESSAGE_TYPE_OPEN_SESSIONS,
  OpenSessionsMessage,
  MESSAGE_TYPE_DELETE_SESSIONS,
  DeleteSessionsMessage,
  MESSAGE_TYPE_UPDATE_SESSION,
  UpdateSessionMessage,
  MESSAGE_TYPE_MOVE_TABS,
  MESSAGE_TYPE_DOWNLOAD_SESSIONS,
  MESSAGE_TYPE_QUERY_SESSION,
  MoveTabsMessage,
  DownloadSessionsMessage,
  MESSAGE_TYPE_FIND_DUPLICATE_SESSION_TABS,
  FindDuplicateSessionTabsMessage,
  FindDuplicateSessionTabsResponse,
  QuerySessionMessage,
  QuerySessionResponse,
  PushSessionManagerDataMessage,
  MESSAGE_TYPE_PUSH_SESSIONS_MANAGER_DATA,
  createMessageListener,
  createMessageAction,
} from 'utils/messages'
import { SessionsManagerData } from 'utils/sessions'

const logContext = 'components/sessions/handlers'

export const useListeners = (
  setSessionsManager: React.Dispatch<
    React.SetStateAction<SessionsManagerData | undefined>
  >
) => {
  useEffect(() => {
    createMessageListener<PushSessionManagerDataMessage<SessionsManagerData>>(
      MESSAGE_TYPE_PUSH_SESSIONS_MANAGER_DATA,
      setSessionsManager,
      true
    )
  }, [setSessionsManager])
}

export const useHandlers = () => {
  const tryToastError = useTryToastError(logContext)

  const getSessionsManagerData = useCallback(
    tryToastError(
      createMessageAction<
        GetSessionsManagerDataMessage,
        GetSessionListsResponse
      >(MESSAGE_TYPE_GET_SESSIONS_MANAGER_DATA, true)
    ),
    [tryToastError]
  )

  const querySession = useCallback(
    tryToastError(
      createMessageAction<QuerySessionMessage, QuerySessionResponse>(
        MESSAGE_TYPE_QUERY_SESSION
      )
    ),
    [tryToastError]
  )

  const saveExistingSession = useCallback(
    tryToastError(
      createMessageAction<SaveExistingSessionMessage>(
        MESSAGE_TYPE_SAVE_EXISTING_SESSION
      )
    ),
    [tryToastError]
  )

  const openSession = useCallback(
    tryToastError(
      createMessageAction<OpenSessionsMessage>(MESSAGE_TYPE_OPEN_SESSIONS)
    ),
    [tryToastError]
  )

  const deleteSession = useCallback(
    tryToastError(
      createMessageAction<DeleteSessionsMessage>(MESSAGE_TYPE_DELETE_SESSIONS)
    ),
    [tryToastError]
  )

  const renameSession = useCallback(
    tryToastError(
      createMessageAction<UpdateSessionMessage>(MESSAGE_TYPE_UPDATE_SESSION)
    ),
    [tryToastError]
  )

  const moveTabs = useCallback(
    tryToastError(createMessageAction<MoveTabsMessage>(MESSAGE_TYPE_MOVE_TABS)),
    [tryToastError]
  )

  const downloadSessions = useCallback(
    tryToastError(
      createMessageAction<DownloadSessionsMessage>(
        MESSAGE_TYPE_DOWNLOAD_SESSIONS
      )
    ),
    [tryToastError]
  )

  return {
    getSessionsManagerData,
    querySession,
    saveExistingSession,
    openSession,
    deleteSession,
    renameSession,
    moveTabs,
    downloadSessions,
  }
}
