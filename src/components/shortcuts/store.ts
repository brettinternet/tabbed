import hotkeys from 'hotkeys-js'
import { noop } from 'lodash'
import { useEffect } from 'react'

import { isPopup } from 'components/app/store'
import { useModal } from 'components/modal/store'
import { log } from 'utils/logger'

const logContext = 'components/shortcuts/store'

// import { useToasts } from 'components/toast/store'
// import { parseNum, isDefined } from 'utils/helpers'
// const handleDelete = async (ev: KeyboardEvent) => {
//   const target = ev.target
//   if (target instanceof HTMLElement) {
//     const sessionId = target.dataset.sessionId
//     if (sessionId) {
//       const sessionType = target.dataset.sessionType
//       const windowId = parseNum(target.dataset.windowId)
//       const tabId = parseNum(target.dataset.tabId)
//       const isCurrent = sessionType !== sessionTypes.CURRENT
//       if (isDefined(tabId) && isDefined(windowId)) {
//         await removeTab(sessionId, windowId, tabId)
//         toast.push({ message: `Tab ${isCurrent ? 'closed' : 'removed'}` })
//       } else if (isDefined(windowId)) {
//         await removeWindow(sessionId, windowId)
//         toast.push({ message: `Window ${isCurrent ? 'closed' : 'removed'}` })
//       } else if (isCurrent) {
//         await deleteSession(sessionId)
//         toast.push({ message: 'Session deleted' })
//       }
//     }
//   }
// }

const ShortcutScopes = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
} as const

type ShortcutEntry = {
  hotkey: string
  display: string
  description?: string
}
type ShortcutType = Record<string, ShortcutEntry>
export const Shortcut: ShortcutType = {
  question: {
    hotkey: 'shift+/',
    display: '?',
    description: 'Toggle shortcuts display',
  },
  escape: {
    hotkey: 'esc',
    display: 'Esc',
    description: 'Close modals or close popup',
  },
  slash: {
    hotkey: '/',
    display: '/',
    description: 'Focus search bar',
  },
  backtick: {
    hotkey: '`',
    display: '`',
    description: 'Toggle settings display',
  },
  delete: {
    hotkey: 'delete',
    display: 'Del',
    description: 'Delete selected sessions, windows and tabs',
  },
  backspace: {
    hotkey: 'backspace',
    display: 'Backspace',
  },
  ctrl_z: {
    hotkey: 'ctrl+z',
    display: 'Ctrl+z',
    description: 'Undo certain actions',
  },
  ctrl_y: {
    hotkey: 'ctrl+y',
    display: 'Ctrl+y',
    description: 'Redo previously undone action',
  },
  i: {
    hotkey: 'i',
    display: 'i',
    description: 'Open import form',
  },
  r: {
    hotkey: 'r',
    display: 'r',
    description: 'Rename saved sessions',
  },
  c: {
    hotkey: 'c',
    display: 'c',
    description: 'Focus current session',
  },
} as const

/**
 * @docs https://github.com/jaywcjlove/hotkeys
 */
export const useShortcuts = (enabled: boolean) => {
  const { modal, ...updateModal } = useModal()

  useEffect(() => {
    log.debug(logContext, 'setupShortcuts', enabled)
    const hotkeyShortcuts = Object.values(Shortcut)
      .map(({ hotkey }) => hotkey)
      .join(',')

    if (enabled) {
      hotkeys(hotkeyShortcuts, ShortcutScopes.ENABLED, (event, handler) => {
        if (enabled) {
          event.preventDefault()
          switch (handler.key) {
            case Shortcut.question.hotkey:
              updateModal.shortcuts.toggle()
              break
            case Shortcut.escape.hotkey:
              if (!!modal) {
                updateModal.off()
              } else if (isPopup) {
                window.close()
              }
              break
            case Shortcut.slash.hotkey: {
              updateModal.off()
              const search = document.getElementById('search')
              search?.focus()
              break
            }
            case Shortcut.backtick.hotkey:
              updateModal.settings.toggle()
              break
            case Shortcut.i.hotkey:
              updateModal.importer.set(true)
              break
            case Shortcut.r.hotkey:
              // void openSessionEdit()
              break
            case Shortcut.backspace.hotkey:
            case Shortcut.delete.hotkey:
              // void handleDelete(event)
              break
            case Shortcut.ctrl_z.hotkey:
              // void undo()
              break
            case Shortcut.ctrl_y.hotkey:
              // void redo()
              break
            case Shortcut.c.hotkey:
              // handleSelectCurrentSession()
              break
          }
        }
      })
    } else {
      hotkeys('', ShortcutScopes.DISABLED, noop)
    }

    // https://github.com/jaywcjlove/hotkeys/issues/90
    hotkeys.setScope(ShortcutScopes[enabled ? 'ENABLED' : 'DISABLED'])
    hotkeys.deleteScope(ShortcutScopes[enabled ? 'DISABLED' : 'ENABLED'])

    log.debug(logContext, `hotkeys scope: '${hotkeys.getScope()}'`)
  }, [enabled])
}
