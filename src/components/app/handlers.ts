import { useCallback, useEffect } from 'react'

import { useTryToastError } from 'components/error/handlers'
import {
  MESSAGE_TYPE_GET_SETTINGS,
  GetSettingsMessage,
  GetSettingsResponse,
  MESSAGE_TYPE_PUSH_SETTINGS,
  PushSettingsMessage,
  MESSAGE_TYPE_UPDATE_SETTINGS,
  UpdateSettingsMessage,
  UpdateSettingsResponse,
  createMessageAction,
  createMessageListener,
} from 'utils/messages'

import type { SetSettings } from './store'

const logContext = 'components/app/handlers'

export const useHandlers = (setSettings: SetSettings) => {
  const tryToastError = useTryToastError(logContext)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getSettings = useCallback(
    tryToastError(
      createMessageAction<GetSettingsMessage, GetSettingsResponse>(
        MESSAGE_TYPE_GET_SETTINGS
      )
    ),
    [tryToastError]
  )

  useEffect(() => {
    createMessageListener<PushSettingsMessage>(
      MESSAGE_TYPE_PUSH_SETTINGS,
      setSettings
    )
  }, [setSettings])

  return { getSettings }
}

export const saveSettings = createMessageAction<
  UpdateSettingsMessage,
  UpdateSettingsResponse
>(MESSAGE_TYPE_UPDATE_SETTINGS)
