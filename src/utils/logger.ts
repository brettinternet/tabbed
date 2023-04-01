import log from 'loglevel'
import browser from 'webextension-polyfill'

export type { Logger } from 'loglevel'

export const updateLogLevel = (enable?: boolean) => {
  if (enable) {
    log.enableAll()
  } else {
    log.disableAll()
  }
}

export { log }

const getBytesInUse = browser.storage.local.getBytesInUse
export const logStartup = async (details: string[] = []): Promise<void> => {
  const bytesUsed = getBytesInUse && (await getBytesInUse())
  const status = [
    `Loaded ${IS_PROD ? 'production' : 'development'} build for ${
      IS_CHROME ? 'Chrome' : IS_FIREFOX ? 'Firefox' : 'unknown'
    } target: ${new Date().toISOString()}`,
  ]
    .concat(BUILD_VERSION ? `Version: ${BUILD_VERSION}` : [])
    .concat(
      BUILD_TIME ? `Build date: ${new Date(BUILD_TIME).toISOString()}` : []
    )
    .concat(bytesUsed ? `Bytes in local storage: ${bytesUsed} B` : [])
    .concat(
      !IS_PROD
        ? `Feature flags: FEATURE_SAVE_SESSIONS=${FEATURE_SAVE_SESSIONS}`
        : []
    )
    .concat(details)

  log.info(status.join('\n'))
}
