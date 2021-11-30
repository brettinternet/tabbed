import { useCallback } from 'react'
import { Runtime } from 'webextension-polyfill'

import { ToastOptions } from 'components/toast/store'
import { log } from 'utils/logger'
import { OpenTabOptions, PatchTabOptions } from 'utils/messages'

import { openTab, removeTab, patchTab, discardTabs } from './api'

const logContext = 'components/window/handlers'

export const useHandlers = (addToast: (toastOptions: ToastOptions) => void) => {
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

  const handleOpenTab = useCallback(
    async (options: {
      sessionId: string
      windowId: number
      tabId: number
      options?: OpenTabOptions
    }) => {
      try {
        await openTab(options)
      } catch (err) {
        handleError(err)
      }
    },
    [handleError]
  )

  const handleRemoveTab = useCallback(
    async (options: { sessionId: string; windowId: number; tabId: number }) => {
      try {
        await removeTab(options)
      } catch (err) {
        handleError(err)
      }
    },
    [handleError]
  )

  const handleUpdateTab = useCallback(
    async (options: {
      sessionId: string
      windowId: number
      tabId: number
      options: PatchTabOptions
    }) => {
      try {
        await patchTab(options)
      } catch (err) {
        handleError(err)
      }
    },
    [handleError]
  )

  const handleDiscardTab = useCallback(
    async ({
      sessionId,
      windowId,
      tabId,
    }: {
      sessionId: string
      windowId: number
      tabId: number
    }) => {
      try {
        await discardTabs({ sessionId, windowId, tabIds: tabId })
      } catch (err) {
        handleError(err)
      }
    },
    [handleError]
  )

  return {
    handleOpenTab,
    handleRemoveTab,
    handleUpdateTab,
    handleDiscardTab,
  }
}
