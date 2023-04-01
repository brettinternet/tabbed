import browser from 'webextension-polyfill'

import { log } from 'utils/logger'

import { App, startApp } from './app'
import {
  startBackgroundSessionListeners,
  startClientSessionListeners,
} from './sessions'
import { configureSettings, startClientSettingsListeners } from './settings'

const logContext = 'background/index'
const getBytesInUse = browser.storage.local.getBytesInUse

const logStartup = async () => {
  const bytesUsed = getBytesInUse && (await getBytesInUse())
  const status = [`Loaded: ${new Date().toISOString()}`]
    .concat(BUILD_VERSION ? `Version: ${BUILD_VERSION}` : [])
    .concat(
      BUILD_TIME ? `Build date: ${new Date(BUILD_TIME).toISOString()}` : []
    )
    .concat(bytesUsed ? `Bytes in local storage: ${bytesUsed} B` : [])
    .concat(`Feature flags: FEATURE_SAVE_SESSIONS=${FEATURE_SAVE_SESSIONS}`)

  log.info(status.join('\n'))
}

const reloadClientListeners = async (app: App) => {
  await Promise.all([
    startClientSessionListeners(app),
    startClientSettingsListeners(app),
  ])
}

const main = async () => {
  const initialSettings = await configureSettings()
  log.debug(logContext, 'main()')
  startApp(reloadClientListeners)
  await startBackgroundSessionListeners(initialSettings)
  await logStartup()
}

void main()
