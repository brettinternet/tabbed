/**
 * Similar to messages, but uses runtime.connect
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/connect
 * https://developer.chrome.com/docs/extensions/reference/runtime/#method-connect
 */
import browser, { Runtime } from 'webextension-polyfill'

import { log } from 'utils/logger'

/**
 * Tell background when a client is connected
 * Connect name includes prefix and client UUID generated in `components/app/index`
 */
export const CONNECT_NAME_CLIENT_PREFIX = 'client_connected'

// UUID from client
export type ClientId = string

export const getClientId = (port: Runtime.Port): ClientId =>
  port.name.replace(CONNECT_NAME_CLIENT_PREFIX + '-', '')

export const sendConnect = <T extends string>(name: T): Runtime.Port => {
  log.debug('sendConnect()', name)
  return browser.runtime.connect({
    name,
  })
}
