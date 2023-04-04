import { useHotkeys } from 'react-hotkeys-hook'

import { isMac } from 'components/app/store'
import { useAllowFocusRing } from 'components/focus'
import { useModal } from 'components/modal/store'
import { focusFirstDraggable } from 'components/session/focus-draggable'
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

const FocusShortcuts: ShortcutsMap = {
  arrowUp: {
    hotkey: 'up',
    code: 'ArrowUp',
  },
  arrowRight: {
    hotkey: 'right',
    code: 'ArrowRight',
  },
  arrowDown: {
    hotkey: 'down',
    code: 'ArrowDown',
  },
  arrowLeft: {
    hotkey: 'left',
    code: 'ArrowLeft',
  },
  tab: {
    hotkey: 'tab',
    code: 'Tab',
  },
}

export const useFocusShortcuts = () => {
  const { modal } = useModal()
  const [, setShowFocusRing] = useAllowFocusRing()
  useHotkeys(
    getHotkeys(FocusShortcuts),
    (event) => {
      switch (event.code) {
        case FocusShortcuts.tab.code:
        case FocusShortcuts.arrowUp.code:
        case FocusShortcuts.arrowRight.code:
        case FocusShortcuts.arrowDown.code:
        case FocusShortcuts.arrowLeft.code:
          if (!modal && document.activeElement === document.body) {
            event.preventDefault()
            focusFirstDraggable()
          }
          setShowFocusRing(true)
          break
      }
    },
    [modal, setShowFocusRing]
  )
}
