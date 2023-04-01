import { useHotkeys } from 'react-hotkeys-hook'

import { isMac } from 'components/app/store'
import { isDefined } from 'utils/helpers'

import { getHotkeys, ShortcutsMap } from './global'

const windowShortcuts = [...new Array(9)].reduce<ShortcutsMap>(
  (acc, _, index) => {
    const digit = index + 1
    return {
      ...acc,
      [digit]: {
        hotkey: `alt+${digit}`,
        code: `Digit${digit}`,
        display: `${isMac ? 'Option' : 'Alt'}+${digit}`,
        description: `Focus ${digit === 9 ? 'last window' : `window ${digit}`}`,
      },
    }
  },
  {}
)

export const Shortcuts: ShortcutsMap = {
  ...windowShortcuts,
} as const

/**
 * Shortcuts for a window section
 */
export const useWindowShortcuts = (
  order: number | undefined,
  handleOpen: () => void
) => {
  useHotkeys(
    getHotkeys(windowShortcuts),
    (event) => {
      if (
        isDefined(order) &&
        event.altKey &&
        event.code === windowShortcuts[order].code
      ) {
        handleOpen()
      }
    },
    { enabled: isDefined(order), preventDefault: true },
    [order, handleOpen]
  )
}
