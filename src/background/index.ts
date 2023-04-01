import { log, logStartup } from 'utils/logger'

import { App, startApp } from './app'
import {
  startBackgroundSessionListeners,
  startClientSessionListeners,
} from './sessions'
import { configureSettings, startClientSettingsListeners } from './settings'

const logContext = 'background/index'

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
