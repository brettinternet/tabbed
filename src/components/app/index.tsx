import { useEffect, useState } from 'react'

import { Layout } from 'components/layout'
import { ModalProvider } from 'components/modal/provider'
import { SessionLayout } from 'components/session'
import { useShortcuts } from 'components/shortcuts/store'
import { ToastContainer } from 'components/toast'
import { useToasts } from 'components/toast/store'

import { useHandlers } from './handlers'
import { useSettings } from './store'

export const App = () => {
  const [settings, setSettings] = useSettings()
  const [isLoading, setLoading] = useState(true)
  const { add: addToast } = useToasts()
  const { getSettings } = useHandlers(setSettings)
  useShortcuts(settings?.shortcuts || false)

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getSettings() // ~29 ms
      if (settings) {
        setSettings(settings)
      } else {
        addToast({
          title: 'Error',
          message: 'Unable to load app. Please refresh the extension.',
          variant: 'error',
          autoDismiss: false,
        })
      }
      setLoading(false)
    }

    void fetchSettings()
  }, [setSettings, addToast, getSettings])

  if (!isLoading) {
    return (
      <Layout>
        <SessionLayout />
        <ToastContainer />
        <ModalProvider />
      </Layout>
    )
  }

  return null
}
