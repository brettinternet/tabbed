import { useCallback } from 'react'
import { Runtime } from 'webextension-polyfill'

import { ToastOptions } from 'components/toast/store'
import { log } from 'utils/logger'

export const useErrorHandler = (
  addToast: (toastOptions: ToastOptions) => void
) => {
  const handleError = useCallback(
    (error: unknown) => {
      log.error(error)
      const { message } = error as Runtime.PropertyLastErrorType
      if (message) {
        addToast({ message, variant: 'error' })
      }
    },
    [addToast]
  )

  return handleError
}
