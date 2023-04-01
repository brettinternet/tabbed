/**
 * Env vars provided to craco and esbuild configs
 */
module.exports = {
  IS_PROD: process.env.NODE_ENV === 'production',
  IS_CHROME: process.env.TARGET === 'chrome',
  IS_FIREFOX: process.env.TARGET === 'firefox',
  BUILD_VERSION: process.env.BUILD_VERSION || 'dev',
  BUILD_TIME: process.env.BUILD_TIME || new Date().toISOString(),
  // feature flags
  FEATURE_SAVE_SESSIONS: process.env.FEATURE_SAVE_SESSIONS === 'true',
}
