import { Type } from 'class-transformer'
import { Tabs, Windows } from 'webextension-polyfill'

import {
  closeTab,
  closeWindow,
  focusWindow,
  openWindow,
} from 'background/browser'
import { BackgroundError } from 'background/error'
import { generateFallbackId } from 'utils/helpers'
import { SessionWindowClass, SessionWindowData } from 'utils/sessions'

import { generateWindowTitle } from './generate'
import { SessionTab } from './session-tab'

const logContext = 'background/sessions/session-window'

export interface SessionWindow extends SessionWindowClass {}
export class SessionWindow {
  @Type(() => SessionTab)
  tabs: SessionTab[]

  constructor({
    id,
    tabs,
    title,
    incognito,
    focused,
    state,
    activeSession,
    top,
    left,
    width,
    height,
  }: SessionWindowData<SessionTab>) {
    this.id = id
    this.tabs = tabs
    this.title = title
    this.incognito = incognito
    this.focused = focused
    this.state = state
    this.top = top
    this.left = left
    this.width = width
    this.height = height
    this.activeSession = activeSession
  }

  static fromWindow(
    win: Windows.Window,
    activeSession: boolean
  ): SessionWindow {
    const {
      id: maybeId,
      focused,
      tabs: maybeTabs,
      title,
      incognito,
      state,
      height,
      width,
      top,
      left,
    } = win
    const id = maybeId || generateFallbackId()
    const tabs = maybeTabs
      ? this.mapTabs(maybeTabs, { windowId: id, incognito, activeSession })
      : []
    return new SessionWindow({
      id,
      focused,
      tabs,
      title: title || generateWindowTitle(tabs),
      incognito,
      state: state || 'normal',
      activeSession,
      height,
      width,
      top,
      left,
    })
  }

  private static mapTabs(
    tabs: Tabs.Tab[],
    meta: { windowId: number; incognito: boolean; activeSession: boolean }
  ): SessionTab[] {
    return (
      tabs
        // TODO: is this always necessary?
        .sort((a, b) => a.index - b.index)
        .reduce<SessionTab[]>((acc, tab) => {
          const maybeTab = SessionTab.fromTab(tab, meta)
          return maybeTab ? acc.concat(maybeTab) : acc
        }, [])
    )
  }

  findTab(tabId: number) {
    const tab = this.tabs.find((t) => t.id === tabId)
    if (!tab) {
      throw new BackgroundError(logContext, `Unable to find tab by ID ${tabId}`)
    }

    return tab
  }

  private findTabIndex(tabId: number) {
    const index = this.tabs.findIndex((t) => t.id === tabId)
    if (index === -1) {
      throw new BackgroundError(logContext, `Unable to find tab by ID ${tabId}`)
    }

    return index
  }

  // deleteTab(tabId: number) {
  //   const index = this.tabs.findIndex((t) => t.id === tabId)
  //   if (index > -1) {
  //     this.tabs.splice(index, 1)
  //   } else {
  //     new BackgroundError(logContext, `Unable to find tab by ID ${tabId}`)
  //   }
  // }

  update({
    focused,
    state,
    top,
    left,
    width,
    height,
  }: Partial<
    Pick<
      SessionWindowData,
      'focused' | 'state' | 'top' | 'left' | 'width' | 'height'
    >
  >) {
    this.focused = focused || this.focused
    this.state = state || this.state
    this.top = top || this.top
    this.left = left || this.left
    this.width = width || this.width
    this.height = height || this.height
  }

  async remove() {
    if (this.activeSession) {
      await closeWindow(this.id)
    }
  }

  async focusOrOpen() {
    if (this.activeSession) {
      await focusWindow(this.id)
    } else {
      this.open()
    }
  }

  async open() {
    const { tabs, incognito, state, top, left, width, height } = this
    return openWindow({ tabs, state, incognito, top, left, width, height })
  }

  async removeTab(tabId: number) {
    if (this.activeSession) {
      await closeTab(tabId)
    } else {
      this.deleteTab(tabId)
    }
  }

  private deleteTab(tabId: number) {
    const index = this.findTabIndex(tabId)
    if (index > -1) {
      this.tabs.splice(index, 1)
    } else {
      new BackgroundError(logContext, `Unable to find tab by ID ${tabId}`)
    }
  }

  // async openTab(tabId: number) {
  //   const maybeTab = this.findTab(tabId)
  //   if (maybeTab) {
  //     const { url, pinned, windowId } = maybeTab
  //     openTab({ url, pinned, windowId, incognito: this.incognito })
  //   } else {
  // new BackgroundError(logContext, `Unable to find tab by ID ${tabId}`)
  //   }
  // }
}
