import log from 'loglevel'

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
  constructor(context: string, message: string) {
    super(message)
    this.name = 'AppError'
    this.log(context, message)
  }

  log(context: string, message: string) {
    log.error(context, message)
  }
}
