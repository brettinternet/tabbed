import browser from 'webextension-polyfill'

import { buildVersion, buildTime } from 'utils/env'
import { log } from 'utils/logger'
import { loadSettings } from 'utils/settings'

import { App, startApp } from './app'
import {
  startBackgroundSessionListeners,
  startClientSessionListeners,
} from './sessions'
import {
  startBackgroundSettingsListeners,
  startClientSettingsListeners,
} from './settings'

const logContext = 'background/index'
const getBytesInUse = browser.storage.local.getBytesInUse

const logStartup = async () => {
  const bytesUsed = getBytesInUse && (await getBytesInUse())
  const status = [`loaded: ${new Date().toISOString()}`]
    .concat(buildVersion ? `version: ${buildVersion}` : [])
    .concat(buildTime ? `build date: ${new Date(buildTime).toISOString()}` : [])
    .concat(bytesUsed ? `bytes in local storage: ${bytesUsed} B` : [])

  log.info(status.join('\n'))
}

const reloadClientListeners = async (app: App) =>
  await Promise.all([
    startClientSessionListeners(app),
    startClientSettingsListeners(app),
  ])

const main = async () => {
  log.debug(logContext, 'main()')

  startApp(reloadClientListeners)
  const initialSettings = await loadSettings()

  await Promise.all([
    startBackgroundSessionListeners(initialSettings),
    startBackgroundSettingsListeners(initialSettings),
  ])

  await logStartup()
}

void main()
