import browser from 'webextension-polyfill'

import { configureClosedWindowListener } from 'background/sessions'
import { SessionsManager } from 'background/sessions/sessions-manager'
import { updateLogLevel, log } from 'utils/logger'
import {
  MESSAGE_TYPE_UPDATE_LOG_LEVEL,
  UpdateLogLevelMessage,
  MESSAGE_TYPE_GET_SETTINGS,
  GetSettingsMessage,
  MESSAGE_TYPE_UPDATE_SETTINGS,
  UpdateSettingsMessage,
} from 'utils/messages'

import {
  configurePopoutAction,
  configureExtension,
  configureExtensionActions,
  configureTabCountListeners,
} from './configuration'
import { Settings } from './settings'

// import { setupSearchListeners } from './search/listeners'
// import { setupUndoListeners } from './undo/listeners'
// void setupSearchListeners()
// void setupUndoListeners()

const logContext = 'background/listeners'

/**
 * Invokes side effects for settings startup and changes
 */
const handleSettingsSideEffects = async <K extends keyof Settings>(
  changedKey: K,
  settings: Settings,
  sessionsManager: SessionsManager
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
    case 'saveClosedWindows': {
      void configureClosedWindowListener(settings, sessionsManager)
      break
    }
    case 'popoutState': {
      configurePopoutAction(settings.popoutState)
      break
    }
  }
}

export const startListeners = async (
  sessionsManager: SessionsManager,
  settings: Settings
) => {
  log.debug(logContext, 'startListeners()', settings)

  // reset to avoid duplicates
  await browser.contextMenus.removeAll()
  void configureExtension(sessionsManager)
  configurePopoutAction(settings.popoutState)
  void configureTabCountListeners(settings.showTabCountBadge)
  void configureExtensionActions(settings.extensionClickAction)

  browser.runtime.onMessage.addListener((message: GetSettingsMessage) => {
    if (message.type === MESSAGE_TYPE_GET_SETTINGS) {
      return Promise.resolve(settings)
    }
  })

  browser.runtime.onMessage.addListener((message: UpdateSettingsMessage) => {
    if (message.type === MESSAGE_TYPE_UPDATE_SETTINGS) {
      return new Promise(async (resolve) => {
        const changedSettings = message.value
        const updatedSettings = await settings.update(changedSettings)
        const sideEffects = []
        let key: keyof Settings
        for (key in changedSettings) {
          sideEffects.push(
            handleSettingsSideEffects(key, updatedSettings, sessionsManager)
          )
        }
        await Promise.all(sideEffects)
        resolve(updatedSettings)
      })
    }
  })

  browser.runtime.onMessage.addListener((message: UpdateLogLevelMessage) => {
    if (message.type === MESSAGE_TYPE_UPDATE_LOG_LEVEL) {
      void updateLogLevel(message.value)
    }
  })
}
