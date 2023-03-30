import { Runtime } from 'webextension-polyfill'

import { log } from 'utils/logger'

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

export const handleMessageError = (error: unknown, ...values: unknown[]) => {
  // If client is not merely closed
  if (!isConnectionFailed(error)) {
    console.error('Error details: ', ...values)
    throw error
  }
}

/**
 * Handles background worker errors
 */
export class AppError extends Error {
  /**
   * @param {string} message message string exposed to frontend toast/form
   * @param {number} context provides additional context information such as
   *                         filename, function name and arguments
   */
  constructor(context: string, message: string) {
    super(message)
    this.name = 'AppError'
    this.log(context, message)
  }

  log(context: string, message: string) {
    log.error(context, message)
  }
}
