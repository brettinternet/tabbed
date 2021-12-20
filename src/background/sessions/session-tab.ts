import { Tabs } from 'webextension-polyfill'

import { closeTab, openTab, updateTab, updateWindow } from 'background/browser'
import { isDefined } from 'utils/helpers'
import {
  CurrentSessionTabClass,
  CurrentSessionTabData,
  SavedSessionTabClass,
  SavedSessionTabData,
  UpdateCurrentSessionTabData,
  UpdateSavedSessionTabData,
} from 'utils/sessions'

import { createId, fallbackTabId } from './generate'

/**
 * Currently active tab
 */
export interface CurrentSessionTab extends CurrentSessionTabClass {}
export class CurrentSessionTab {
  constructor({
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
  }: // incognito,
  Omit<CurrentSessionTabData, 'id'>) {
    this.id = createId('tab')
    this.assignedTabId = assignedTabId
    this.assignedWindowId = assignedWindowId
    this.url = url
    this.favIconUrl = favIconUrl
    this.title = title
    this.active = active
    this.pinned = pinned
    this.muted = muted
    this.discarded = discarded
    this.attention = attention
    this.groupId = groupId
    // this.incognito = incognito
  }

  static async from<
    T extends Omit<CurrentSessionTab, 'id'> | Omit<SavedSessionTab, 'id'>
  >(
    tab: T,
    assignedWindowId: CurrentSessionTabData['assignedWindowId']
  ): Promise<CurrentSessionTab | undefined> {
    const { url, pinned } = tab
    const newTab = await openTab({
      url,
      pinned,
      windowId: assignedWindowId,
    })
    const assignedTabId = newTab?.id
    if (isDefined(assignedTabId)) {
      return new CurrentSessionTab({
        ...tab,
        assignedWindowId,
        assignedTabId,
      })
    }
  }

  /**
   * Returns undefined when no url or pendingUrl are available
   */
  static fromTab(
    tab: Tabs.Tab,
    { windowId, incognito }: { windowId: number; incognito?: boolean }
  ): CurrentSessionTab | undefined {
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
      return new CurrentSessionTab({
        assignedTabId: maybeAssignedTabId || fallbackTabId(),
        url,
        favIconUrl,
        title,
        assignedWindowId: windowId,
        active,
        pinned,
        muted: mutedInfo?.muted || false,
        discarded: discarded || false,
        attention: attention || false,
        groupId,
        // incognito,
      })
    }
  }

  async focus() {
    await updateWindow(this.assignedWindowId, { focused: true })
    await updateTab(this.assignedTabId, { active: true })
  }

  async open(windowId?: CurrentSessionTab['assignedWindowId']) {
    const { url, pinned } = this
    await openTab({
      url,
      pinned,
      windowId: windowId || this.assignedWindowId,
    })
  }

  async close() {
    await closeTab(this.assignedTabId)
  }

  async update({
    url,
    active,
    discarded,
    pinned,
    muted,
    attention,
    groupId,
  }: UpdateCurrentSessionTabData) {
    const { title } = await updateTab(this.assignedTabId, {
      url,
      active,
      discarded,
      pinned,
      muted,
    })
    this.url = url || this.url
    this.title = title
    this.active = isDefined(active) ? active : this.active
    this.discarded = isDefined(discarded) ? discarded : this.discarded
    this.pinned = isDefined(pinned) ? pinned : this.pinned
    this.muted = isDefined(muted) ? muted : this.muted
    this.attention = isDefined(attention) ? attention : this.attention
    this.groupId = groupId || this.groupId
  }
}

/**
 * Tab in saved session
 */
export interface SavedSessionTab extends SavedSessionTabClass {}
export class SavedSessionTab {
  constructor({
    url,
    favIconUrl,
    title,
    active,
    pinned,
    muted,
    discarded,
    attention,
    groupId,
  }: // incognito,
  Omit<SavedSessionTabData, 'id'>) {
    this.id = createId('tab')
    this.url = url
    this.favIconUrl = favIconUrl
    this.title = title
    this.active = active
    this.pinned = pinned
    this.muted = muted
    this.discarded = discarded
    this.attention = attention
    this.groupId = groupId
    // this.incognito = incognito
  }

  async open({
    windowId,
    incognito,
  }: { windowId?: number; incognito?: boolean } = {}) {
    const { url, pinned } = this
    await openTab({ url, pinned, windowId, incognito })
  }

  update({
    url,
    title,
    active,
    pinned,
    muted,
    discarded,
    attention,
    groupId,
  }: UpdateSavedSessionTabData) {
    this.url = url || this.url
    this.title = title || this.title
    this.active = isDefined(active) ? active : this.active
    this.discarded = isDefined(discarded) ? discarded : this.discarded
    this.pinned = isDefined(pinned) ? pinned : this.pinned
    this.muted = isDefined(muted) ? muted : this.muted
    this.attention = isDefined(attention) ? attention : this.attention
    this.groupId = groupId || this.groupId
  }
}
