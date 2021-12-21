import { Tabs, Windows } from 'webextension-polyfill'

import { PartialBy, Valueof } from 'utils/helpers'

import type { CurrentSession, SavedSession } from './session'
import type { CurrentSessionTab, SavedSessionTab } from './session-tab'
import type { CurrentSessionWindow, SavedSessionWindow } from './session-window'

/**
 * Tab data
 */
export type SessionTabData = {
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
export type CurrentSessionTabData = SessionTabData & {
  /**
   * ID assigned by the browser, only meaningful to a tab that is active
   */
  assignedTabId: number
  assignedWindowId: number
}
export type SavedSessionTabData = SessionTabData
export type SomeSessionTabData = CurrentSessionTabData | SavedSessionTabData

type UpdateSessionTabData = Partial<
  Pick<
    SessionTabData,
    | 'url'
    | 'active'
    | 'discarded'
    | 'pinned'
    | 'muted'
    | 'attention'
    | 'groupId'
  >
>
export type UpdateCurrentSessionTabData = UpdateSessionTabData
export type UpdateSavedSessionTabData = UpdateSessionTabData & {
  title?: string
}

/**
 * Tab class interface with data
 */
export type CurrentSessionTabClass = CurrentSessionTabData & {
  fromTab: (tab: Tabs.Tab) => CurrentSessionTabClass
  open: () => Promise<void>
  close: () => Promise<void>
  update: (values: UpdateCurrentSessionTabData) => Promise<void>
}
export type SavedSessionTabClass = SavedSessionTabData & {
  open: () => Promise<void>
  update: (values: UpdateSavedSessionTabData) => void
}

/**
 * Window data
 */
export type SessionWindowData<T extends SessionTabData = SessionTabData> = {
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

export type CurrentSessionWindowData<
  T extends CurrentSessionTabData = CurrentSessionTabData
> = SessionWindowData<T> & {
  /**
   * ID assigned by the browser, only meaningful to a tab that is active
   */
  assignedWindowId: number
}
export type SavedSessionWindowData<
  T extends SavedSessionTabData = SavedSessionTabData
> = SessionWindowData<T>
export type SomeSessionWindowData =
  | CurrentSessionWindowData
  | SavedSessionWindowData

export type UpdateSessionWindow = Partial<
  Pick<
    SessionWindowData,
    'focused' | 'state' | 'top' | 'left' | 'width' | 'height' | 'tabs' | 'title'
  >
>

type SessionWindowClass = {
  close: () => Promise<void>
}

type OpenWindowReturn = {
  window?: Windows.Window
  tabs?: Tabs.Tab[]
}

/**
 * Window class interface with data
 */
export type CurrentSessionWindowClass = SessionWindowClass &
  CurrentSessionWindowData<CurrentSessionTabClass> & {
    fromWindow: (tab: Windows.Window) => CurrentSessionWindowClass
    /**
     * Returns assigned window ID if successful
     */
    open: () => Promise<OpenWindowReturn>
    removeTab: (id: CurrentSessionTabClass['id']) => Promise<void>
    findTab: (id: CurrentSessionTabClass['id']) => CurrentSessionTabClass
    findTabIndex: (id: CurrentSessionTabClass['id']) => number
    update: (values: UpdateSessionWindow) => Promise<void>
  }
export type SavedSessionWindowClass = SessionWindowClass &
  SavedSessionWindowData<SavedSessionTabClass> & {
    /**
     * Returns assigned window ID if successful
     */
    open: (focused?: boolean) => Promise<OpenWindowReturn>
    removeTab: (id: SavedSessionTabClass['id']) => void
    findTab: (id: SavedSessionTabClass['id']) => SavedSessionTabClass
    findTabIndex: (id: SavedSessionTabClass['id']) => number
    addTabs: (tabs: SavedSessionTab[], index: number) => void
    update: (values: UpdateSessionWindow) => void
  }

/**
 * Session data
 */
export type SessionData<T extends SessionWindowData = SessionWindowData> = {
  id: string
  title?: string
  windows: T[]
  createdDate?: Date
  lastModifiedDate?: Date
}

export type StoredCurrentSessionData = {
  windows: {
    assignedWindowId: CurrentSessionWindow['assignedWindowId']
  }[]
}
export type UpdateCurrentSessionData = Partial<
  Pick<CurrentSessionData<SessionWindowData>, 'title'>
>
export type UpdateSavedSessionData = Partial<
  Pick<SavedSessionData<SessionWindowData>, 'title'>
>

export type CurrentSessionData<
  T extends SessionWindowData = SessionWindowData
> = SessionData<T>
export type SavedSessionData<T extends SessionWindowData = SessionWindowData> =
  SessionData<T> & {
    userSavedDate: Date
  }

/**
 * Session class interface with data
 */
export type CurrentSessionClass = CurrentSessionData<CurrentSessionWindow>
export type SavedSessionClass = SavedSessionData<SavedSessionWindow> & {
  removeWindow: (windowId: SavedSessionWindow['id']) => SavedSessionWindow
}

/**
 * Session manager data, collection of sessions
 */
export type SessionsManagerData<
  C extends SessionData = SessionData,
  T extends SessionData = SessionData
> = {
  current: C
  saved: T[]
  previous: T[]
}

/**
 * Session manager class interface
 */
export type SessionsManagerClass = SessionsManagerData<
  CurrentSession,
  SavedSession
>

export type SessionDataExport = {
  exportedDate: Date
  sessions: SessionData[]
}

/**
 * Session categories, group together in session manager
 */
export const SavedSessionCategory = {
  PREVIOUS: 'previous',
  SAVED: 'saved',
} as const

export type SavedSessionCategoryType = Valueof<typeof SavedSessionCategory>

export type OptionalId<T extends { id: string }> = PartialBy<T, 'id'>

/**
 * Type guard when tabs are current session
 */
export const isCurrentSessionTabs = (
  tabs: CurrentSessionTab[] | SavedSessionTab[]
): tabs is CurrentSessionTab[] => isCurrentSessionTab(tabs[0])

export const isCurrentSessionTab = (
  tab: SomeSessionTabData
): tab is CurrentSessionTab => 'assignedTabId' in tab

export const isCurrentSessionWindow = (
  win: SomeSessionWindowData
): win is CurrentSessionWindow => 'assignedWindowId' in win

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
