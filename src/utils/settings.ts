// Types shared between background and client
import { assign } from 'lodash'

import { Valueof } from 'utils/helpers'
import { LocalStorage } from 'utils/storage'

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

export type Settings = {
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

export const defaultSettings: Settings = {
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
  debugMode: !IS_PROD,
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

/**
 * Settings are potentially partial between upgrades and new features
 */
export const loadSettings = async (): Promise<Settings> => {
  const settings = await LocalStorage.get<Partial<Settings>>(
    LocalStorage.key.SETTINGS
  )
  return assign({}, defaultSettings, settings)
}

const saveSettings = async (settings: Settings) => {
  await LocalStorage.set(LocalStorage.key.SETTINGS, settings)
}

export const updateSettings = async (someSettings: Partial<Settings>) => {
  const loaded = await loadSettings()
  const settings: Settings = assign({}, loaded, someSettings)
  await saveSettings(settings)
  return settings
}
