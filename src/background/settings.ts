import browser from 'webextension-polyfill'

import { configureClosedWindowListener } from 'background/sessions'
import { getKeys } from 'utils/helpers'
import { updateLogLevel, log } from 'utils/logger'
import {
  MESSAGE_TYPE_UPDATED_SETTING,
  UpdatedSettingMessage,
  createBroadcastMessageListener,
} from 'utils/messages'
import type { Settings } from 'utils/settings'

import { App } from './app'
import {
  configurePopoutAction,
  configureExtension,
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
  settings: Partial<Settings>
) => {
  const {
    showTabCountBadge,
    extensionClickAction,
    debugMode,
    popoutState,
    saveIncognito,
    saveClosedWindows,
  } = settings

  switch (changedKey) {
    case 'showTabCountBadge': {
      if (showTabCountBadge) {
        void configureTabCountListeners(showTabCountBadge)
      }
      break
    }
    case 'extensionClickAction': {
      if (extensionClickAction) {
        void configureExtensionActions(extensionClickAction)
      }
      break
    }
    case 'debugMode': {
      void updateLogLevel(debugMode)
      break
    }
    case 'saveIncognito':
    case 'saveClosedWindows': {
      if (saveIncognito && saveClosedWindows) {
        void configureClosedWindowListener({ saveIncognito, saveClosedWindows })
        break
      }
    }
    case 'popoutState': {
      if (popoutState) {
        configurePopoutAction(popoutState)
      }
      break
    }
  }
}

export const startBackgroundSettingsListeners = async (
  initialSettings: Settings
) => {
  log.debug(logContext, 'startBackgroundSettingsListeners()', initialSettings)

  // reset to avoid duplicates
  await browser.contextMenus.removeAll()
  void configureExtension()
  configurePopoutAction(initialSettings.popoutState)
  void configureTabCountListeners(initialSettings.showTabCountBadge)
  void configureExtensionActions(initialSettings.extensionClickAction)
}

export const startClientSettingsListeners = (app: App) => {
  log.debug(logContext, 'startClientSettingsListeners()', app)

  const removeListener = createBroadcastMessageListener<UpdatedSettingMessage>(
    MESSAGE_TYPE_UPDATED_SETTING,
    async (changedSettings) => {
      const keys = getKeys(changedSettings)
      await Promise.all(
        keys.map((key) => handleSettingsSideEffects(key, changedSettings))
      )
    }
  )

  window.addEventListener('unload', removeListener)
}
