import { Runtime } from 'webextension-polyfill'

import { log } from 'utils/logger'

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

/**
 * Handles background worker errors
 */
export class BackgroundError extends Error {
  /**
   * @param {string} message message string exposed to frontend toast/form
   * @param {number} context provides additional context information such as
   *                         filename, function name and arguments
   */
  constructor(context: string, message: string) {
    super(message)
    this.name = 'BackgroundError'
    this.log(context, message)
  }

  log(context: string, message: string) {
    log.error(context, message)
  }
}
