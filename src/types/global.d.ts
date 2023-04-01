import '@types/chrome'

declare global {
  interface Window {
    // For debugging in dev
    browser?: unkown
    sessionsManager?: unknown
  }

  // via DefinePlugin, replaced at build time
  const IS_PROD: boolean | undefined
  const IS_CHROME: boolean | undefined
  const IS_FIREFOX: boolean | undefined
  const BUILD_VERSION: string | undefined
  const BUILD_TIME: string | undefined
  const FEATURE_SAVE_SESSIONS: boolean | undefined

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
