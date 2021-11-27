import { debounce } from 'lodash'
import browser from 'webextension-polyfill'

// import { saveCurrentSession } from 'background/sessions/create'
import {
  openExtensionPopup,
  openExtensionSidebar,
  openExtensionNewTab,
  openExtensionExistingTab,
  openExtensionPopout,
} from 'utils/browser/actions'
import { popupUrl, sidebarUrl } from 'utils/env'
import { log } from 'utils/logger'
import { writeSetting } from 'utils/settings'
import { Settings, extensionClickActions } from 'utils/settings'

const logContext = 'background/configuration'

export const updatePopoutPosition = async (
  popoutState: Settings['popoutState']
) => {
  await writeSetting({ popoutState })
}

const enablePopup = async () => {
  log.debug(logContext, 'enablePopup()')

  await browser.browserAction.setPopup({ popup: popupUrl })
}

const disablePopup = async () => {
  log.debug(logContext, 'disablePopup()')

  await browser.browserAction.setPopup({ popup: '' })
}

/**
 * Setup browser toolbar context menus
 */
const setupMenus = async (popupDisabled?: boolean) => {
  log.debug(logContext, 'setupMenus()', popupDisabled)

  // reset to avoid duplicates
  await browser.contextMenus.removeAll()

  browser.contextMenus.create({
    title: 'Open popup',
    contexts: ['browser_action'],
    onclick: async () => {
      if (popupDisabled) {
        await enablePopup()
        await openExtensionPopup()
        await disablePopup()
      } else {
        await openExtensionPopup()
      }
    },
  })

  if (browser.sidebarAction) {
    browser.contextMenus.create({
      title: 'Open sidebar',
      contexts: ['browser_action'],
      onclick: openExtensionSidebar,
    })
  }

  browser.contextMenus.create({
    title: 'Open in tab',
    contexts: ['browser_action'],
    onclick: openExtensionNewTab,
  })

  browser.contextMenus.create({
    title: 'Open in popout window',
    contexts: ['browser_action'],
    onclick: openExtensionPopout,
  })

  browser.contextMenus.create({
    id: 'save-session',
    title: 'Save session',
    contexts: ['page'],
    onclick: async () => {
      try {
        // await saveCurrentSession()
        // await browser.notifications.create({
        //   type: 'basic',
        //   iconUrl: 'icons/icon-32x32.png',
        //   title: 'Session saved',
        //   message: 'The current session has been saved',
        // })
      } catch (err) {
        log.error(err)
      }
    },
  })
}

/**
 * Setup certain browser actions related to the browser toolbar
 */
export const loadExtensionActions = async (
  extensionClickAction: Settings['extensionClickAction']
) => {
  log.debug(logContext, 'loadExtensionActions()', extensionClickAction)

  if (extensionClickAction === extensionClickActions.TAB) {
    await disablePopup()
    browser.browserAction.onClicked.removeListener(openExtensionSidebar)
    browser.browserAction.onClicked.addListener(openExtensionExistingTab)
  } else if (
    extensionClickAction === extensionClickActions.SIDEBAR &&
    !!browser.sidebarAction
  ) {
    await disablePopup()
    browser.browserAction.onClicked.removeListener(openExtensionExistingTab)
    await browser.sidebarAction.setPanel({
      panel: sidebarUrl,
    })
    browser.browserAction.onClicked.addListener(openExtensionSidebar)
  } else {
    browser.browserAction.onClicked.removeListener(openExtensionSidebar)
    browser.browserAction.onClicked.removeListener(openExtensionExistingTab)
    await enablePopup()
  }

  await setupMenus(extensionClickAction !== extensionClickActions.POPUP)
}

const BADGE_BACKGROUND_COLOR = '#3b82f6'
const updateTabCountBadge = async () => {
  try {
    log.debug(logContext, 'updateTabCountBadge()')
    const tabs = await browser.tabs.query({})
    const count = tabs.length
    await browser.browserAction.setBadgeBackgroundColor({
      color: BADGE_BACKGROUND_COLOR,
    })
    await browser.browserAction.setBadgeText({ text: count ? `${count}` : '' })
  } catch (err) {
    log.error(err)
  }
}

const clearTabCountBadge = async () => {
  await browser.browserAction.setBadgeText({ text: '' })
}

const updateTabCountDebounce = debounce(updateTabCountBadge, 250)

export const loadTabCountListeners = (showTabCountBadge: boolean) => {
  log.debug(logContext, 'loadTabCountListeners()', showTabCountBadge)

  if (showTabCountBadge) {
    void updateTabCountDebounce()
    browser.tabs.onUpdated.addListener(updateTabCountDebounce)
    browser.tabs.onRemoved.addListener(updateTabCountDebounce)
    browser.tabs.onReplaced.addListener(updateTabCountDebounce)
    browser.tabs.onDetached.addListener(updateTabCountDebounce)
    browser.tabs.onAttached.addListener(updateTabCountDebounce)
    browser.tabs.onMoved.addListener(updateTabCountDebounce)
  } else {
    void clearTabCountBadge()
    browser.tabs.onUpdated.removeListener(updateTabCountDebounce)
    browser.tabs.onRemoved.removeListener(updateTabCountDebounce)
    browser.tabs.onReplaced.removeListener(updateTabCountDebounce)
    browser.tabs.onDetached.removeListener(updateTabCountDebounce)
    browser.tabs.onAttached.removeListener(updateTabCountDebounce)
    browser.tabs.onMoved.removeListener(updateTabCountDebounce)
  }
}
