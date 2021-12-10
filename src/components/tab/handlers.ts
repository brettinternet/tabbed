import { useCallback } from 'react'

import { useTryToastError } from 'components/error/handlers'
import {
  createMessageAction,
  MESSAGE_TYPE_OPEN_SESSION_TABS,
  OpenSessionTabsMessage,
  MESSAGE_TYPE_REMOVE_SESSION_TABS,
  RemoveSessionTabsMessage,
  PatchTabMessage,
  MESSAGE_TYPE_PATCH_TAB,
  DiscardTabsMessage,
  MESSAGE_TYPE_DISCARD_TABS,
} from 'utils/messages'

const logContext = 'components/tab/handlers'

export const useHandlers = () => {
  const tryToastError = useTryToastError(logContext)

  const handleOpenTab = useCallback(
    tryToastError(
      createMessageAction<OpenSessionTabsMessage>(
        MESSAGE_TYPE_OPEN_SESSION_TABS
      )
    ),
    [tryToastError]
  )
  const handleRemoveTab = useCallback(
    tryToastError(
      createMessageAction<RemoveSessionTabsMessage>(
        MESSAGE_TYPE_REMOVE_SESSION_TABS
      )
    ),
    [tryToastError]
  )
  const handleUpdateTab = useCallback(
    tryToastError(createMessageAction<PatchTabMessage>(MESSAGE_TYPE_PATCH_TAB)),
    [tryToastError]
  )
  const handleDiscardTab = useCallback(
    tryToastError(
      createMessageAction<DiscardTabsMessage>(MESSAGE_TYPE_DISCARD_TABS)
    ),
    [tryToastError]
  )

  return {
    handleOpenTab,
    handleRemoveTab,
    handleUpdateTab,
    handleDiscardTab,
  }
}
