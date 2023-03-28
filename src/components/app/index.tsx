import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import browser from 'webextension-polyfill'

import { Button } from 'components/button'
import { withErrorBoundary } from 'components/error/boundary'
import { Layout } from 'components/layout'
import { ModalProvider } from 'components/modal/provider'
import { SessionLayout } from 'components/session'
import { ToastContainer } from 'components/toast'
import { CONNECT_NAME_CLIENT_PREFIX, sendConnect } from 'utils/connect'
import { isProd } from 'utils/env'

import { Mounted } from './mounted'
import { usePort } from './store'

const App: React.FC = () => {
  const [port, setPort] = usePort()

  useEffect(() => {
    const clientId = uuidv4()
    const backgroundPort = sendConnect(
      `${CONNECT_NAME_CLIENT_PREFIX}-${clientId}`
    )
    setPort(backgroundPort)
  }, [setPort])

  if (port) {
    return (
      <Layout>
        <Mounted />
        <SessionLayout />
        <ToastContainer />
        <ModalProvider />
      </Layout>
    )
  }

  // TODO: add loading
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
          browser.runtime.reload()
        }}
      >
        click to reload the extension
      </Button>
    </>
  ),
  showErrorMessage: !isProd,
})
