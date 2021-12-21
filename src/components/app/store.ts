import browser from 'webextension-polyfill'

import { popupUrl, tabUrl, popoutUrl, sidebarUrl } from 'utils/env'

// Feature flags
export const isPopup =
  window.location.href.includes(popupUrl) || !window.location.href.includes('?')
export const isTab = window.location.href.includes(tabUrl)
export const isPopout = window.location.href.includes(popoutUrl)
export const isSidebar = window.location.href.includes(sidebarUrl)
export const isSidebarSupported = !!browser.sidebarAction
export const isMac = window.navigator.userAgent.toLowerCase().includes('mac')
