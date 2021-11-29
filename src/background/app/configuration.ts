import { debounce } from 'lodash'
import browser from 'webextension-polyfill'

import {
  openExtensionPopup,
  openExtensionSidebar,
  openExtensionNewTab,
  openExtensionExistingTab,
  openExtensionPopout,
} from 'background/browser'
import { SessionsManager } from 'background/sessions/sessions-manager'
import { popupUrl, sidebarUrl } from 'utils/env'
import { isDefined } from 'utils/helpers'
import { log } from 'utils/logger'
import { ExtensionClickActions } from 'utils/settings'
import { SettingsOptions } from 'utils/settings'

export const configureExtension = (sessionsManager: SessionsManager) => {
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
        await sessionsManager.addSaved(sessionsManager.current)
        await browser.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon-32x32.png',
          title: 'Session saved',
          message: 'The current session has been saved',
        })
      } catch (err) {
        log.error(err)
      }
    },
  })
}

const enablePopup = async () => {
  await browser.browserAction.setPopup({ popup: popupUrl })
}

const disablePopup = async () => {
  await browser.browserAction.setPopup({ popup: '' })
}

let extensionActionMenuId: string | number | undefined

/**
 * Setup certain browser actions related to the browser toolbar
 */
export const configureExtensionActions = async (
  extensionClickAction: SettingsOptions['extensionClickAction']
) => {
  if (extensionClickAction === ExtensionClickActions.TAB) {
    await disablePopup()
    browser.browserAction.onClicked.removeListener(openExtensionSidebar)
    browser.browserAction.onClicked.addListener(openExtensionExistingTab)
  } else if (
    extensionClickAction === ExtensionClickActions.SIDEBAR &&
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

  // reset to avoid duplicates
  if (isDefined(extensionActionMenuId)) {
    await browser.contextMenus.remove(extensionActionMenuId)
  }

  extensionActionMenuId = browser.contextMenus.create({
    title: 'Open popup',
    contexts: ['browser_action'],
    onclick: async () => {
      if (extensionClickAction !== ExtensionClickActions.POPUP) {
        await enablePopup()
        await openExtensionPopup()
        await disablePopup()
      } else {
        await openExtensionPopup()
      }
    },
  })
}

const BADGE_BACKGROUND_COLOR = '#3b82f6'
const updateTabCountBadge = async () => {
  try {
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

export const configureTabCountListeners = (showTabCountBadge: boolean) => {
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
