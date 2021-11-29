import { Type } from 'class-transformer'
import { Tabs, Windows } from 'webextension-polyfill'

import { closeWindow, focusWindow, openWindow } from 'background/browser'
import { generateFallbackId } from 'utils/helpers'
import { log, AppError } from 'utils/logger'
import { SessionWindowClass, SessionWindowData } from 'utils/sessions'

import { SessionTab } from './session-tab'

const logContext = 'utils/browser/session-window'

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
  }: SessionWindowData) {
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
      title,
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
    return this.tabs.find((t) => t.id === tabId)
  }

  private findTabIndex(tabId: number) {
    return this.tabs.findIndex((t) => t.id === tabId)
  }

  // deleteTab(tabId: number) {
  //   const index = this.tabs.findIndex((t) => t.id === tabId)
  //   if (index > -1) {
  //     this.tabs.splice(index, 1)
  //   } else {
  //     new AppError({
  //       message: `Unable to find tab by ID ${tabId}`,
  //       context: logContext,
  //     })
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

  deleteTab(tabId: number) {
    const index = this.findTabIndex(tabId)
    if (index > -1) {
      this.tabs.splice(index, 1)
    } else {
      new AppError({
        message: `Unable to find tab by ID ${tabId}`,
        context: logContext,
      })
    }
  }

  // async openTab(tabId: number) {
  //   const maybeTab = this.findTab(tabId)
  //   if (maybeTab) {
  //     const { url, pinned, windowId } = maybeTab
  //     openTab({ url, pinned, windowId, incognito: this.incognito })
  //   } else {
  //     new AppError({
  //       message: `Unable to find tab by ID ${tabId}`,
  //       context: logContext,
  //     })
  //   }
  // }
}
