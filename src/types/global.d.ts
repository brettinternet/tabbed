import '@types/chrome'

declare global {
  interface Window {
    // Identifies Firefox when missing: https://stackoverflow.com/a/9851769
    InstallTrigger?: unknown
  }

  /**
   * Used to check specific disparities between Chrome and Firefox APIs
   * "app" is available to all Chromium browsers
   * Don't use this namespace normally
   *
   * @source https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/chrome/index.d.ts
   */
  namespace chrome {
    export const app: unknown | undefined
  }

  /**
   * Extends @types/webextension-polyfill
   * Types for promisified extension API
   * https://github.com/mozilla/webextension-polyfill
   */
  namespace Browser {
    namespace Tabs {
      interface Tab {
        /**
         * Chrome specific when status === 'loading'
         *
         * @source https://developer.chrome.com/docs/extensions/reference/tabs/
         */
        pendingUrl?: string

        /**
         * value is `-1` if tab is not assigned to a group, not supported by the polyfill yet
         */
        groupId?: number
      }
    }
  }
}
