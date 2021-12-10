import { useCallback } from 'react'

import { useTryToastError } from 'components/error/handlers'
import {
  createMessageAction,
  MESSAGE_TYPE_OPEN_SESSION_WINDOWS,
  OpenSessionWindowsMessage,
  MESSAGE_TYPE_REMOVE_SESSION_WINDOWS,
  RemoveSessionWindowsMessage,
  MESSAGE_TYPE_PATCH_WINDOW,
  PatchWindowMessage,
  MESSAGE_TYPE_SAVE_WINDOWS,
  SaveWindowsMessage,
} from 'utils/messages'

const logContext = 'components/window/handlers'

export const useHandlers = () => {
  const tryToastError = useTryToastError(logContext)

  const handleOpenWindow = useCallback(
    tryToastError(
      createMessageAction<OpenSessionWindowsMessage>(
        MESSAGE_TYPE_OPEN_SESSION_WINDOWS
      )
    ),
    [tryToastError]
  )

  const handleSaveWindow = useCallback(
    tryToastError(
      createMessageAction<SaveWindowsMessage>(MESSAGE_TYPE_SAVE_WINDOWS)
    ),
    [tryToastError]
  )

  const handleRemoveWindow = useCallback(
    tryToastError(
      createMessageAction<RemoveSessionWindowsMessage>(
        MESSAGE_TYPE_REMOVE_SESSION_WINDOWS
      )
    ),
    [tryToastError]
  )

  const handleUpdateWindow = useCallback(
    tryToastError(
      createMessageAction<PatchWindowMessage>(MESSAGE_TYPE_PATCH_WINDOW)
    ),
    [tryToastError]
  )

  return {
    handleOpenWindow,
    handleSaveWindow,
    handleRemoveWindow,
    handleUpdateWindow,
  }
}
