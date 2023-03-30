import { cloneDeep, merge } from 'lodash'
import { Tabs, Windows } from 'webextension-polyfill'

import {
  closeTab,
  closeWindow,
  moveTabs,
  openWindow,
  updateWindow,
} from 'utils/browser'
import { AppError } from 'utils/error'
import { isDefined, PartialBy } from 'utils/helpers'

import {
  BrandedUuid,
  createId,
  fallbackTabId,
  fallbackWindowId,
  generateWindowTitle,
} from './generate'
import {
  SessionTab,
  CurrentSessionTab,
  SavedSessionTab,
  createCurrent as createCurrentTab, // createSaved as createSavedTab,
  fromBrowser as fromBrowserTab,
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
  id: BrandedUuid<'window'>
  tabs: T[]
  /**
   * Title is generated from tab content
   * TODO: add `userAssignedTitle` field when title is user-editable to avoid overriding
   */
  title?: string
  // userAssignedTitle: boolean
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
    'focused' | 'state' | 'top' | 'left' | 'width' | 'height' | 'tabs'
  >
>

// type OpenWindowReturn = {
//   window?: Windows.Window
//   tabs?: Tabs.Tab[]
// }

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

/**
 * @returns found window, throws if not found
 */
export const findWindow = (
  windows: CurrentSessionWindow[] | SavedSessionWindow[],
  id: SessionWindow['id']
): CurrentSessionWindow | SavedSessionWindow => {
  const win = windows.find((w) => w.id === id)
  if (!win) {
    throw new AppError(logContext, `Unable to find window by ID ${id}`)
  }

  return cloneDeep(win)
}

/**
 * @returns index of window, throws if not found
 */
export const findWindowIndex = (
  windows: CurrentSessionWindow[] | SavedSessionWindow[],
  id: SessionWindow['id']
): number => {
  const index = windows.findIndex((w) => w.id === id)
  if (index === -1) {
    throw new AppError(logContext, `Unable to find window by ID ${id}`)
  }

  return index
}

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
    win.title = generateWindowTitle(win.tabs)
  }

  return cloneDeep(win)
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
    win.title = generateWindowTitle(win.tabs)
  }

  return cloneDeep(win)
}

/**
 * For optimistic updates where updates must be synchronous
 */
export const createCurrentDraft = (
  win: PartialBy<SavedSessionWindow, 'id'>
) => {
  const draftAssignedWindowId = fallbackWindowId()
  const draftAssignedTabId = fallbackTabId()
  const newWindow = createCurrent({
    ...win,
    assignedWindowId: draftAssignedWindowId,
    tabs: win.tabs.map((t) => ({
      ...t,
      assignedTabId: draftAssignedTabId,
      assignedWindowId: draftAssignedWindowId,
    })),
  })
  const clonedWindow: SessionWindow = cloneDeep(newWindow)
  const focused = newWindow.focused
  const commit = async (
    cb: (win: CurrentSessionWindow) => Promise<void> | void
  ) => {
    const { window: openedBrowserWin, closeStartupTabs } = await open(
      clonedWindow,
      focused
    )
    if (openedBrowserWin) {
      // ignoring startup tabs from window open above
      const newCurrentWindow = fromBrowser({
        ...openedBrowserWin,
        tabs: [],
      })
      newCurrentWindow.title = generateWindowTitle(newCurrentWindow.tabs)
      // move tabs to new window or whatever else
      await cb(newCurrentWindow)
      // then cleanup startup tabs
      if (closeStartupTabs) {
        await closeStartupTabs()
      }
    }
  }

  return {
    window: newWindow,
    commit,
    draftAssignedWindowId,
    draftAssignedTabId,
  }
}

export const update = async (
  win: CurrentSessionWindow | SavedSessionWindow,
  values: UpdateSessionWindow
): Promise<CurrentSessionWindow | SavedSessionWindow> => {
  if (isCurrentSessionWindow(win)) {
    await updateWindow(win.assignedWindowId, values)
  }
  return merge(win, values, {
    title: generateWindowTitle(win.tabs),
  })
}

/**
 * @usage Maps truthy browser tabs to `CurrentSessionTab`
 */
const mapTabs = (
  tabs: Tabs.Tab[],
  assignedWindowId: CurrentSessionTab['assignedWindowId'],
  existingTabs?: CurrentSessionTab[]
): CurrentSessionTab[] => {
  return (
    tabs
      // TODO: is this always necessary?
      .sort((a, b) => a.index - b.index)
      .reduce<CurrentSessionTab[]>((acc, tab) => {
        const existingTab = existingTabs?.find(
          (t) => tab.id && tab.id === t.assignedTabId
        )
        const maybeTab = fromBrowserTab(tab, assignedWindowId, existingTab?.id)
        return maybeTab ? acc.concat(maybeTab) : acc
      }, [])
  )
}

/**
 * @usage Opens current or saved windows and tabs into the current session
 * Side effect with creating window and tabs onto window
 * @returns Promise `CurrentSessionWindow` or `undefined` if failed to create window
 */
export const toCurrent = async <
  T extends
    | PartialBy<SavedSessionWindow, 'id'>
    | PartialBy<CurrentSessionWindow, 'id'>
>(
  win: T
): Promise<CurrentSessionWindow | undefined> => {
  if ('assignedWindowId' in win) {
    return createCurrent({
      ...win,
      tabs: win.tabs.map(createCurrentTab),
    })
  } else {
    const { window, tabs } = await openWindow(win)
    const assignedWindowId = window?.id
    if (window && tabs && isDefined(assignedWindowId)) {
      return createCurrent({
        ...win,
        tabs: mapTabs(tabs, assignedWindowId),
        assignedWindowId,
      })
    }
  }
}

/**
 * @usage Creates `CurrentSessionWindow` from browser `Windows.Window`
 * @note does not produce side effects
 */
export const fromBrowser = (
  win: Windows.Window,
  id?: BrandedUuid<'window'>,
  existingTabs?: CurrentSessionTab[]
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
  const tabs = maybeTabs
    ? mapTabs(maybeTabs, assignedWindowId, existingTabs)
    : []
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
 * @usage Typed union filter
 * Filter has issues with union types
 * https://github.com/microsoft/TypeScript/issues/7294
 * https://github.com/microsoft/TypeScript/issues/36390
 * https://github.com/microsoft/TypeScript/issues/44373
 */
export const filterWindows = (
  windows: SavedSessionWindow[] | CurrentSessionWindow[],
  ids: SavedSessionWindow['id'][] | CurrentSessionWindow['id'][]
) =>
  windows.filter((w) => ids.includes(w.id)) as
    | SavedSessionWindow[]
    | CurrentSessionWindow[]

/**
 * @usage Typed union filter
 */
export const filterTabs = (
  tabs: SavedSessionTab[] | CurrentSessionTab[],
  ids: SavedSessionTab['id'][] | CurrentSessionTab['id'][]
): SavedSessionTab[] | CurrentSessionTab[] =>
  tabs.filter((t) => ids.includes(t.id))

/**
 * @usage focuses `CurrentSessionWindow`
 */
export const focus = async ({ assignedWindowId }: CurrentSessionWindow) => {
  await updateWindow(assignedWindowId, {
    focused: true,
  })
}

/**
 * @usage open current or saved session into the current session
 */
export const open = async (
  win: CurrentSessionWindow | SavedSessionWindow,
  focused?: boolean
) => {
  const { window: newWindow, tabs } = await openWindow({
    ...win,
    focused: focused ?? win.focused,
  })
  // For delayed removal of startup tabs
  const startupTabs = cloneDeep(newWindow.tabs)
  if (!win.tabs.length && startupTabs) {
    const closeStartupTabs = async () => {
      if (startupTabs) {
        const closeTabs = startupTabs.map(async (tab) => {
          if (tab.id) {
            return await closeTab(tab.id)
          }
        })
        await Promise.all(closeTabs)
      }
    }
    return {
      window: newWindow,
      tabs,
      closeStartupTabs,
    }
  }
  return {
    window: newWindow,
    tabs,
  }
}

/**
 * @usage close window in the current session
 */
export const close = async ({ assignedWindowId }: CurrentSessionWindow) => {
  await closeWindow(assignedWindowId)
}

/**
 * @usage remove windows from saved or current session windows
 * Side effect of closing windows if `CurrentSessionWindow[]` is provided
 */
export const removeWindows = async (
  _windows: CurrentSessionWindow[] | SavedSessionWindow[],
  ids: SessionWindow['id'][]
) => {
  const windows = cloneDeep(_windows)
  for (const id of ids) {
    const index = findWindowIndex(windows, id)
    if (isCurrentSessionWindows(windows)) {
      await close(windows[index])
    }
    windows.splice(index, 1)
  }
  return windows
}

/**
 * @usage handles multi-step move side effect for tabs
 * @returns moved tabs `CurrentSessionTab[]`
 */
export const move = async (
  tabs: CurrentSessionTab[],
  index: number,
  pinned: boolean | undefined,
  assignedWindowId: CurrentSessionWindow['assignedWindowId']
): Promise<CurrentSessionTab[]> => {
  const originalTabs = cloneDeep(tabs)
  const _move = async (): Promise<CurrentSessionTab[]> => {
    const _tabs = await moveTabs({
      tabIds: originalTabs.map(({ assignedTabId }) => assignedTabId),
      windowId: assignedWindowId,
      index,
    })
    return _tabs
      .map((t) => fromBrowserTab(t, assignedWindowId))
      .filter(isDefined)
  }

  // when pinning, move to window
  let movedTabs = await _move()
  // update pinned if defined
  if (isDefined(pinned)) {
    movedTabs = await Promise.all(
      originalTabs.map(async (t) => await updateTab(t, { pinned }))
    )
    // toggling pin status moves the tab to after last pin, so moving again is necessary
    movedTabs = await _move()
  }

  return movedTabs
}

/**
 * Handle move side effects for window tabs
 * @usage adds tabs, does require window data to know where to add tab in the current session if applicable
 * @note _SIDE EFFECTS_: opens windows if `CurrentSessionTab[]` are added a `CurrentSessionWindow`
 * @note made sync to be compatible with the DND move which works optimistically
 */
export const addCurrentTabs = (
  win: CurrentSessionWindow | SavedSessionWindow,
  _tabs: CurrentSessionTab[] | SavedSessionTab[],
  index: number,
  pinned?: boolean
) => {
  const tabs = cloneDeep(_tabs)
  if (isCurrentSessionWindow(win)) {
    // move tabs to window in current session
    if (isCurrentSessionTabs(tabs)) {
      // tab is also in current session
      void move(tabs, index, pinned, win.assignedWindowId)
    } else {
      // TODO: create tab doesn't appear to work
      // tab is from saved session
      const updatedTabs = win.tabs.slice() // clone
      updatedTabs.splice(
        index,
        0,
        ...tabs.map((tab) => {
          if (isDefined(pinned)) {
            tab.pinned = pinned
          }
          return createCurrentTab({
            ...tab,
            assignedWindowId: win.assignedWindowId,
            // assigns fake tabId to make this request synchronous
            // window/tab listeners will eventually correct this
            assignedTabId: fallbackTabId(),
          })
        })
      )
    }
  }
}
