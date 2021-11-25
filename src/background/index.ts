import browser from 'webextension-polyfill'

import { readSettings } from 'utils/browser/storage'
import { buildVersion, buildTime } from 'utils/env'
import { concatTruthy } from 'utils/helpers'
import { updateLogLevel, log } from 'utils/logger'

import { loadExtensionActions } from './configuration'
import { setupListeners } from './listeners'
import { startupValidation } from './sessions/validation'

const logContext = 'background/index'
const getBytesInUse = browser.storage.local.getBytesInUse

const main = async () => {
  log.debug(logContext, 'main')

  const settings = await readSettings()
  updateLogLevel(settings.debugMode)
  // "setup" fns are invoked once on background startup
  setupListeners(settings)
  // "load" fns are invoked once on background startup and
  // can be reloaded through messages from client
  await loadExtensionActions(settings.extensionClickAction)
  // initial session validation
  await startupValidation()

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

void main()
