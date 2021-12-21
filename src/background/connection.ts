import browser, { Runtime } from 'webextension-polyfill'

import { CONNECT_NAME_CLIENT_PREFIX } from 'utils/connect'
import { isProd } from 'utils/env'
import { log } from 'utils/logger'

import { startClientSessionListeners } from './sessions'
import { startClientSettingsListeners } from './settings'

const logContext = 'background/connection'

const connectedClientsMap = new Map()

if (!isProd) {
  window.connectedClientsMap = connectedClientsMap
}

const reloadClientListeners = async (connected: boolean) => {
  await Promise.all([
    startClientSessionListeners(connected),
    startClientSettingsListeners(connected),
  ])
}

const getClientId = (port: Runtime.Port) =>
  port.name.replace(CONNECT_NAME_CLIENT_PREFIX + '-', '')

export const startBackgroundConnectionListener = () => {
  log.debug(logContext, 'startBackgroundConnectionListener()')

  browser.runtime.onConnect.addListener((port) => {
    if (port.name.includes(CONNECT_NAME_CLIENT_PREFIX)) {
      const clientId = getClientId(port)
      log.debug(logContext, `client ${clientId} connected`)

      connectedClientsMap.set(clientId, true)
      void reloadClientListeners(true)

      port.onDisconnect.addListener((port) => {
        const clientId = getClientId(port)
        log.debug(logContext, `client ${clientId} disconnected`)

        connectedClientsMap.delete(clientId)
        if (connectedClientsMap.size === 0) {
          void reloadClientListeners(false)
        }
      })
    }
  })
}
