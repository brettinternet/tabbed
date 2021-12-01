import { useCallback } from 'react'

import { useErrorHandler } from 'components/error/handlers'
import { ToastOptions } from 'components/toast/store'
import { log } from 'utils/logger'
import { OpenWindowOptions, PatchWindowOptions } from 'utils/messages'

import { saveWindow, openWindow, patchWindow, removeWindow } from './api'

const logContext = 'components/window/handlers'

export const useHandlers = (addToast: (toastOptions: ToastOptions) => void) => {
  const handleError = useErrorHandler(addToast)

  const handleOpenWindow = useCallback(
    async (
      sessionId: string,
      windowId: number,
      options?: OpenWindowOptions
    ) => {
      try {
        await openWindow(sessionId, windowId, options)
      } catch (err) {
        handleError(err)
      }
    },
    [handleError]
  )

  const handleSaveWindow = useCallback(
    async (sessionId: string, windowId: number) => {
      try {
        await saveWindow(sessionId, windowId)
      } catch (err) {
        handleError(err)
      }
    },
    [handleError]
  )

  const handleRemoveWindow = useCallback(
    async (sessionId: string, windowId: number) => {
      try {
        await removeWindow(sessionId, windowId)
      } catch (err) {
        handleError(err)
      }
    },
    [handleError]
  )

  const handleUpdateWindow = useCallback(
    async (
      sessionId: string,
      windowId: number,
      options: PatchWindowOptions
    ) => {
      try {
        await patchWindow(sessionId, windowId, options)
      } catch (err) {
        handleError(err)
      }
    },
    [handleError]
  )

  return {
    handleOpenWindow,
    handleSaveWindow,
    handleRemoveWindow,
    handleUpdateWindow,
  }
}
