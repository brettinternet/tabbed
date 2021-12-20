import { Runtime } from 'webextension-polyfill'

/**
 * Useful for backend pushing messages to client, and the client isn't available
 * Potentially could use `runtime.connect` to determine if client is connected
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/connect
 *
 * For background-sent messages, this checks if the client is not merely closed
 * Sometimes client-sent messages fail on start-up or after the tab sleeps
 */
export const isConnectionFailed = (err: unknown) =>
  (err as Runtime.PropertyLastErrorType)?.message?.includes(
    'Could not establish connection. Receiving end does not exist.'
  )
