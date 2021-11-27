// import { useEffect, useState } from 'react'
import { Layout } from 'components/layout'
import { SessionLayout } from 'components/session'
import { ToastProvider } from 'components/toast'

// import { setupListeners } from './listeners'
// import { log } from 'utils/logger'

// const logContext = 'components/app/app.svelte'

const settings = {
  popupDimensions: {
    height: 600,
  },
}

const isPopup = true

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
  // const [Modal, setModal] = useState()

  // useEffect(setupListeners, [setupListeners])
  // useEffect(() => {
  //   getActiveModal(modal)
  // }, [modal])

  return (
    <Layout
      onClickSettings={openSettings}
      height={isPopup ? settings.popupDimensions?.height : undefined}
    >
      {/* <Modal /> */}
      <SessionLayout />
      <ToastProvider />
    </Layout>
  )
}

// import browser from 'webextension-polyfill'
