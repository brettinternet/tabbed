export const popupUrl = 'main/index.html?mode=popup'
export const sidebarUrl = 'main/index.html?mode=sidebar'
export const tabUrl = 'main/index.html?mode=tab' // or no query at all
export const popoutUrl = 'main/index.html?mode=popout'

export const repoUrl = 'https://github.com/brettinternet/table-tabs'
export const licenseUrl = `${repoUrl}/blob/main/LICENSE.md`
export const privacyPolicyUrl = `${repoUrl}/blob/main/PRIVACYPOLICY.md`

export const buildTime = process.env.BUILD_TIME
export const buildVersion = process.env.BUILD_VERSION
export const appName = process.env.APP_NAME || 'Table Tabs'
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
    projectUrl: 'https://teenyicons.com/',
    projectName: 'Teenyicons',
    licenseType: 'MIT License',
    licenseUrl:
      'https://github.com/teenyicons/teenyicons/blob/6734a3c1af3f27c8ca76debcd6c6fd2f5d63ef4e/LICENSE',
    authors: 'Anja van Staden',
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

const a: any = {}

console.log(a?.test)

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
