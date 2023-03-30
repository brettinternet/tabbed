import { debounce } from 'lodash'
import browser from 'webextension-polyfill'

import {
  openExtensionPopup,
  openExtensionSidebar,
  openExtensionNewTab,
  openExtensionExistingTab,
  openExtensionPopout,
  getBrowser,
  Browsers,
} from 'utils/browser'
import { popupUrl, sidebarUrl } from 'utils/env'
import { SAVE_SESSIONS } from 'utils/flags'
import { isDefined } from 'utils/helpers'
import { log } from 'utils/logger'
import { addSaved, loadSessionsManager, save } from 'utils/sessions-manager'
import { Settings, ExtensionClickActions } from 'utils/settings'

type MenuId = string | number
let menuIds: {
  popout?: MenuId
  sidebar?: MenuId
  tab?: MenuId
  saveContext?: MenuId
  popup?: MenuId
} = {}

export const configurePopoutAction = (popoutState: Settings['popoutState']) => {
  menuIds.popout = browser.contextMenus.create({
    title: 'Open in popout window',
    contexts: ['browser_action'],
    onclick: async () => {
      await openExtensionPopout(popoutState)
    },
  })
}

export const configureExtension = async () => {
  await Promise.all(
    [menuIds.sidebar, menuIds.tab, menuIds.saveContext].map(async (id) => {
      if (isDefined(id)) {
        await browser.contextMenus.remove(id)
      }
    })
  )

  if (browser.sidebarAction) {
    menuIds.sidebar = browser.contextMenus.create({
      title: 'Open sidebar',
      contexts: ['browser_action'],
      onclick: openExtensionSidebar,
    })
  }

  menuIds.tab = browser.contextMenus.create({
    title: 'Open in tab',
    contexts: ['browser_action'],
    onclick: openExtensionNewTab,
  })

  if (SAVE_SESSIONS) {
    menuIds.saveContext = browser.contextMenus.create({
      id: 'save-session',
      title: 'Save session',
      contexts: ['page'],
      onclick: async () => {
        try {
          const sessionsManager = await loadSessionsManager()
          await addSaved(sessionsManager, sessionsManager.current)
          await save(sessionsManager)
          // TODO: send msg to client to reload sessions
          // but how to reload without overwrite save?
          await browser.notifications.create({
            type: 'basic',
            iconUrl: 'icon-32x32.png',
            title: 'Session saved',
            message: 'The current session has been saved',
          })
        } catch (err) {
          log.error(err)
        }
      },
    })
  }
}

const enablePopup = async () => {
  await browser.browserAction.setPopup({ popup: popupUrl })
}

const disablePopup = async () => {
  await browser.browserAction.setPopup({ popup: '' })
}

/**
 * Setup certain browser actions related to the browser toolbar
 */
export const configureExtensionActions = async (
  extensionClickAction: Settings['extensionClickAction']
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

  if (isDefined(menuIds.popup)) {
    await browser.contextMenus.remove(menuIds.popup)
  }

  /**
   * This is not possible now on Chrome
   * https://stackoverflow.com/questions/17928979/how-to-programmatically-open-chrome-extension-popup-html
   */
  if (getBrowser() === Browsers.FIREFOX) {
    menuIds.popup = browser.contextMenus.create({
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
