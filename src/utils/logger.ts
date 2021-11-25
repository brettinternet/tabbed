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
