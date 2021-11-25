// import { useEffect, useState } from 'react'
import { Layout } from 'components/layout'
// import { setupListeners } from './listeners'
// import { log } from 'utils/logger'

// const logContext = 'components/app/app.svelte'

const settings = {
  popupDimensions: {
    height: 700,
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
      hiiii
      {/* <Modal /> */}
    </Layout>
  )
}

// import browser from 'webextension-polyfill'
