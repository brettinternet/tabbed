/* eslint-disable @typescript-eslint/unbound-method */
import browser from 'webextension-polyfill'

import { defaultSettings, Settings } from 'utils/settings'

import { readSettings, writeSetting, localStorageKeys } from './storage'

describe('utils/browser/storage.ts', () => {
  describe('readSettings', () => {
    it('returns default settings when no storage is found', async () => {
      const settings = await readSettings()
      expect(browser.storage.local.get).toHaveBeenCalledWith(
        localStorageKeys.SETTINGS
      )
      expect(settings).toEqual(defaultSettings)
    })
  })

  describe('writeSetting', () => {
    it('allows for patch/partial updates', async () => {
      const newSettings: Partial<Settings> = {
        fontSize: 12,
      }

      await writeSetting(newSettings)
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [localStorageKeys.SETTINGS]: {
          ...defaultSettings,
          ...newSettings,
        },
      })
    })
  })
})
