// import { useEffect, useState } from 'react'
import { useEffect, useState } from 'react'

import { Layout } from 'components/layout'
import { SessionLayout } from 'components/session'
import { ToastContainer } from 'components/toast'
import { useToasts } from 'components/toast/store'

import { getSettings, startListeners } from './api'
import { useSettings, isPopup } from './store'

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
  const [settings, setSettings] = useSettings()
  const [isLoading, setLoading] = useState(true)
  const { add: addToast } = useToasts()
  // const [Modal, setModal] = useState()

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getSettings() // ~29 ms
      if (settings) {
        setSettings(settings)
      } else {
        console.log('NO SETTINGS')
        addToast({
          title: 'Error',
          message: 'Unable to load app',
          variant: 'error',
          autoDismiss: false,
        })
      }
      setLoading(false)
    }

    void fetchSettings()

    startListeners(setSettings)
  }, [setSettings, addToast])

  // useEffect(() => {
  //   getActiveModal(modal)
  // }, [modal])

  if (!isLoading) {
    return (
      <Layout
        onClickSettings={openSettings}
        height={isPopup ? settings.popupDimensions.height : undefined}
      >
        {/* <Modal /> */}
        <SessionLayout />
        <ToastContainer />
      </Layout>
    )
  }

  return null
}
