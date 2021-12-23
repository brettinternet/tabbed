import { Type } from 'class-transformer'
import { Tabs, Windows } from 'webextension-polyfill'

import {
  closeTab,
  closeWindow,
  moveTabs,
  openWindow,
  updateWindow,
} from 'utils/browser'
import { AppError } from 'utils/error'
import { isDefined } from 'utils/helpers'
import {
  CurrentSessionWindowClass,
  CurrentSessionWindowData,
  isCurrentSessionTabs,
  OptionalId,
  SavedSessionTabData,
  SavedSessionWindowClass,
  SavedSessionWindowData,
  SessionTabData,
  UpdateSessionWindow,
} from 'utils/sessions/types'

import { createId, fallbackWindowId, generateWindowTitle } from './generate'
import { CurrentSessionTab, SavedSessionTab } from './session-tab'

const logContext = 'background/sessions/session-window'

/**
 * Currently active window
 */
export interface CurrentSessionWindow extends CurrentSessionWindowClass {}
export class CurrentSessionWindow {
  @Type(() => CurrentSessionTab)
  tabs: CurrentSessionTab[]

  constructor({
    id,
    assignedWindowId,
    tabs,
    title,
    incognito,
    focused,
    state,
    top,
    left,
    width,
    height,
  }: OptionalId<CurrentSessionWindowData<CurrentSessionTab>> & {
    id?: string
  }) {
    this.id = id || createId('window')
    this.assignedWindowId = assignedWindowId
    this.tabs = tabs
    this.title = title || generateWindowTitle(tabs)
    this.incognito = incognito
    this.focused = focused
    this.state = state
    this.top = top
    this.left = left
    this.width = width
    this.height = height
  }

  static async from<
    T extends
      | OptionalId<SavedSessionWindowData>
      | OptionalId<CurrentSessionWindowData>
  >(win: T) {
    if ('assignedWindowId' in win) {
      return new CurrentSessionWindow({
        ...win,
        tabs: win.tabs.map((tab) => new CurrentSessionTab(tab)),
      })
    } else {
      const { window, tabs } = await openWindow(win)
      const assignedWindowId = window?.id
      if (window && tabs && isDefined(assignedWindowId)) {
        return new CurrentSessionWindow({
          ...win,
          tabs: tabs
            .map((tab) => CurrentSessionTab.fromTab(tab, assignedWindowId))
            .filter(isDefined),
          assignedWindowId,
        })
      }
    }
  }

  static fromWindow(win: Windows.Window, id?: string): CurrentSessionWindow {
    const {
      id: maybeAssignedWindowId,
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
    const assignedWindowId = maybeAssignedWindowId || fallbackWindowId()
    const tabs = maybeTabs ? this.mapTabs(maybeTabs, assignedWindowId) : []
    return new CurrentSessionWindow({
      id,
      assignedWindowId,
      focused,
      tabs,
      title: title || generateWindowTitle(tabs),
      incognito,
      state: state || 'normal',
      height,
      width,
      top,
      left,
    })
  }

  private static mapTabs(
    tabs: Tabs.Tab[],
    assignedWindowId: CurrentSessionTab['assignedWindowId']
  ): CurrentSessionTab[] {
    return (
      tabs
        // TODO: is this always necessary?
        .sort((a, b) => a.index - b.index)
        .reduce<CurrentSessionTab[]>((acc, tab) => {
          const maybeTab = CurrentSessionTab.fromTab(tab, assignedWindowId)
          return maybeTab ? acc.concat(maybeTab) : acc
        }, [])
    )
  }

  findTab(tabId: SessionTabData['id']) {
    return findTab(this.tabs, tabId)
  }

  findTabIndex(tabId: SessionTabData['id']) {
    return findTabIndex(this.tabs, tabId)
  }

  async update({
    title,
    focused,
    state,
    top,
    left,
    width,
    height,
  }: UpdateSessionWindow) {
    await updateWindow(this.assignedWindowId, {
      focused,
      state,
      top,
      left,
      width,
      height,
    })
    this.title = title || this.title
    this.focused = focused || this.focused
    this.state = state || this.state
    this.top = top || this.top
    this.left = left || this.left
    this.width = width || this.width
    this.height = height || this.height
  }

  async focus() {
    await updateWindow(this.assignedWindowId, {
      focused: true,
    })
  }

  async open(focused?: boolean) {
    return await openWindow({
      ...this,
      focused: isDefined(focused) ? focused : this.focused,
    })
  }

  async close() {
    await closeWindow(this.assignedWindowId)
  }

  async addTabs(
    tabs: CurrentSessionTab[] | SavedSessionTab[],
    index: number,
    pinned?: boolean
  ) {
    if (isCurrentSessionTabs(tabs)) {
      const move = async () => {
        await moveTabs({
          tabIds: tabs.map(({ assignedTabId }) => assignedTabId),
          windowId: this.assignedWindowId,
          index,
        })
      }

      // when pinning, move to window
      await move()
      // pinning moves the tab to last pin, so moving is required again
      if (isDefined(pinned)) {
        await Promise.all(tabs.map(async (t) => await t.update({ pinned })))
        if (pinned) {
          await move()
        }
      }
    } else {
      this.tabs.splice(
        index,
        0,
        ...(
          await Promise.all(
            tabs.map(async (tab) => {
              if (isDefined(pinned)) {
                tab.pinned = pinned
              }
              return await CurrentSessionTab.from(tab, this.assignedWindowId)
            })
          )
        ).filter(isDefined)
      )
    }
  }

  async removeTab(id: SessionTabData['id']) {
    const tab = this.findTab(id)
    await closeTab(tab.assignedTabId)
  }
}

/**
 * Window in saved session
 */
export interface SavedSessionWindow extends SavedSessionWindowClass {}
export class SavedSessionWindow {
  @Type(() => SavedSessionTab)
  tabs: SavedSessionTab[]

  constructor({
    id,
    tabs,
    title,
    incognito,
    focused,
    state,
    top,
    left,
    width,
    height,
  }: OptionalId<SavedSessionWindowData<SavedSessionTabData>>) {
    this.id = id || createId('window')
    this.tabs = tabs.map((data) => new SavedSessionTab(data))
    this.title = title || generateWindowTitle(tabs)
    this.incognito = incognito
    this.focused = focused
    this.state = state
    this.top = top
    this.left = left
    this.width = width
    this.height = height
  }

  static from<
    T extends
      | OptionalId<SavedSessionWindowData>
      | OptionalId<CurrentSessionWindowData>
  >(win: T) {
    return new SavedSessionWindow(win)
  }

  findTab(tabId: SessionTabData['id']) {
    return findTab(this.tabs, tabId)
  }

  findTabIndex(tabId: SessionTabData['id']) {
    return findTabIndex(this.tabs, tabId)
  }

  update({
    title,
    focused,
    state,
    top,
    left,
    width,
    height,
  }: UpdateSessionWindow) {
    this.title = title || this.title
    this.focused = focused || this.focused
    this.state = state || this.state
    this.top = top || this.top
    this.left = left || this.left
    this.width = width || this.width
    this.height = height || this.height
  }

  async open(focused?: boolean) {
    return await openWindow({ ...this, focused })
  }

  addTabs(tabs: CurrentSessionTab[] | SavedSessionTab[], index: number) {
    this.tabs.splice(index, 0, ...tabs.map((t) => new SavedSessionTab(t)))
  }

  removeTab(id: SavedSessionTab['id']) {
    const index = this.findTabIndex(id)
    if (index === -1) {
      new AppError(logContext, `Unable to find tab by ID ${id}`)
    }

    this.tabs.splice(index, 1)
  }
}
