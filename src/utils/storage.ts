// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea/set
import browser from 'webextension-polyfill'

import type { Valueof } from 'utils/helpers'

const LocalStorageKey = {
  // {}
  SETTINGS: 'settings',
  // [current, ...saved, ...previous]
  SESSIONS: 'sessions',
} as const
type LocalStorageKeyType = Valueof<typeof LocalStorageKey>

export class LocalStorage {
  static key = LocalStorageKey

  static get = async <T>(key: LocalStorageKeyType): Promise<T | undefined> => {
    const res = await (browser.storage.local.get(key) as Promise<
      Record<typeof key, T | undefined>
    >)
    return res[key]
  }

  static set = async <T>(key: LocalStorageKeyType, data: T): Promise<void> => {
    await browser.storage.local.set({
      [key]: data,
    })
  }
}

/**
 * @WARNING destructive, only use in dev
 */
export const purgeAllStorage = async () => {
  if (!IS_PROD) {
    await browser.storage.local.clear()
  }
}
