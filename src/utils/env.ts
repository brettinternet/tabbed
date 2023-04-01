import { TARGET } from './flags'

export const popupUrl = 'index.html?mode=popup'
export const sidebarUrl = 'index.html?mode=sidebar'
export const tabUrl = 'index.html?mode=tab' // or no query at all
export const popoutUrl = 'index.html?mode=popout'

export const repoUrl = 'https://github.com/brettinternet/tabbed'
export const authorUrl = 'https://brett.cloud'
export const featureRequestUrl = `${repoUrl}/discussions/new`
export const bugReportUrl = `${repoUrl}/issues/new`
export const newBugReportUrl = `${repoUrl}/issues/new`
export const licenseUrl = `${repoUrl}/blob/main/LICENSE.md`
export const privacyPolicyUrl = `${repoUrl}/blob/main/PRIVACYPOLICY.md`

export const buildTime = process.env.BUILD_TIME || new Date().toISOString()
export const buildVersion = process.env.BUILD_VERSION
export const appName = process.env.APP_NAME || 'Tabbed'
export const isProd = process.env.NODE_ENV === 'production'

export const isChrome = TARGET === 'chrome'
export const isFirefox = TARGET === 'firefox'
