import { debounce } from 'lodash'
import browser, { Menus } from 'webextension-polyfill'

import {
  openExtensionPopup,
  openExtensionSidebar,
  openExtensionNewTab,
  openExtensionExistingTab,
  openExtensionPopout,
} from 'utils/browser'
import { isFirefox, popupUrl, sidebarUrl } from 'utils/env'
import { SAVE_SESSIONS } from 'utils/flags'
import { isDefined } from 'utils/helpers'
import { log } from 'utils/logger'
import { addSaved, loadSessionsManager, save } from 'utils/sessions-manager'
import { Settings, ExtensionClickActions } from 'utils/settings'

const menuIds = {
  popout: 'open-in-popout',
  sidebar: 'open-in-sidebar',
  tab: 'open-in-tab',
  saveContext: 'save-session',
  popup: 'open-in-popup',
} as const

type MenuActionOptions = Pick<Settings, 'popoutState' | 'extensionClickAction'>

export const configureMenuActions = (options: MenuActionOptions) => {
  const handleContextMenus = (info: Menus.OnClickData) => {
    switch (info.menuItemId) {
      case menuIds.popout:
        void openExtensionPopout(options.popoutState)
        break
      case menuIds.sidebar:
        void openExtensionSidebar()
        break
      case menuIds.tab:
        openExtensionNewTab()
        break
      case menuIds.popup:
        if (options.extensionClickAction !== ExtensionClickActions.POPUP) {
          void enablePopup().then(openExtensionPopup).then(disablePopup)
        } else {
          void openExtensionPopup()
        }
        break
      // case menuIds.saveContext:
      //   (async () => {
      //     try {
      //       const sessionsManager = await loadSessionsManager()
      //       await addSaved(sessionsManager, sessionsManager.current)
      //       await save(sessionsManager)
      //       // TODO: send msg to client to reload sessions
      //       // but how to reload without overwrite save?
      //       await browser.notifications.create({
      //         type: 'basic',
      //         iconUrl: 'icon-32x32.png',
      //         title: 'Session saved',
      //         message: 'The current session has been saved',
      //       })
      //     } catch (err) {
      //       log.error(err)
      //     }
      //   })()
    }
  }
  browser.contextMenus.onClicked.removeListener(handleContextMenus)
  browser.contextMenus.onClicked.addListener(handleContextMenus)
}

export const configureMenus = async () => {
  // reset to avoid duplicates
  await browser.contextMenus.removeAll()

  browser.contextMenus.create({
    id: menuIds.popout,
    title: 'Open in popout window',
    contexts: ['action'],
  })

  browser.contextMenus.create({
    id: menuIds.tab,
    title: 'Open in tab',
    contexts: ['action'],
  })

  if (SAVE_SESSIONS) {
    browser.contextMenus.create({
      id: menuIds.saveContext,
      title: 'Save session',
      contexts: ['page'],
    })
  }

  if (browser.sidebarAction) {
    browser.contextMenus.create({
      id: menuIds.sidebar,
      title: 'Open sidebar',
      contexts: ['action'],
    })
  }

  /**
   * This is not possible now on Chrome
   * https://stackoverflow.com/questions/17928979/how-to-programmatically-open-chrome-extension-popup-html
   */
  if (isFirefox) {
    browser.contextMenus.create({
      id: menuIds.popup,
      title: 'Open popup',
      contexts: ['action'],
    })
  }
}

const enablePopup = async () => {
  await browser.action.setPopup({ popup: popupUrl })
}

const disablePopup = async () => {
  await browser.action.setPopup({ popup: '' })
}

/**
 * Setup certain browser actions related to the browser toolbar
 */
export const configureExtensionActions = async (
  extensionClickAction: Settings['extensionClickAction']
) => {
  if (extensionClickAction === ExtensionClickActions.TAB) {
    await disablePopup()
    browser.action.onClicked.removeListener(openExtensionSidebar)
    browser.action.onClicked.addListener(openExtensionExistingTab)
  } else if (
    extensionClickAction === ExtensionClickActions.SIDEBAR &&
    !!browser.sidebarAction
  ) {
    await disablePopup()
    browser.action.onClicked.removeListener(openExtensionExistingTab)
    await browser.sidebarAction.setPanel({
      panel: sidebarUrl,
    })
    browser.action.onClicked.addListener(openExtensionSidebar)
  } else {
    browser.action.onClicked.removeListener(openExtensionSidebar)
    browser.action.onClicked.removeListener(openExtensionExistingTab)
    await enablePopup()
  }
}

const BADGE_TEXT_COLOR = '#ffffff'
const BADGE_BACKGROUND_COLOR = '#3b82f6'
const updateTabCountBadge = async () => {
  try {
    const tabs = await browser.tabs.query({})
    const count = tabs.length
    await browser.action.setBadgeBackgroundColor({
      color: BADGE_BACKGROUND_COLOR,
    })
    void browser.action.setBadgeTextColor({
      color: BADGE_TEXT_COLOR,
    })
    await browser.action.setBadgeText({ text: count ? `${count}` : '' })
  } catch (err) {
    log.error(err)
  }
}

const clearTabCountBadge = async () => {
  await browser.action.setBadgeText({ text: '' })
}

const debounceUpdateTabCountBadge = debounce(updateTabCountBadge, 250)
const handleTabCountChange = () => {
  debounceUpdateTabCountBadge()
}

const removeTabCountListeners = (handler: () => void) => {
  browser.tabs.onUpdated.removeListener(handler)
  browser.tabs.onRemoved.removeListener(handler)
  browser.tabs.onReplaced.removeListener(handler)
  browser.tabs.onDetached.removeListener(handler)
  browser.tabs.onAttached.removeListener(handler)
  browser.tabs.onMoved.removeListener(handler)
}

const addTabCountListeners = (handler: () => void) => {
  removeTabCountListeners(handler)
  browser.tabs.onUpdated.addListener(handler)
  browser.tabs.onRemoved.addListener(handler)
  browser.tabs.onReplaced.addListener(handler)
  browser.tabs.onDetached.addListener(handler)
  browser.tabs.onAttached.addListener(handler)
  browser.tabs.onMoved.addListener(handler)
}

export const configureTabCountListeners = (showTabCountBadge: boolean) => {
  if (showTabCountBadge) {
    void handleTabCountChange()
    addTabCountListeners(handleTabCountChange)
  } else {
    void clearTabCountBadge()
    removeTabCountListeners(handleTabCountChange)
  }
}
