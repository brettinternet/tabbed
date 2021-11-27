import browser, { Tabs, Windows } from 'webextension-polyfill'

import { isDefined } from 'utils/helpers'
import { readSettings } from 'utils/settings'

/**
 * `pendingUrl` for Chrome browsers where status === 'loading'
 * See `browser.d.ts`
 */
export const getTabUrl = (tab: Tabs.Tab) => tab.pendingUrl || tab.url

export const isNewTab = (tab: Tabs.Tab) => {
  // Chrome
  const url = getTabUrl(tab)
  if (url && /^chrome:\/\/newtab\/?$/.test(url)) {
    return true
  }

  // Firefox
  // Firefox tabs have a `about:blank` url when status === 'loading'
  if (
    (url === 'about:blank' || url === 'about:newtab') &&
    tab?.status === 'complete' &&
    tab?.title === 'New Tab'
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

export const getWindowAndTabs = (windowId: number) =>
  browser.windows.get(windowId, { populate: true })

export const getCurrentWindow = (options?: Windows.GetInfo) =>
  browser.windows.getCurrent(options)

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
  focusedWindowId: number = browser.windows.WINDOW_ID_NONE
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

  const settings = await readSettings()
  if (settings.sortFocusedWindowFirst) {
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

export const focusWindow = async (windowId: number) => {
  await browser.windows.update(windowId, {
    focused: true,
  })
}

const activateTab = async (tabId: number) => {
  await browser.tabs.update(tabId, {
    active: true,
  })
}

export const focusWindowTab = async (windowId: number, tabId: number) => {
  const currentWindow = await getCurrentWindow()
  if (windowId !== currentWindow.id) {
    await focusWindow(windowId)
  }
  await activateTab(tabId)
}

type OpenTabOptions = {
  url: string
  pinned?: boolean
  windowId?: number
  incognito?: boolean
  focus?: boolean
}

/**
 * Find existing tab with matching query, otherwise
 * open with matching incognito state
 */
export const openTab = async ({
  url,
  pinned,
  windowId,
  incognito,
  focus = true,
}: OpenTabOptions) => {
  const allowed = await browser.extension.isAllowedIncognitoAccess()
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
      await browser.tabs.update(newTab.id, { pinned, active: focus })
    }
  } else {
    newTab = await browser.tabs.create({ url, pinned, windowId, active: focus })
  }
  return newTab
}

const openTabs = async (tabs: Tabs.Tab[], windowId?: number) => {
  const tasks = tabs
    .sort((a, b) => a.index - b.index)
    .map(async (tab) => {
      const { url, pinned, index, active } = tab
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
  await Promise.all(tasks)
}

export const openTabOrFocus = async (
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
    await focusWindowTab(tab.windowId, tab.id)
  } else {
    const { url, pinned } = query
    if (url) {
      await openTab({ url, pinned, incognito })
    }
  }
}

// TODO: Add find option to optionally search by ID
/**
 * @returns newly opened window ID
 */
export const openWindow = async (w: Windows.Window) => {
  const options: Windows.CreateCreateDataType = {
    state: w.state,
  }
  switch (w.state) {
    case 'normal':
      options.height = w.height
      options.width = w.width
      break
    case 'minimized':
      break
    case 'maximized':
      options.top = w.top
      options.left = w.left
      break
  }

  const firstTab = w.tabs?.[0]
  const createdWindow = await browser.windows.create({
    incognito: firstTab?.incognito,
    ...options,
  })

  if (w.tabs && createdWindow.id) {
    const emptyStartupTabIds = createdWindow.tabs?.map(({ id }) => id) || []
    await openTabs(w.tabs, createdWindow.id)
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
    return createdWindow.id
  }
}

/**
 * @returns array of window IDs
 */
export const openWindows = async (
  windows: Windows.Window[]
): Promise<number[]> => {
  const tasks = windows.map(openWindow)
  const results = await Promise.all(tasks)
  return results.filter(isDefined)
}
