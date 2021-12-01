import { useCallback, useEffect, useState } from 'react'

import { useErrorHandler } from 'components/error/handlers'
import { Layout } from 'components/layout'
import { ModalProvider } from 'components/modal/provider'
import { useModal } from 'components/modal/store'
import { SessionLayout } from 'components/session'
import { useShortcuts } from 'components/shortcuts/store'
import { ToastContainer } from 'components/toast'
import { useToasts } from 'components/toast/store'

import { getSettings, startListeners } from './api'
import { useSettings } from './store'

export const App = () => {
  const {
    settings: { set: setSettingsModal },
  } = useModal()
  const [settings, setSettings] = useSettings()
  const [isLoading, setLoading] = useState(true)
  const { add: addToast } = useToasts()
  const handleError = useErrorHandler(addToast)
  useShortcuts(settings.shortcuts)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSettings() // ~29 ms
        if (settings) {
          setSettings(settings)
        } else {
          addToast({
            title: 'Error',
            message: 'Unable to load app. Please reopen the extension.',
            variant: 'error',
            autoDismiss: false,
          })
        }
        setLoading(false)
      } catch (err) {
        handleError(err)
      }
    }

    void fetchSettings()

    startListeners(setSettings)
  }, [setSettings, addToast, handleError])

  const enableSettings = useCallback(() => {
    setSettingsModal(true)
  }, [setSettingsModal])

  if (!isLoading) {
    return (
      <Layout onClickSettings={enableSettings}>
        <SessionLayout />
        <ToastContainer />
        <ModalProvider />
      </Layout>
    )
  }

  return null
}
