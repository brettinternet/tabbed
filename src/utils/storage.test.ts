/* eslint-disable @typescript-eslint/unbound-method */
import browser from 'webextension-polyfill'

import { defaultSettings, Settings } from 'utils/settings'

import { LocalStorage } from './storage'

describe('utils/browser/storage.ts', () => {
  describe('readSettings', () => {
    it('returns default settings when no storage is found', async () => {
      const settingsKey = LocalStorage.key.SETTINGS
      const settings = await LocalStorage.get(settingsKey)
      expect(browser.storage.local.get).toHaveBeenCalledWith(settingsKey)
      expect(settings).toEqual(defaultSettings)
    })
  })

  describe('writeSetting', () => {
    it('allows for patch/partial updates', async () => {
      const newSettings: Partial<Settings> = {
        fontSize: 12,
      }

      const settingsKey = LocalStorage.key.SETTINGS
      await LocalStorage.set(settingsKey, newSettings)
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [settingsKey]: {
          ...defaultSettings,
          ...newSettings,
        },
      })
    })
  })
})
