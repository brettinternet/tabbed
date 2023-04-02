const dotenv = require('dotenv')
const pkg = require('./package.json')
dotenv.config()

const IS_PROD = process.env.NODE_ENV === 'production'
if (IS_PROD) {
  dotenv.config({ path: './.env.production' })
} else {
  dotenv.config({ path: './.env.development' })
}

const BUILD_VERSION = IS_PROD ? pkg.version : 'dev'

/**
 * Env vars provided to craco and esbuild configs
 */
module.exports = {
  IS_PROD,
  IS_CHROME: process.env.TARGET === 'chrome',
  IS_FIREFOX: process.env.TARGET === 'firefox',
  BUILD_VERSION,
  BUILD_TIME: process.env.BUILD_TIME || new Date().toISOString(),
  // feature flags
  FEATURE_SAVE_SESSIONS: process.env.FEATURE_SAVE_SESSIONS === 'true',
}
