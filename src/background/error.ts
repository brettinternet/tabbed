import { Runtime } from 'webextension-polyfill'

/**
 * Useful for backend pushing messages to client, and the client isn't available
 * Potentially could use `runtime.connect` to determine if client is connected
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/connect
 */
export const handleMessageError = (error: unknown) => {
  const err = error as Runtime.PropertyLastErrorType | undefined
  // If client is not merely closed
  if (
    err?.message !==
    'Could not establish connection. Receiving end does not exist.'
  ) {
    throw err
  }
}
