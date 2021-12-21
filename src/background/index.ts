// polyfill for class-transformer lib
import 'reflect-metadata'
import browser from 'webextension-polyfill'

import { buildVersion, buildTime } from 'utils/env'
import { log } from 'utils/logger'

import { startBackgroundConnectionListener } from './connection'
import { startBackgroundSessionListeners } from './sessions'
import { startBackgroundSettingsListeners } from './settings'

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

const main = async () => {
  log.debug(logContext, 'main()')

  await Promise.all([
    startBackgroundConnectionListener(),
    startBackgroundSessionListeners(),
    startBackgroundSettingsListeners(),
  ])

  await logStartup()
}

void main()
