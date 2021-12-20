import { isConnectionFailed } from 'utils/error'
import { log } from 'utils/logger'

export const handleMessageError = (error: unknown) => {
  // If client is not merely closed
  if (!isConnectionFailed(error)) {
    throw error
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
