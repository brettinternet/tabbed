import browser, { Tabs, Windows } from 'webextension-polyfill'

import { tabUrl, popoutUrl } from 'utils/env'
import { isDefined } from 'utils/helpers'
import { Settings } from 'utils/settings'

export const openExtensionPopup = () => browser.action.openPopup()

export const openExtensionSidebar = async () => browser.sidebarAction.open()

export const openExtensionNewTab = async () => {
  const url = browser.runtime.getURL(tabUrl)
  await openTab({ url, incognito: browser.extension.inIncognitoContext })
}

export const openExtensionExistingTab = async () => {
  const url = browser.runtime.getURL(tabUrl)
  const incognito = browser.extension.inIncognitoContext
  await openTabOrFocus({ url }, incognito)
}

export const openExtensionPopout = async (
  popoutState: Settings['popoutState']
) => {
  await browser.windows.create({
    type: 'popup',
    focused: true,
    url: popoutUrl,
    ...popoutState,
  })
}

export const urlsMatch = (url1: string, url2: string) => {
  try {
    return new URL(url1).href === new URL(url2).href
  } catch (_err) {
    return url1 === url2
  }
}

export const isNewTab = ({ url, title }: { url: string; title?: string }) => {
  if (/^chrome:\/\/newtab\/?$/.test(url)) {
    return true
  }

  // Firefox
  // Firefox tabs have a `about:blank` url when status === 'loading'
  if (
    (url === 'about:blank' || url === 'about:newtab') &&
    title === 'New Tab'
  ) {
    return true
  }

  return false
}

/**
 * Tab.id is an optional field, so compare other fields for a better estimation
 * @docs https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab
 */
export const isSameTab = (tab1: Tabs.Tab, tab2: Tabs.Tab) =>
  tab1.id === tab2.id &&
  tab1.windowId === tab2.windowId &&
  tab1.url === tab2.url &&
  tab1.title === tab2.title &&
  (tab1.highlighted === tab2.highlighted || tab1.active === tab2.active) &&
  tab1.pinned === tab2.pinned &&
  tab1.incognito === tab2.incognito

/**
 * Window.id is an optional field, so compare other fields for a better estimation
 * @docs https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows/Window
 */
export const isSameWindow = (
  window1: Windows.Window,
  window2: Windows.Window
) => window1.id === window2.id && window1.incognito === window2.incognito

export const findWindow = (windows: Windows.Window[], window: Windows.Window) =>
  windows.find((w) => isSameWindow(window, w))

export const getWindow = (windowId: number, options: Windows.GetInfo = {}) =>
  browser.windows.get(windowId, options)

export const getActiveTabId = async (
  windowId: number
): Promise<number | undefined> => {
  if (windowId > 0) {
    const tabs = await browser.tabs.query({ active: true, windowId })
    return tabs.find(({ active }) => active)?.id
  }
}

/**
 * get currently focused tab
 */
export const getActiveTabCurrentWindow = async () => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  return tabs.find(({ active }) => active)
}

/**
 * @docs https://developer.chrome.com/docs/extensions/reference/i18n/#overview-predefined
 */
export const getExtensionId = () => browser.i18n.getMessage('@@extension_id')

export const isExtensionUrl = (url: string) =>
  url.includes(`chrome-extension://${getExtensionId()}`)

export const getWindowAndTabs = (windowId: number) =>
  browser.windows.get(windowId, { populate: true })

export const getCurrentWindow = async (options?: Windows.GetInfo) =>
  await browser.windows.getCurrent(options)

/**
 * Sort windows with current window first, then sort by ID
 * This assumes browsers create window IDs sequentially auto-incrementing value
 *
 * TODO: allow settings sort-by option
 *
 * `Windows.Window_ID_CURRENT` and `getCurrentWindow` are distinct from focused window
 * See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows/getCurrent
 *
 * browser.windows.WINDOW_ID_NONE === -2
 */
export const sortWindows = async (
  _windows: Windows.Window[],
  focusedWindowId: number = browser.windows.WINDOW_ID_NONE,
  sortFocusedWindowFirst = false
) => {
  const windows = _windows.slice() // copy
  windows.sort((a, b) => {
    if (a.id && b.id) {
      if (a.id > b.id) {
        return -1
      }

      if (a.id < b.id) {
        return 1
      }
    }

    return 0
  })

  if (sortFocusedWindowFirst) {
    if (focusedWindowId === browser.windows.WINDOW_ID_NONE) {
      focusedWindowId =
        windows.find(({ focused }) => focused)?.id ||
        browser.windows.WINDOW_ID_NONE
    }

    if (focusedWindowId !== browser.windows.WINDOW_ID_NONE) {
      const index = windows.findIndex((w) => w.id === focusedWindowId)
      if (index > -1) {
        const currentWindow = windows.splice(index, 1)[0]
        windows.unshift(currentWindow)
      }
    }
  }
  return windows
}

/**
 * Get windows, optionally order the current window first
 */
export const getAllWindows = async (
  options?: Windows.GetAllGetInfoType,
  sorted?: boolean
) => {
  let windows = await browser.windows.getAll(options)
  if (sorted) {
    windows = await sortWindows(windows)
  }
  return windows
}

export const getTab = (tabId: number) => browser.tabs.get(tabId)

export const closeTab = (tabIds: number | number[]) =>
  browser.tabs.remove(tabIds)

export const closeWindow = (windowId: number) =>
  browser.windows.remove(windowId)

export const moveTabs = async ({
  tabIds,
  index,
  windowId,
}: {
  tabIds: number[]
  index: number
  windowId: number
}) => {
  const result = await browser.tabs.move(tabIds, {
    index,
    windowId,
  })
  if (Array.isArray(result)) {
    return result
  } else {
    return [result]
  }
}

export const updateWindow = async (
  windowId: number,
  values: Windows.UpdateUpdateInfoType
) => await browser.windows.update(windowId, values)

export const updateTab = async (
  tabId: number,
  {
    discarded,
    ...values
  }: Tabs.UpdateUpdatePropertiesType & { discarded?: boolean }
) => {
  if (isDefined(discarded)) {
    await browser.tabs.discard(tabId)
  }
  return await browser.tabs.update(tabId, values)
}

export const isAllowedIncognitoAccess = async () =>
  await browser.extension.isAllowedIncognitoAccess()

type TabOptions = {
  url: string
  pinned?: boolean
  windowId?: number
  incognito?: boolean
  active?: boolean
}

/**
 * Find existing tab with matching query, otherwise
 * open with matching incognito state
 */
export const openTab = async (
  { url, pinned, windowId, incognito, active }: TabOptions,
  focus: boolean = true
) => {
  const allowed = await isAllowedIncognitoAccess()
  if (incognito && !allowed) {
    /**
     * Guide user to enable it:
     * https://stackoverflow.com/questions/17438354/how-can-i-enable-my-chrome-extension-in-incognito-mode/17443982#17443982
     */
    throw Error('No incognito access allowed')
  }

  let newTab: Tabs.Tab | undefined
  if (
    !windowId &&
    ((!incognito && browser.extension.inIncognitoContext) ||
      (incognito && !browser.extension.inIncognitoContext))
  ) {
    const newWindow = await browser.windows.create({
      url,
      incognito,
      focused: focus,
    })
    newTab = newWindow.tabs?.[0]
    if (pinned && newTab?.id) {
      await browser.tabs.update(newTab.id, { pinned, active })
    }
  } else {
    newTab = await browser.tabs.create({ url, pinned, windowId, active })
  }
  return newTab
}

const openTabs = async (tabs: TabOptions[], windowId?: number) => {
  const tasks = tabs.map(async (tab, index) => {
    const { url, pinned, active } = tab
    /**
     * some fields such as `discarded` and reader mode ought to be supported,
     * but throw an error in Chrome in spite of the polyfill
     */
    return await browser.tabs.create({
      url,
      pinned,
      index,
      active,
      windowId,
    })
  })
  return await Promise.all(tasks)
}

const openTabOrFocus = async (
  query: Tabs.QueryQueryInfoType,
  incognito?: boolean
) => {
  const _url = Array.isArray(query.url) ? query.url[0] : query.url
  // hashes cause queries to return empty
  const hashIndex = _url?.indexOf('#') ?? -1
  query.url = _url && hashIndex > -1 ? _url.substr(0, hashIndex) : _url

  let tab: Tabs.Tab | undefined
  const matches = await browser.tabs.query(query)
  if (matches.length >= 1) {
    tab = matches[0]
  }

  if (tab?.id && tab?.windowId) {
    await updateWindow(tab.windowId, { focused: true })
    await updateTab(tab.id, { active: true })
  } else {
    const { url, pinned } = query
    if (url) {
      await openTab({ url, pinned, incognito })
    }
  }
}

type WindowOptions = {
  state?: Windows.WindowState
  height?: number
  width?: number
  top?: number
  left?: number
  incognito?: boolean
  tabs?: TabOptions[]
  focused?: boolean
}

// TODO: Add find option to optionally search by ID
/**
 * @returns newly opened window ID
 */
export const openWindow = async (w: WindowOptions) => {
  const options: Windows.CreateCreateDataType = {
    state: w.state,
    focused: w.focused,
    incognito: w.incognito,
  }
  if (w.state === 'normal') {
    options.height = w.height
    options.width = w.width
    options.top = w.top
    options.left = w.left
  }

  const createdWindow = await browser.windows.create(options)

  if (w.tabs && w.tabs.length > 0 && createdWindow.id) {
    const emptyStartupTabIds = createdWindow.tabs?.map(({ id }) => id) || []
    // If the window should explicitly not be focused, then make sure none of the tabs are active
    // otherwise, an active tab will cause the window to be focused
    if (w.focused === false) {
      w.tabs = w.tabs.map((tab) => ({ ...tab, active: false }))
    }
    const createdTabs = await openTabs(w.tabs, createdWindow.id)
    console.log('createdTabs: ', createdTabs)
    const newWindow = await getWindow(createdWindow.id, { populate: true })
    const tabsToClose = newWindow.tabs?.filter(({ id }) =>
      emptyStartupTabIds.includes(id)
    )
    const closeTabs = tabsToClose?.map(async (tab) => {
      if (tab.id) {
        return await closeTab(tab.id)
      }
    })
    if (closeTabs) {
      await Promise.all(closeTabs)
    }
    return { window: createdWindow, tabs: createdTabs }
  }

  return { window: createdWindow, tabs: [] }
}

/**
 * @returns array of window IDs
 */
export const openWindows = async (windows: WindowOptions[]) => {
  const tasks = windows.map(openWindow)
  return await Promise.all(tasks)
}
