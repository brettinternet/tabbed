import { isProd } from 'utils/env'
import type { Valueof } from 'utils/helpers'

export const layouts = {
  LIST: 'list',
  GRID: 'grid',
} as const
export type Layout = Valueof<typeof layouts>

export const extensionClickActions = {
  TAB: 'tab',
  POPUP: 'popup',
  SIDEBAR: 'sidebar',
} as const
export type ExtensionClickAction = Valueof<typeof extensionClickActions>

export const themes = {
  DARK: 'dark',
  LIGHT: 'light',
  SYSTEM: 'system',
} as const
export type Theme = Valueof<typeof themes>

export type Settings = {
  layout: Layout
  extensionClickAction: ExtensionClickAction
  showTabCountBadge: boolean
  shortcuts: boolean
  fontSize: number
  popupDimensions: {
    width: number
    height: number
  }
  popoutState: {
    top: number
    left: number
    height: number
    width: number
  }
  theme: Theme
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

export const defaultSettings: Settings = {
  layout: layouts.LIST,
  extensionClickAction: extensionClickActions.POPUP,
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
  theme: themes.LIGHT,
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
