/**
 * Env vars provided to craco and esbuild configs
 */
const IS_PROD = process.env.NODE_ENV === 'production'
const BUILD_VERSION = IS_PROD ? '0.0.1 alpha' : 'dev'

module.exports = {
  IS_PROD,
  IS_CHROME: process.env.TARGET === 'chrome',
  IS_FIREFOX: process.env.TARGET === 'firefox',
  BUILD_VERSION,
  BUILD_TIME: process.env.BUILD_TIME || new Date().toISOString(),
  // feature flags
  FEATURE_SAVE_SESSIONS: process.env.FEATURE_SAVE_SESSIONS === 'true',
}
