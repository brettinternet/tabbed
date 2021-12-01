import browser from 'webextension-polyfill'

import { log } from 'utils/logger'
import {
  MESSAGE_TYPE_GET_SETTINGS,
  GetSettingsMessage,
  GetSettingsResponse,
  MESSAGE_TYPE_PUSH_SETTINGS,
  PushSettingsMessage,
  MESSAGE_TYPE_UPDATE_SETTINGS,
  UpdateSettingsMessage,
  UpdateSettingsResponse,
} from 'utils/messages'
import { SettingsData } from 'utils/settings'

import type { SetSettings } from './store'

export const getSettings = async (): Promise<
  GetSettingsResponse | undefined
> => {
  const message: GetSettingsMessage = {
    type: MESSAGE_TYPE_GET_SETTINGS,
  }

  return await browser.runtime.sendMessage(message)
}

export const saveSettings = async (
  settings: Partial<SettingsData>
): Promise<UpdateSettingsResponse | undefined> => {
  const message: UpdateSettingsMessage = {
    type: MESSAGE_TYPE_UPDATE_SETTINGS,
    value: settings,
  }

  return await browser.runtime.sendMessage(message)
}

export const startListeners = (setSettings: SetSettings) => {
  browser.runtime.onMessage.addListener((message: PushSettingsMessage) => {
    if (message.type === MESSAGE_TYPE_PUSH_SETTINGS) {
      setSettings(message.value)
    }
  })
}
