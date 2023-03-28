import { noop } from 'lodash'
import { useHotkeys } from 'react-hotkeys-hook'

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

type ShortcutEntry = {
  hotkey: string
  eventKey: string
  display: string
  description?: string
}

type ShortcutType = Record<string, ShortcutEntry>

export const Shortcut: ShortcutType = {
  question: {
    hotkey: 'shift+?',
    eventKey: '?',
    display: '?',
    description: 'Toggle shortcuts display',
  },
  escape: {
    hotkey: 'esc',
    eventKey: 'Escape',
    display: 'Esc',
    description: 'Close modals or close popup',
  },
  backtick: {
    hotkey: '`',
    eventKey: '`',
    display: '`',
    description: 'Toggle settings display',
  },
  // slash: {
  //   hotkey: '/',
  //   display: '/',
  //   description: 'Focus search bar',
  // },
  // delete: {
  //   hotkey: 'delete',
  //   display: 'Del',
  //   description: 'Delete selected sessions, windows and tabs',
  // },
  // backspace: {
  //   hotkey: 'backspace',
  //   display: 'Backspace',
  // },
  // ctrl_z: {
  //   hotkey: 'ctrl+z',
  //   display: 'Ctrl+z',
  //   description: 'Undo certain actions',
  // },
  // ctrl_y: {
  //   hotkey: 'ctrl+y',
  //   display: 'Ctrl+y',
  //   description: 'Redo previously undone action',
  // },
  // i: {
  //   hotkey: 'i',
  //   display: 'i',
  //   description: 'Open import form',
  // },
  // r: {
  //   hotkey: 'r',
  //   display: 'r',
  //   description: 'Rename saved sessions',
  // },
  // c: {
  //   hotkey: 'c',
  //   display: 'c',
  //   description: 'Focus current session',
  // },
} as const

const hotkeyShortcuts = Object.values(Shortcut)
  .map(({ hotkey }) => hotkey)
  .join(',')

/**
 * @docs https://github.com/jaywcjlove/hotkeys
 */
export const useShortcuts = (enabled: boolean) => {
  const { modal, ...updateModal } = useModal()
  useHotkeys(
    hotkeyShortcuts,
    (event, _handler) => {
      switch (event.key) {
        case Shortcut.question.eventKey:
          updateModal.help.toggle()
          break
        case Shortcut.escape.eventKey:
          if (!!modal) {
            updateModal.off()
          } else if (isPopup) {
            window.close()
          }
          break
        case Shortcut.backtick.eventKey:
          updateModal.settings.toggle()
          break
        // case Shortcut.slash.eventKey: {
        //   updateModal.off()
        //   const search = document.getElementById('search')
        //   search?.focus()
        //   break
        // }
        // case Shortcut.i.eventKey:
        //   updateModal.importer.set(true)
        //   break
        // case Shortcut.r.eventKey:
        //   // void openSessionEdit()
        //   break
        // case Shortcut.backspace.eventKey:
        // case Shortcut.delete.eventKey:
        //   // void handleDelete(event)
        //   break
        // case Shortcut.ctrl_z.eventKey:
        //   // void undo()
        //   break
        // case Shortcut.ctrl_y.eventKey:
        //   // void redo()
        //   break
        // case Shortcut.c.eventKey:
        //   // handleSelectCurrentSession()
        //   break
      }
    },
    { enabled, preventDefault: true },
    [modal, updateModal]
  )
}
