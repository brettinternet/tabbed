// polyfill for class-transformer lib
import 'reflect-metadata'
import browser from 'webextension-polyfill'

import { startListeners as startAppListeners } from 'background/app'
import { Settings } from 'background/app/settings'
import { startListeners as startSessionListeners } from 'background/sessions'
import { SessionsManager } from 'background/sessions/sessions-manager'
import { buildVersion, buildTime, isProd } from 'utils/env'
import { log } from 'utils/logger'

const logContext = 'background/index'
const getBytesInUse = browser.storage.local.getBytesInUse

const logStartup = async () => {
  const bytesUsed = getBytesInUse && (await getBytesInUse())
  const status = [`loaded: ${new Date().toISOString()}`]
    .concat(buildVersion ? `version: ${buildVersion!}` : [])
    .concat(
      buildTime ? `build date: ${new Date(buildTime!).toISOString()}` : []
    )
    .concat(bytesUsed ? `bytes in local storage: ${bytesUsed!} B` : [])

  log.info(status.join('\n'))
}

const main = async () => {
  log.debug(logContext, 'main()')

  const settings = await Settings.load()
  const sessionsManager = await SessionsManager.load(settings)
  void startAppListeners(sessionsManager, settings)
  void startSessionListeners(sessionsManager, settings)

  void logStartup()

  if (!isProd) {
    window.sessionsManager = sessionsManager
  }
}

void main()
