import browser, { Runtime } from 'webextension-polyfill'

import { CONNECT_NAME_CLIENT_PREFIX } from 'utils/connect'
import { isProd } from 'utils/env'
import { PartialBy } from 'utils/helpers'
import { log } from 'utils/logger'

const logContext = 'background/app'

// UUID from client
type ClientId = string

export type App = {
  clients: Map<ClientId, Runtime.MessageSender | undefined>
  port: Runtime.Port
}

export type AppMaybePort = PartialBy<App, 'port'>

export const isAppWithPort = (app: App | AppMaybePort): app is App => !!app.port

const getClientId = (port: Runtime.Port): ClientId =>
  port.name.replace(CONNECT_NAME_CLIENT_PREFIX + '-', '')

export const startApp = (onConnectionChange: (app: App) => void) => {
  log.debug(logContext, 'startBackgroundConnectionListener()')

  const app: AppMaybePort = {
    clients: new Map<ClientId, Runtime.MessageSender | undefined>(),
  }
  // for debugging
  if (!isProd) {
    window.app = app
  }

  browser.runtime.onConnect.addListener((port) => {
    console.log('------------------port: ', port)
    if (port.name.includes(CONNECT_NAME_CLIENT_PREFIX)) {
      app.port = port
      if (isAppWithPort(app)) {
        const clientId = getClientId(port)
        log.debug(logContext, `client ${clientId} connected`)

        app.clients.set(clientId, port.sender)
        onConnectionChange(app)

        port.onDisconnect.addListener((port) => {
          const clientId = getClientId(port)
          log.debug(logContext, `client ${clientId} disconnected`)

          app.clients.delete(clientId)
          onConnectionChange(app)
        })
      }
    }
  })
}
