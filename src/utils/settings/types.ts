// Types shared between background and client
import { isProd } from 'utils/env'
import { Valueof } from 'utils/helpers'

export const Layouts = {
  LIST: 'list',
  GRID: 'grid',
} as const
export type LayoutType = Valueof<typeof Layouts>

export const ExtensionClickActions = {
  TAB: 'tab',
  POPUP: 'popup',
  SIDEBAR: 'sidebar',
} as const
export type ExtensionClickActionType = Valueof<typeof ExtensionClickActions>

export const Themes = {
  DARK: 'dark',
  LIGHT: 'light',
  SYSTEM: 'system',
} as const
export type ThemeType = Valueof<typeof Themes>

type WindowPosition = {
  top: number
  left: number
  height: number
  width: number
}

export type SettingsData = {
  layout: LayoutType
  extensionClickAction: ExtensionClickActionType
  showTabCountBadge: boolean
  shortcuts: boolean
  fontSize: number
  popupDimensions: {
    width: number
    height: number
  }
  popoutState: WindowPosition
  theme: ThemeType
  debugMode: boolean
  saveClosedWindows: boolean
  sortFocusedWindowFirst: boolean
  saveIncognito: boolean
  excludedUrls: {
    raw: string | undefined
    parsed: string[]
    error: string | undefined
  }
}

export const defaultSettings: SettingsData = {
  layout: Layouts.LIST,
  extensionClickAction: ExtensionClickActions.POPUP,
  showTabCountBadge: true,
  shortcuts: true,
  fontSize: 16,
  popupDimensions: {
    width: 600,
    height: 600,
  },
  popoutState: {
    top: 0,
    left: 0,
    height: 600,
    width: 600,
  },
  theme: Themes.LIGHT,
  debugMode: !isProd,
  saveClosedWindows: false,
  sortFocusedWindowFirst: false,
  saveIncognito: false,
  excludedUrls: {
    raw: `chrome://bookmarks
chrome-extension://*`,
    parsed: ['chrome://bookmarks', 'chrome-extension://*'],
    error: undefined,
  },
}
