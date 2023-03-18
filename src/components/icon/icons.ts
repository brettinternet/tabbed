import {
  mdiMagnify,
  mdiContentSaveOutline,
  mdiCheck,
  mdiCog,
  mdiDotsVertical,
  mdiClose,
  mdiInformationOutline,
  mdiAlertOutline,
  mdiDeleteOutline,
  mdiMenuOpen,
  mdiFullscreen,
  mdiWindowMinimize,
  mdiOpenInApp,
  mdiApplicationOutline,
  mdiTab,
  mdiTabUnselected,
  mdiPinOutline,
  mdiVolumeVariantOff,
  mdiBellRingOutline,
  mdiTabMinus,
  mdiKeyboard,
  mdiIncognito,
  mdiHelp,
  mdiChevronDown,
  mdiCircleSmall,
} from '@mdi/js'

/**
 * Map friendly name
 * https://pictogrammers.com/library/mdi/
 */
export const IconName = {
  SAVE: mdiContentSaveOutline,
  SEARCH: mdiMagnify,
  CHECK: mdiCheck,
  SETTINGS: mdiCog, // options
  MORE: mdiDotsVertical, // ellipsis menu
  CLOSE: mdiClose,
  INFO: mdiInformationOutline, // message notice
  WARNING: mdiAlertOutline, // message error
  DELETE: mdiDeleteOutline,
  MENU_OPEN: mdiMenuOpen, // session sidebar open
  FULLSCREEN: mdiFullscreen, // window state
  MINIMIZE: mdiWindowMinimize, // window state
  WINDOW_OPEN: mdiOpenInApp, // open window
  WINDOW: mdiApplicationOutline,
  WINDOW_REMOVE: mdiClose, // close window/tab
  TAB: mdiTab,
  TAB_SELECT: mdiTabUnselected,
  PIN: mdiPinOutline, // tab pinned
  MUTE: mdiVolumeVariantOff, // tab muted
  ALERT: mdiBellRingOutline, // tab attention
  TAB_DISCARD: mdiTabMinus, // discard tab - free memory
  KEYBOARD: mdiKeyboard, // shortcuts
  INCOGNITO: mdiIncognito, // incognito/private browsing
  HELP: mdiHelp, // FAQ and resources
  EXPAND: mdiChevronDown, // dropdown down caret
  INDICATOR: mdiCircleSmall, // active tab indicator
} as const
