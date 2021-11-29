// polyfill for class-transformer lib
import 'reflect-metadata'
import browser from 'webextension-polyfill'

import { startListeners as startAppListeners } from 'background/app'
import { Settings } from 'background/app/settings'
import { startListeners as startSessionListeners } from 'background/sessions'
import { SessionsManager } from 'background/sessions/sessions-manager'
import { buildVersion, buildTime } from 'utils/env'
import { concatTruthy } from 'utils/helpers'
import { log } from 'utils/logger'

// import { startupValidation } from './sessions/validation'

const logContext = 'background/index'
const getBytesInUse = browser.storage.local.getBytesInUse

const logStartup = async () => {
  const bytesUsed = getBytesInUse && (await getBytesInUse())
  const status = [
    `loaded: ${new Date().toISOString()}`,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ...concatTruthy(buildVersion, `version: ${buildVersion!}`),
    ...concatTruthy(
      buildTime,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      `build date: ${new Date(buildTime!).toISOString()}`
    ),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ...concatTruthy(bytesUsed, `bytes in local storage: ${bytesUsed!} B`),
  ]

  log.info(status.join('\n'))
}

const main = async () => {
  log.debug(logContext, 'main()')

  const settings = await Settings.load()
  const sessionsManager = await SessionsManager.load()
  startAppListeners(sessionsManager, settings)
  startSessionListeners(sessionsManager, settings)

  await logStartup()
}

void main()
