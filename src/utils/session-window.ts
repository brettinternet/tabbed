import { Tabs, Windows } from 'webextension-polyfill'

import { closeWindow, moveTabs, openWindow, updateWindow } from 'utils/browser'
import { AppError } from 'utils/error'
import { isDefined, PartialBy, reorder, XOR } from 'utils/helpers'

import { createId, fallbackWindowId, generateWindowTitle } from './generate'
import {
  SessionTab,
  CurrentSessionTab,
  SavedSessionTab,
  createCurrent as createCurrentTab,
  createSaved as createSavedTab,
  fromBrowser as fromBrowserTab,
  toCurrent as toCurrentTab,
  update as updateTab,
  isCurrentSessionTabs,
} from './session-tab'

const logContext = 'utils/session-window'

/**
 * Window data
 */
export type SessionWindow<T extends SessionTab = SessionTab> = {
  /**
   * Generated ID to more uniquely identify the entity
   */
  id: string
  tabs: T[]
  title?: string
  incognito: boolean
  focused: boolean
  state: Windows.WindowState
  height: number | undefined
  width: number | undefined
  top: number | undefined
  left: number | undefined
}

export type CurrentSessionWindow = SessionWindow<CurrentSessionTab> & {
  /**
   * ID assigned by the browser, only meaningful to a tab that is active
   */
  assignedWindowId: number
}
export type SavedSessionWindow = SessionWindow<SavedSessionTab>

export type UpdateSessionWindow = Partial<
  Pick<
    SessionWindow,
    'focused' | 'state' | 'top' | 'left' | 'width' | 'height' | 'tabs' | 'title'
  >
>

type OpenWindowReturn = {
  window?: Windows.Window
  tabs?: Tabs.Tab[]
}

/**
 * Type guards
 */

export const isCurrentSessionWindow = (
  win: CurrentSessionWindow | SavedSessionWindow | undefined
): win is CurrentSessionWindow => (win ? 'assignedWindowId' in win : false)

export const isCurrentSessionWindows = (
  windows: CurrentSessionWindow[] | SavedSessionWindow[]
): windows is CurrentSessionWindow[] => isCurrentSessionWindow(windows[0])

/**
 * Windows helpers
 */

export const findWindow = <T extends SessionWindow>(
  windows: T[],
  id: T['id']
): T => {
  const win = windows.find((w) => w.id === id)
  if (!win) {
    throw new AppError(logContext, `Unable to find window by ID ${id}`)
  }

  return win
}

export const findWindowIndex = <T extends SessionWindow>(
  windows: T[],
  id: T['id']
): number => {
  const index = windows.findIndex((w) => w.id === id)
  if (index === -1) {
    throw new AppError(logContext, `Unable to find window by ID ${id}`)
  }

  return index
}

const maybeGetTitle = (
  win: CurrentSessionWindow | SavedSessionWindow,
  maybeTitle?: SessionWindow['title']
) => maybeTitle ?? (win.title || generateWindowTitle(win.tabs))

export const createCurrent = ({
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
}: PartialBy<CurrentSessionWindow, 'id'>): CurrentSessionWindow => {
  const win: CurrentSessionWindow = {
    id: id || createId('window'),
    assignedWindowId,
    tabs,
    title: title || generateWindowTitle(tabs),
    incognito,
    focused,
    state,
    top,
    left,
    width,
    height,
  }

  if (!win.title) {
    win.title = maybeGetTitle(win)
  }

  return win
}

export const createSaved = ({
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
}: PartialBy<SavedSessionWindow, 'id'>): SavedSessionWindow => {
  const win: SavedSessionWindow = {
    id: id || createId('window'),
    tabs,
    title,
    incognito,
    focused,
    state,
    top,
    left,
    width,
    height,
  }

  if (!win.title) {
    win.title = maybeGetTitle(win)
  }

  return win
}

export const update = async <
  T extends CurrentSessionWindow | SavedSessionWindow
>(
  win: T,
  values: UpdateSessionWindow
): Promise<T> => {
  if (isCurrentSessionWindow(win)) {
    await updateWindow(win.assignedWindowId, values)
  }
  return Object.assign(win, values, {
    title: maybeGetTitle(win, values.title),
  })
}

export const toCurrent = async <
  T extends
    | PartialBy<SavedSessionWindow, 'id'>
    | PartialBy<CurrentSessionWindow, 'id'>
>(
  win: T
) => {
  if ('assignedWindowId' in win) {
    return {
      ...win,
      tabs: win.tabs.map(createCurrentTab),
    }
  } else {
    const { window, tabs } = await openWindow(win)
    const assignedWindowId = window?.id
    if (window && tabs && isDefined(assignedWindowId)) {
      return createCurrent({
        ...win,
        tabs: tabs
          .map((tab) => fromBrowserTab(tab, assignedWindowId))
          .filter(isDefined),
        assignedWindowId,
      })
    }
  }
}

const mapTabs = (
  tabs: Tabs.Tab[],
  assignedWindowId: CurrentSessionTab['assignedWindowId']
): CurrentSessionTab[] => {
  return (
    tabs
      // TODO: is this always necessary?
      .sort((a, b) => a.index - b.index)
      .reduce<CurrentSessionTab[]>((acc, tab) => {
        const maybeTab = fromBrowserTab(tab, assignedWindowId)
        return maybeTab ? acc.concat(maybeTab) : acc
      }, [])
  )
}

export const fromBrowser = (
  win: Windows.Window,
  id?: string
): CurrentSessionWindow => {
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
  const tabs = maybeTabs ? mapTabs(maybeTabs, assignedWindowId) : []
  return createCurrent({
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

/**
 * Filter has issues with union types
 * https://github.com/microsoft/TypeScript/issues/7294
 * https://github.com/microsoft/TypeScript/issues/36390
 * https://github.com/microsoft/TypeScript/issues/44373
 */
export const filterWindows = (
  windows: SavedSessionWindow[] | CurrentSessionWindow[],
  ids: SavedSessionWindow['id'][] | CurrentSessionWindow['id'][]
) =>
  // @ts-ignore 😢
  windows.filter((w) => ids.includes(w.id)) as
    | SavedSessionWindow[]
    | CurrentSessionWindow[]

export const filterTabs = (
  tabs: SavedSessionTab[] | CurrentSessionTab[],
  ids: SavedSessionTab['id'][] | CurrentSessionTab['id'][]
) =>
  // @ts-ignore 😢
  tabs.filter((t) => ids.includes(t.id)) as
    | SavedSessionTab[]
    | CurrentSessionTab[]

export const focus = async ({ assignedWindowId }: CurrentSessionWindow) => {
  await updateWindow(assignedWindowId, {
    focused: true,
  })
}

export const open = async (
  win: CurrentSessionWindow | SavedSessionWindow,
  focused?: boolean
) => {
  return await openWindow({
    ...win,
    focused: focused ?? win.focused,
  })
}

export const close = async ({ assignedWindowId }: CurrentSessionWindow) => {
  await closeWindow(assignedWindowId)
}

export const removeWindows = async (
  windows: CurrentSessionWindow[] | SavedSessionWindow[],
  ids: SessionWindow['id'][]
) => {
  for (const id of ids) {
    const index = findWindowIndex(windows, id)
    if (isCurrentSessionWindows(windows)) {
      await close(windows[index])
    }
    windows.splice(index, 1)
  }
  return windows
}

export const reorderWindows = (
  windows: CurrentSessionWindow[] | SavedSessionWindow[],
  fromIndex: number,
  toIndex: number
) => {
  return reorder(windows, fromIndex, toIndex)
}

export const addWindow = async (
  windows: CurrentSessionWindow[] | SavedSessionWindow[],
  {
    window: win,
    focused,
    index,
  }: {
    window: CurrentSessionWindow | SavedSessionWindow
  } & XOR<{ focused?: boolean }, { index?: number }>
) => {
  if (isCurrentSessionWindows(windows)) {
    const { window: openedBrowserWin, tabs: openedBrowserTabs } = await open(
      win,
      focused
    )
    if (openedBrowserWin) {
      const openedWindow = fromBrowser({
        ...openedBrowserWin,
        tabs: openedBrowserTabs,
      })
      windows.push(openedWindow)
    }
  } else {
    const savedWindow = createSaved(win)
    if (isDefined(index)) {
      windows.splice(index, 0, savedWindow)
    } else {
      windows.push(savedWindow)
    }
  }
  return windows
}

const move = async (
  win: CurrentSessionWindow,
  tabs: CurrentSessionTab[],
  index: number,
  pinned: boolean | undefined
): Promise<CurrentSessionTab[]> => {
  const originalTabs = tabs.slice()
  const _move = async (): Promise<CurrentSessionTab[]> => {
    const _tabs = await moveTabs({
      tabIds: originalTabs.map(({ assignedTabId }) => assignedTabId),
      windowId: win.assignedWindowId,
      index,
    })
    return _tabs.map(fromBrowserTab).filter(isDefined)
  }

  // when pinning, move to window
  tabs = await _move()
  // pinning moves the tab to last pin, so moving again is required
  if (isDefined(pinned)) {
    tabs = await Promise.all(
      tabs.map(async (t) => await updateTab(t, { pinned }))
    )
    if (pinned) {
      tabs = await _move()
    }
  }

  return tabs
}

export const addTabs = async (
  win: CurrentSessionWindow | SavedSessionWindow,
  tabs: CurrentSessionTab[] | SavedSessionTab[],
  index: number,
  pinned?: boolean
) => {
  if (isCurrentSessionWindow(win)) {
    if (isCurrentSessionTabs(tabs)) {
      let _tabs = tabs.slice()
      _tabs = await move(win, _tabs, index, pinned)
      console.log('_tabs: ', _tabs)
      win.tabs.splice(index, 0, ..._tabs.map(createCurrentTab))
    } else {
      win.tabs.splice(
        index,
        0,
        ...(
          await Promise.all(
            tabs.map(async (tab) => {
              if (isDefined(pinned)) {
                tab.pinned = pinned
              }
              return toCurrentTab(tab, win.assignedWindowId)
            })
          )
        ).filter(isDefined)
      )
    }
  } else {
    win.tabs.splice(index, 0, ...tabs.map(createSavedTab))
  }
  return win
}
