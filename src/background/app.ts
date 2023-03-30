import browser, { Runtime } from 'webextension-polyfill'

import {
  CONNECT_NAME_CLIENT_PREFIX,
  ClientId,
  getClientId,
} from 'utils/connect'
import { isProd } from 'utils/env'
import { log } from 'utils/logger'

const logContext = 'background/app'

export type App = {
  ports: Map<ClientId, Runtime.Port>
}

export const startApp = (
  onConnectionChange: (app: App) => Promise<unknown> | void
) => {
  log.debug(logContext, 'startBackgroundConnectionListener()')

  const app: App = {
    ports: new Map<ClientId, Runtime.Port>(),
  }
  // for debugging
  if (!isProd) {
    window.app = app
  }

  browser.runtime.onConnect.addListener(async (port) => {
    if (port.name.includes(CONNECT_NAME_CLIENT_PREFIX)) {
      const clientId = getClientId(port)
      app.ports.set(clientId, port)
      log.debug(logContext, `client ${clientId} connected`)

      await onConnectionChange(app)
      port.onDisconnect.addListener(async (port) => {
        const clientId = getClientId(port)
        app.ports.delete(clientId)
        log.debug(logContext, `client ${clientId} disconnected`)
      })
    }
  })
}
