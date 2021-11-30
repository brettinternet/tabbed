import log from 'loglevel'
import { Runtime } from 'webextension-polyfill'

export type { Logger } from 'loglevel'

export const updateLogLevel = (enable?: boolean) => {
  if (enable) {
    log.enableAll()
  } else {
    log.disableAll()
  }
}

export { log }

export class AppError extends Error {
  /**
   * @param {string} message message string exposed to frontend toast/form
   * @param {number} context provides additional context information such as
   *                         filename, function name and arguments
   */
  constructor({ message, context }: { message: string; context: string }) {
    super(message)
    this.name = 'AppError'
    this.log(message, context)
  }

  log(message: string, context: string) {
    log.error(context, message)
  }
}

/**
 * Useful for backend pushing messages to client, and the client isn't available
 * Potentially could use `runtime.connect` to determine if client is connected
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/connect
 */
export const handleError = (error: unknown) => {
  const err = error as Runtime.PropertyLastErrorType | undefined
  // If client is not merely closed
  if (
    err?.message !==
    'Could not establish connection. Receiving end does not exist.'
  ) {
    throw err
  }
}
