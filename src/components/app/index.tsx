import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { Layout } from 'components/layout'
import { ModalProvider } from 'components/modal/provider'
import { SessionLayout } from 'components/session'
import { useSettings } from 'components/settings/store'
import { useShortcuts } from 'components/shortcuts/store'
import { ToastContainer } from 'components/toast'
import { CONNECT_NAME_CLIENT_PREFIX, sendConnect } from 'utils/connect'

export const App = () => {
  const [settings] = useSettings()
  useShortcuts(settings?.shortcuts || false)

  useEffect(() => {
    const clientId = uuidv4()
    sendConnect(`${CONNECT_NAME_CLIENT_PREFIX}-${clientId}`)
  }, [])

  return (
    <Layout>
      <SessionLayout />
      <ToastContainer />
      <ModalProvider />
    </Layout>
  )
}
