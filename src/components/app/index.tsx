// import { useEffect, useState } from 'react'
import { useEffect, useState } from 'react'

import { useErrorHandler } from 'components/error/handlers'
import { Layout } from 'components/layout'
import { SessionLayout } from 'components/session'
import { ToastContainer } from 'components/toast'
import { useToasts } from 'components/toast/store'

import { getSettings, startListeners } from './api'
import { useSettings } from './store'

// import { setupListeners } from './listeners'
// import { log } from 'utils/logger'

// const logContext = 'components/app/app.svelte'

// const getActiveModal = (modal: string | undefined) => {
//   switch (modal) {
//     case 'settings':
//       return SettingsModal
//     case 'shortcuts':
//       return ShortcutsModal
//     case 'importer':
//       return ImportModal
//   }
// }

// TODO: open settings modal
const openSettings = () => {}

export const App = () => {
  const [, setSettings] = useSettings()
  const [isLoading, setLoading] = useState(true)
  const { add: addToast } = useToasts()
  const handleError = useErrorHandler(addToast)
  // const [Modal, setModal] = useState()

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
  }, [setSettings, addToast])

  // useEffect(() => {
  //   getActiveModal(modal)
  // }, [modal])

  if (!isLoading) {
    return (
      <Layout onClickSettings={openSettings}>
        {/* <Modal /> */}
        <SessionLayout />
        <ToastContainer />
      </Layout>
    )
  }

  return null
}
