import { writeFile } from 'fs/promises'
import { resolve } from 'path'
const pkg = require('../package.json')

const projectRoot = resolve(__dirname, '..')
const isProd = process.env.NODE_ENV === 'production'

/**
 * TODO: migrate to version 3
 * https://developer.chrome.com/docs/extensions/mv3/intro/mv3-migration/
 *
 * Waiting on FireFox support:
 * https://blog.mozilla.org/addons/2021/05/27/manifest-v3-update/
 */
const manifest = {
  manifest_version: 2,
  name: pkg.name + (isProd ? '' : ' (dev)'),
  version: pkg.version,
  description: pkg.description || 'Organize your tabs',
  background: {
    scripts: ['background/index.js'],
    persistent: true,
  },
  browser_action: {
    default_popup: 'index.html',
  },
  sidebar_action: {
    default_panel: 'index.html',
  },
  default_locale: 'en',
  permissions: ['contextMenus', 'notifications', 'sessions', 'storage', 'tabs'],
  commands: {
    _execute_browser_action: {
      suggested_key: {
        default: 'Ctrl+Shift+S',
      },
    },
  },
  browser_specific_settings: {
    gecko: {
      id: '{4304daa2-2ca7-4de3-93cc-a1d6d78bd0a4}', // some arbitrary UUID
    },
  },
  icons: {
    '16': 'icon-16x16.png',
    '32': 'icon-32x32.png',
  },
}

void writeFile(
  resolve(projectRoot, 'build', 'manifest.json'),
  JSON.stringify(manifest)
)
