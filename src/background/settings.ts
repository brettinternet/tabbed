import { assign } from 'lodash'

import { configureClosedWindowListener } from 'background/sessions'
import { getKeys } from 'utils/helpers'
import { updateLogLevel, log } from 'utils/logger'
import {
  MESSAGE_TYPE_UPDATED_SETTING,
  UpdatedSettingMessage,
  createBroadcastMessageListener,
} from 'utils/messages'
import { Settings, loadSettings } from 'utils/settings'

import { App } from './app'
import {
  configureMenuActions,
  configureMenus,
  configureExtensionActions,
  configureTabCountListeners,
} from './configuration'

// import { setupSearchListeners } from './search/listeners'
// import { setupUndoListeners } from './undo/listeners'
// void setupSearchListeners()
// void setupUndoListeners()

const logContext = 'background/settings'

/**
 * Invokes side effects for settings startup and changes
 */
const handleSettingsSideEffects = async <K extends keyof Settings>(
  changedKey: K,
  settings: Settings
) => {
  switch (changedKey) {
    case 'showTabCountBadge': {
      void configureTabCountListeners(settings.showTabCountBadge)
      break
    }
    case 'extensionClickAction': {
      void configureExtensionActions(settings.extensionClickAction)
      break
    }
    case 'debugMode': {
      void updateLogLevel(settings.debugMode)
      break
    }
    case 'saveIncognito':
    case 'saveClosedWindows': {
      if (settings.saveIncognito && settings.saveClosedWindows) {
        void configureClosedWindowListener(settings)
      }
      break
    }
    case 'popoutState': {
      configureMenuActions(settings)
      break
    }
  }
}

export const configureSettings = async () => {
  log.debug(logContext, 'configureSettings()')
  const settings = await loadSettings()
  const keys = getKeys(settings)
  await Promise.all(
    keys.map(async (key) => handleSettingsSideEffects(key, settings))
  )
  await configureMenus()
  return settings
}

export const startClientSettingsListeners = (app: App) => {
  log.debug(logContext, 'startClientSettingsListeners()', app)

  createBroadcastMessageListener<UpdatedSettingMessage>(
    MESSAGE_TYPE_UPDATED_SETTING,
    async (changedSettings) => {
      const keys = getKeys(changedSettings)
      const savedSettings = await loadSettings()
      const settings = assign(savedSettings, changedSettings)
      await Promise.all(
        keys.map((key) => handleSettingsSideEffects(key, settings))
      )
    }
  )
}
