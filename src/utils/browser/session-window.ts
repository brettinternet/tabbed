import browser, { Tabs, Windows } from 'webextension-polyfill'

import { generateFallbackId } from 'utils/helpers'
import { log, AppError } from 'utils/logger'

import { closeWindow, focusWindow, openWindow } from './query'
import { SessionTab } from './session-tab'

const logContext = 'utils/browser/session-window'

type Position = {
  height: number | undefined
  width: number | undefined
  top: number | undefined
  left: number | undefined
}

export type SessionWindowOptions = {
  id: number
  tabs: SessionTab[]
  title?: string
  incognito: boolean
  focused: boolean
  state: Windows.WindowState
  position: Position
  /**
   * Whether window is part of an active session
   */
  activeSession: boolean
}

export class SessionWindow {
  id: number
  tabs: SessionTab[]
  title?: string
  incognito: boolean
  focused: boolean
  state: Windows.WindowState
  position: Position
  activeSession: boolean

  constructor({
    id,
    tabs,
    title,
    incognito,
    focused,
    state,
    activeSession,
    position,
  }: SessionWindowOptions) {
    this.id = id
    this.tabs = tabs
    this.title = title
    this.incognito = incognito
    this.focused = focused
    this.state = state
    this.position = position
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
      position: { height, width, top, left },
    })
  }

  private static mapTabs(
    tabs: Tabs.Tab[],
    meta: { windowId: number; incognito: boolean; activeSession: boolean }
  ): SessionTab[] {
    return tabs.reduce<SessionTab[]>((acc, tab) => {
      const maybeTab = SessionTab.fromTab(tab, meta)
      return maybeTab ? acc.concat(maybeTab) : acc
    }, [])
  }

  findTab(tabId: number) {
    return this.tabs.find((t) => t.id === tabId)
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

  async remove() {
    if (this.activeSession) {
      await closeWindow(this.id)
    }
  }

  async open() {
    if (this.activeSession) {
      await focusWindow(this.id)
    } else {
      const { id, tabs, position } = this
      // TODO: convert tabs?
      // openWindow({ id, tabs, ...position })
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
