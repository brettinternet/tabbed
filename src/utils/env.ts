export const popupUrl = 'index.html?mode=popup'
export const sidebarUrl = 'index.html?mode=sidebar'
export const tabUrl = 'index.html?mode=tab' // or no query at all
export const popoutUrl = 'index.html?mode=popout'

export const repoUrl = 'https://github.com/brettinternet/tabbed'
export const licenseUrl = `${repoUrl}/blob/main/LICENSE.md`
export const privacyPolicyUrl = `${repoUrl}/blob/main/PRIVACYPOLICY.md`

export const buildTime = process.env.BUILD_TIME || new Date().toISOString()
export const buildVersion = process.env.BUILD_VERSION
export const appName = process.env.APP_NAME || 'Tabbed'
export const isProd = process.env.NODE_ENV === 'production'

export const attributions = [
  {
    projectUrl: 'https://github.com/date-fns/date-fns',
    projectName: 'date-fns',
    licenseType: 'MIT License',
    licenseUrl:
      'https://github.com/date-fns/date-fns/blob/41211030571fe373612a58ba9bcf32ea21db8156/LICENSE.md',
    authors: 'Sasha Koss & Lesha Koss',
  },
  {
    projectUrl: 'https://github.com/krisk/fuse',
    projectName: 'fuse.js',
    licenseType: 'Apache License 2.0',
    licenseUrl:
      'https://github.com/krisk/Fuse/blob/e5e3abb44e004662c98750d0964d2d9a73b87848/LICENSE',
    authors: 'Kirollos Risk',
  },
  {
    projectUrl: 'https://twemoji.twitter.com/',
    projectName: 'Twemoji',
    licenseType: 'CC-BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    authors: 'Twitter',
  },
]

/**
 * Supported browsers
 */
export const browsers = {
  /**
   * Chromium-based
   */
  CHROMIUM: 'chromium',
  /**
   * Firefox
   */
  FIREFOX: 'firefox',
}

const getBrowserRuntime = () => {
  if (window.chrome.app) {
    return browsers.CHROMIUM
  }

  /**
   * https://stackoverflow.com/a/9851769
   */
  if (typeof window.InstallTrigger !== 'undefined') {
    return browsers.FIREFOX
  }
}

export const browserRuntime = getBrowserRuntime()
