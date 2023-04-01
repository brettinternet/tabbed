import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import browser from 'webextension-polyfill'

import { Button } from 'components/button'
import { withErrorBoundary } from 'components/error/boundary'
import { Layout } from 'components/layout'
import { ModalProvider } from 'components/modal/provider'
import { SessionLayout } from 'components/session'
import { useSettings } from 'components/settings/store'
import { useShortcuts } from 'components/shortcuts/global'
import { ToastContainer } from 'components/toast'
import { CONNECT_NAME_CLIENT_PREFIX, sendConnect } from 'utils/connect'

import { useLogStartup, usePort } from './store'

const App: React.FC = () => {
  useLogStartup()
  const [settings] = useSettings()
  useShortcuts(settings?.shortcuts || false)
  const [port, setPort, portRef] = usePort()

  useEffect(() => {
    if (portRef.current) {
      return
    }

    const clientId = uuidv4()
    portRef.current = sendConnect(`${CONNECT_NAME_CLIENT_PREFIX}-${clientId}`)
    setPort(portRef.current)
  }, [setPort, port, portRef])

  if (port) {
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

export const AppWithErrorBoundary = withErrorBoundary(App, {
  defaultMessage: (
    <>
      The app encountered an unrecoverable error, please{' '}
      <Button
        className="text-white underline"
        inline
        variant="none"
        shape="none"
        onClick={() => {
          window.location.reload()
        }}
      >
        refresh the page
      </Button>{' '}
      or{' '}
      <Button
        className="text-white underline"
        inline
        variant="none"
        shape="none"
        onClick={() => {
          browser.runtime.reload()
        }}
      >
        reload the extension
      </Button>
      .
    </>
  ),
  showErrorMessage: !IS_PROD,
})
