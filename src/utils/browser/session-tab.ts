import { Tabs } from 'webextension-polyfill'

import { generateFallbackId } from 'utils/helpers'

import { closeTab, focusWindowTab, openTab } from './query'

export type SessionTabOptions = {
  id: number
  url: string
  title?: string
  windowId: number
  active: boolean
  pinned: boolean
  muted: boolean
  discarded: boolean
  attention: boolean
  groupId?: number
  incognito: boolean
  activeSession: boolean
}

export class SessionTab {
  id: number
  url: string
  title?: string
  windowId: number
  active: boolean
  pinned: boolean
  muted: boolean
  discarded: boolean
  attention: boolean
  groupId?: number
  incognito: boolean
  activeSession: boolean

  constructor({
    id,
    url,
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
  }: SessionTabOptions) {
    this.id = id
    this.url = url
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

  async remove() {
    if (this.activeSession) {
      await closeTab(this.id)
    }
  }

  async focus() {
    await focusWindowTab(this.windowId, this.id)
  }

  async open() {
    const { url, pinned, windowId } = this
    await openTab({ url, pinned, windowId, incognito: this.incognito })
    // await openTabOrFocus({ url, pinned, windowId }, this.incognito)
  }
}
