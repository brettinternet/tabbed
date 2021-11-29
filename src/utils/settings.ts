// Types shared between background and client
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

export type SettingsOptions = {
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
