import browser, { Tabs } from 'webextension-polyfill'

import { closeTab, openTab, updateTab, updateWindow } from 'utils/browser'
import { isDefined, PartialBy } from 'utils/helpers'

import { createId, fallbackTabId } from './generate'

/**
 * Tab types
 */

export type SessionTab = {
  /**
   * Generated ID to more uniquely identify the entity
   */
  id: string
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
export type SomeSessionTab = CurrentSessionTab | SavedSessionTab

type UpdateSessionTabData = Partial<
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
export type UpdateCurrentSessionTab = UpdateSessionTabData
export type UpdateSavedSessionTab = UpdateSessionTabData & {
  title?: string
}

/**
 * Type guard when tabs are current session
 */

export const isCurrentSessionTab = (
  tab: SomeSessionTab | undefined
): tab is CurrentSessionTab => (tab ? 'assignedTabId' in tab : false)

export const isCurrentSessionTabs = (
  tabs: CurrentSessionTab[] | SavedSessionTab[]
): tabs is CurrentSessionTab[] => isCurrentSessionTab(tabs[0])

/**
 * Tab actions
 */

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
}: PartialBy<CurrentSessionTab, 'id'>): CurrentSessionTab => {
  return {
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
  }
}

export const updateCurrent = async (
  tab: CurrentSessionTab,
  values: UpdateCurrentSessionTab
): Promise<CurrentSessionTab> => {
  const { title } = await updateTab(tab.assignedTabId, values)
  return Object.assign({}, tab, values, { title })
}

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
}: PartialBy<SavedSessionTab, 'id'>): SavedSessionTab => {
  return {
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
  }
}

export const updateSaved = (
  tab: SavedSessionTab,
  values: UpdateSavedSessionTab
): SavedSessionTab => Object.assign({}, tab, values)

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
  const assignedTabId = newTab?.id
  if (isDefined(assignedTabId)) {
    return createCurrent({
      ...tab,
      assignedWindowId,
      assignedTabId,
    })
  }
}

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

export const focus = async ({
  assignedWindowId,
  assignedTabId,
}: CurrentSessionTab) => {
  await updateWindow(assignedWindowId, { focused: true })
  await updateTab(assignedTabId, { active: true })
}

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
  await openTab({
    url,
    pinned,
    windowId,
    incognito,
  })
}

export const close = async (tab: CurrentSessionTab) => {
  await closeTab(tab.assignedTabId)
}
