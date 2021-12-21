import '@types/chrome'

declare global {
  interface Window {
    // Identifies Firefox when missing: https://stackoverflow.com/a/9851769
    InstallTrigger?: unknown

    // For debugging in dev
    browser?: unkown
    sessionsManager?: unknown
    connectedClientsMap?: unknown
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
}
