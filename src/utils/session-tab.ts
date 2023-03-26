import browser, { Tabs } from 'webextension-polyfill'

import { closeTab, openTab, updateTab, updateWindow } from 'utils/browser'
import { PartialBy } from 'utils/helpers'

import { AppError } from './error'
import { createId, fallbackTabId } from './generate'

const logContext = 'utils/session-tab'

type TabId = string

/**
 * Tab type
 */
export type SessionTab = {
  /**
   * Generated ID to more uniquely identify the entity
   */
  id: TabId
  url: string
  favIconUrl?: string
  title?: string
  active: boolean
  pinned: boolean
  muted: boolean
  discarded: boolean
  attention: boolean
  groupId?: number
  // incognito: boolean
}
export type CurrentSessionTab = SessionTab & {
  /**
   * ID assigned by the browser, only meaningful to a tab that is active
   */
  assignedTabId: number
  assignedWindowId: number
}
export type SavedSessionTab = SessionTab

type UpdateSessionTab = Partial<
  Pick<
    SessionTab,
    | 'url'
    | 'active'
    | 'discarded'
    | 'pinned'
    | 'muted'
    | 'attention'
    | 'groupId'
  >
>

/**
 * @usage Type guard for `CurrentSessionTab`
 * @returns true when tab is current session type
 */
export const isCurrentSessionTab = (
  tab: CurrentSessionTab | SavedSessionTab | undefined
): tab is CurrentSessionTab => (tab ? 'assignedTabId' in tab : false)

/**
 * @usage Type guard for `CurrentSessionTab[]`
 * @returns true when tabs are current session
 */
export const isCurrentSessionTabs = (
  tabs: CurrentSessionTab[] | SavedSessionTab[]
): tabs is CurrentSessionTab[] => tabs.every(isCurrentSessionTab)

/**
 * @returns tab, throws if tabId not found
 */
export const findTab = <T extends SessionTab>(tabs: T[], tabId: T['id']): T => {
  const tab = tabs.find((t) => t.id === tabId)
  if (!tab) {
    throw new AppError(logContext, `Unable to find tab by ID ${tabId}`)
  }

  return tab
}

/**
 * @returns tab index, throws if tabId not found
 */
export const findTabIndex = <T extends SessionTab>(
  tabs: T[],
  tabId: T['id']
): number => {
  const index = tabs.findIndex((t) => t.id === tabId)
  if (index === -1) {
    throw new AppError(logContext, `Unable to find tab by ID ${tabId}`)
  }

  return index
}

export const createCurrent = ({
  id,
  assignedTabId,
  assignedWindowId,
  url,
  favIconUrl,
  title,
  active,
  pinned,
  muted,
  discarded,
  attention,
  groupId,
}: PartialBy<CurrentSessionTab, 'id'>): CurrentSessionTab => ({
  id: id || createId('tab'),
  url,
  favIconUrl,
  title,
  active,
  pinned,
  muted,
  discarded,
  attention,
  groupId,
  assignedWindowId,
  assignedTabId,
})

export const createSaved = ({
  id,
  url,
  favIconUrl,
  title,
  active,
  pinned,
  muted,
  discarded,
  attention,
  groupId,
}: PartialBy<SavedSessionTab, 'id'>): SavedSessionTab => ({
  id: id || createId('tab'),
  url,
  favIconUrl,
  title,
  active,
  pinned,
  muted,
  discarded,
  attention,
  groupId,
})

/**
 *
 * @returns patched current or saved tab
 */
export const update = async <T extends CurrentSessionTab | SavedSessionTab>(
  tab: T,
  values: UpdateSessionTab
): Promise<T> => {
  if (isCurrentSessionTab(tab)) {
    const { title } = await updateTab(tab.assignedTabId, values)
    Object.assign(tab, { title })
  }
  return Object.assign({}, tab, values)
}

/**
 * @usage Opens a saved or current tab into the current session
 * @note Side effect of opening the tab, using the created tab
 * data to return a `CurrentSessionTab`
 */
export const toCurrent = async <
  T extends
    | PartialBy<CurrentSessionTab, 'id'>
    | PartialBy<SavedSessionTab, 'id'>
>(
  tab: T,
  assignedWindowId: CurrentSessionTab['assignedWindowId']
): Promise<CurrentSessionTab | undefined> => {
  const { url, pinned } = tab
  const newTab = await openTab({
    url,
    pinned,
    windowId: assignedWindowId,
  })
  if (newTab) {
    return fromBrowser(newTab, assignedWindowId)
  }
}

/**
 * @usage Converts a browser `Tabs.Tab` to a `CurrentSessionTab`
 * Does _NOT_ produce side effects, such as opening the tab
 */
export const fromBrowser = (
  tab: Tabs.Tab,
  windowId: CurrentSessionTab['assignedWindowId']
): CurrentSessionTab | undefined => {
  const {
    id: maybeAssignedTabId,
    url: maybeUrl,
    pendingUrl,
    favIconUrl,
    title,
    active,
    pinned,
    mutedInfo,
    discarded,
    attention,
    groupId,
  } = tab
  const url = maybeUrl || pendingUrl
  if (url) {
    return createCurrent({
      assignedTabId: maybeAssignedTabId || fallbackTabId(),
      url,
      favIconUrl,
      title,
      assignedWindowId: windowId,
      active,
      pinned,
      muted: mutedInfo?.muted ?? false,
      discarded: discarded ?? false,
      attention: attention ?? false,
      groupId,
    })
  }
}

/**
 * @usage focuses a tab and its window in the current session
 */
export const focus = async ({
  assignedWindowId,
  assignedTabId,
}: CurrentSessionTab) => {
  await updateWindow(assignedWindowId, { focused: true })
  await updateTab(assignedTabId, { active: true })
}

/**
 * @usage open current or saved tab into current session
 */
export const open = async (
  tab: CurrentSessionTab | SavedSessionTab,
  {
    windowId: overrideWindowId,
    incognito,
  }: {
    windowId?: CurrentSessionTab['assignedWindowId']
    incognito?: boolean
  } = {}
) => {
  const { url, pinned } = tab
  const windowId =
    overrideWindowId ||
    (isCurrentSessionTab(tab)
      ? tab.assignedWindowId
      : browser.windows.WINDOW_ID_CURRENT)
  const createdTab = await openTab({
    url,
    pinned,
    windowId,
    incognito,
  })
  if (createdTab) {
    return fromBrowser(createdTab, windowId)
  }
}

export const close = async (tab: CurrentSessionTab) => {
  await closeTab(tab.assignedTabId)
}

/**
 * @usage remove certain tabs by IDs from a collection of tabs
 */
export const removeTabs = async (
  tabs: CurrentSessionTab[] | SavedSessionTab[],
  ids: SessionTab['id'][]
) => {
  for (const id of ids) {
    const index = findTabIndex(tabs, id)
    if (isCurrentSessionTabs(tabs)) {
      await closeTab(tabs[index].assignedTabId)
    }
    tabs.splice(index, 1)
  }
  return tabs
}

/**
 * Helper with moving a tab to determine if the
 * move tabbed should be pinned
 */
export const shouldPin = (
  target: SessionTab,
  previous: SessionTab | undefined,
  next: SessionTab | undefined
) => {
  if (
    next?.pinned ||
    (target.pinned && previous?.pinned) ||
    (target.pinned && !previous)
  ) {
    return true
  }

  return false
}
