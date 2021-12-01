import { Tabs } from 'webextension-polyfill'

import { closeTab, focusWindowTab, openTab } from 'background/browser'
import { generateFallbackId } from 'utils/helpers'
import { SessionTabClass, SessionTabData } from 'utils/sessions'

export interface SessionTab extends SessionTabClass {}
export class SessionTab {
  constructor({
    id,
    url,
    favIconUrl,
    title,
    windowId,
    active,
    pinned,
    muted,
    discarded,
    attention,
    groupId,
    incognito,
    activeSession,
  }: SessionTabData) {
    this.id = id
    this.url = url
    this.favIconUrl = favIconUrl
    this.title = title
    this.windowId = windowId
    this.active = active
    this.pinned = pinned
    this.muted = muted
    this.discarded = discarded
    this.attention = attention
    this.groupId = groupId
    this.incognito = incognito
    this.activeSession = activeSession
  }

  /**
   * Returns undefined when no url or pendingUrl are available
   */
  static fromTab(
    tab: Tabs.Tab,
    {
      windowId,
      incognito,
      activeSession,
    }: { windowId: number; incognito: boolean; activeSession: boolean }
  ): SessionTab | undefined {
    const {
      id: maybeId,
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
      return new SessionTab({
        id: maybeId || generateFallbackId(),
        url,
        favIconUrl,
        title,
        windowId,
        active,
        pinned,
        muted: mutedInfo?.muted || false,
        discarded: discarded || false,
        attention: attention || false,
        groupId,
        incognito,
        activeSession,
      })
    }
  }

  togglePin() {
    this.pinned = !this.pinned
  }

  async focus() {
    await focusWindowTab(this.windowId, this.id)
  }

  async open() {
    const { url, pinned, windowId } = this
    await openTab({ url, pinned, windowId, incognito: this.incognito })
    // await openTabOrFocus({ url, pinned, windowId }, this.incognito)
  }

  update({
    url,
    title,
    windowId,
    active,
    pinned,
    muted,
    discarded,
    attention,
    groupId,
  }: Partial<
    Pick<
      SessionTabData,
      | 'url'
      | 'title'
      | 'windowId'
      | 'active'
      | 'pinned'
      | 'muted'
      | 'discarded'
      | 'attention'
      | 'groupId'
    >
  >) {
    this.url = url || this.url
    this.title = title || this.title
    this.windowId = windowId || this.windowId
    this.active = active || this.active
    this.pinned = pinned || this.pinned
    this.muted = muted || this.muted
    this.discarded = discarded || this.discarded
    this.attention = attention || this.attention
    this.groupId = groupId || this.groupId
  }
}
