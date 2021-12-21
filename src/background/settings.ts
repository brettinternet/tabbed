import browser from 'webextension-polyfill'

import { configureClosedWindowListener } from 'background/sessions'
import { updateLogLevel, log } from 'utils/logger'
import {
  MESSAGE_TYPE_UPDATED_SETTING,
  UpdatedSettingMessage,
  createMessageListener,
} from 'utils/messages'
import { Settings } from 'utils/settings/settings-manager'
import type { SettingsData } from 'utils/settings/types'

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
const handleSettingsSideEffects = async <K extends keyof SettingsData>(
  changedKey: K,
  settings: Partial<SettingsData>
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

export const startBackgroundSettingsListeners = async () => {
  const settings = (await Settings.load()).get()
  log.debug(logContext, 'startBackgroundSettingsListeners()', settings)

  // reset to avoid duplicates
  await browser.contextMenus.removeAll()
  void configureExtension()
  configurePopoutAction(settings.popoutState)
  void configureTabCountListeners(settings.showTabCountBadge)
  void configureExtensionActions(settings.extensionClickAction)
}

export const startClientSettingsListeners = async (
  clientConnected: boolean
) => {
  log.debug(logContext, 'startClientSettingsListeners()', clientConnected)

  const {
    startListener: startUpdatedSettingListener,
    removeListener: removeSettingUpdatedListener,
  } = createMessageListener<UpdatedSettingMessage>(
    MESSAGE_TYPE_UPDATED_SETTING,
    async (changedSettings) => {
      const sideEffects = []
      let key: keyof SettingsData
      for (key in changedSettings) {
        sideEffects.push(handleSettingsSideEffects(key, changedSettings))
      }
      await Promise.all(sideEffects)
    }
  )

  if (clientConnected) {
    startUpdatedSettingListener()
  } else {
    removeSettingUpdatedListener()
  }
}
