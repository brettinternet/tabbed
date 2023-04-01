import { writeFile } from 'fs/promises'
import { capitalize } from 'lodash'
import { resolve } from 'path'

const pkg = require('../package.json')

const projectRoot = resolve(__dirname, '..')
const isProd = process.env.NODE_ENV === 'production'
const target = process.env.TARGET || 'chrome'
const browsers = {
  isChrome: target === 'chrome',
  isFirefox: target === 'firefox',
}

const name = capitalize(pkg.name) + (isProd ? '' : ' (dev)')
const author = 'Brett Gardiner'
const repo = 'https://github.com/brettinternet/tabbed'
const description =
  'A different way to visualize and organize your browser tabs'

/**
 * @usage https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json
 * https://developer.chrome.com/docs/extensions/mv3/manifest/
 * https://developer.chrome.com/docs/extensions/mv3/intro/mv3-migration/
 * https://developer.chrome.com/docs/extensions/migrating/to-service-workers/
 *
 */
const manifest: Record<string, any> = {
  manifest_version: 3,
  name,
  version: pkg.version,
  version_name: pkg.version + ' alpha',
  description,
  background: {
    service_worker: 'background/index.js',
    type: 'module',
  },
  action: {
    browser_style: true,
    default_popup: 'index.html',
    default_title: name,
    default_icon: {
      '16': 'icon-16x16.png',
      '32': 'icon-32x32.png',
    },
    theme_icons: [
      {
        light: 'icon-16x16.png',
        dark: 'icon-16x16.png',
        size: 16,
      },
      {
        light: 'icon-32x32.png',
        dark: 'icon-32x32.png',
        size: 32,
      },
    ],
  },
  // default_locale: 'en',
  permissions: [
    'contextMenus',
    // 'notifications',
    'storage',
    'tabs',
  ],
  commands: {
    _execute_action: {
      suggested_key: {
        // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands#shortcut_values
        default: 'Ctrl+Shift+S',
        mac: 'Command+Shift+S',
      },
    },
  },
  icons: {
    '16': 'icon-16x16.png',
    '32': 'icon-32x32.png',
  },
}

if (browsers.isFirefox) {
  manifest.developer = {
    name: author,
    url: repo,
  }
  manifest.sidebar_action = {
    default_panel: 'index.html',
  }
  manifest.browser_specific_settings = {
    gecko: {
      id: '{4304daa2-2ca7-4de3-93cc-a1d6d78bd0a4}', // some arbitrary UUID
    },
  }
}

void writeFile(
  resolve(projectRoot, 'build', 'manifest.json'),
  JSON.stringify(manifest)
)
