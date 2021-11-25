import '@types/webextension-polyfill'

/**
 * Extends @types/webextension-polyfill
 * Types for promisified extension API
 * https://github.com/mozilla/webextension-polyfill
 */
declare module 'webextension-polyfill' {
  namespace Tabs {
    interface Tab {
      /**
       * value is `-1` if tab is not assigned to a group, not supported by the polyfill yet
       * @source https://developer.chrome.com/docs/extensions/reference/tabs/
       */
      groupId?: number
    }
  }

  namespace Storage {
    interface LocalStorageArea {
      /**
       * Deprecated in Firefox due to a bug, however available in Chrome
       * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea/getBytesInUse
       * https://developer.chrome.com/docs/extensions/reference/storage/#type-StorageArea
       */
      getBytesInUse?:
        | ((keys?: string | string[] | undefined) => Promise<number>)
        | undefined
    }
  }
}
