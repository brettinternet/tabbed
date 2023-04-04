// import { noop } from 'lodash'
import { useHotkeys } from 'react-hotkeys-hook'

import { isPopup } from 'components/app/store'
import { focusClassIndicator } from 'components/focus'
import { useModal } from 'components/modal/store'
import { XOR } from 'utils/helpers'

// import { log } from 'utils/logger'

// const logContext = 'components/global/store'

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
  code: string
} & XOR<{}, { display: string; description: string }>

export type ShortcutsMap = Record<string, ShortcutEntry>

export const Shortcut: ShortcutsMap = {
  question: {
    hotkey: 'shift+?',
    code: 'Slash',
    display: '?',
    description: 'Toggle shortcuts display',
  },
  escape: {
    hotkey: 'esc',
    code: 'Escape',
    display: 'Esc',
    description: 'Close modals or close popup',
  },
  backtick: {
    hotkey: '`',
    code: 'Backquote',
    display: 'Backquote',
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

export const getHotkeys = (shortcuts: ShortcutsMap) =>
  Object.values(shortcuts)
    .map(({ hotkey }) => hotkey)
    .join(',')

/**
 * @docs https://github.com/jaywcjlove/hotkeys
 * https://github.com/JohannesKlauss/react-hotkeys-hook
 */
export const useShortcuts = (enabled: boolean) => {
  const { modal, ...updateModal } = useModal()
  useHotkeys(
    getHotkeys(Shortcut),
    (event) => {
      switch (event.code) {
        case Shortcut.question.code:
          if (event.shiftKey) {
            updateModal.help.toggle()
          }
          break
        case Shortcut.escape.code:
          if (!!modal) {
            updateModal.off()
          } else if (
            document.activeElement instanceof HTMLElement &&
            document.activeElement.classList.contains(focusClassIndicator)
          ) {
            document.activeElement.blur()
          } else if (isPopup) {
            window.close()
          }
          break
        case Shortcut.backtick.code:
          updateModal.settings.toggle()
          break
        // case Shortcut.slash.code: {
        //   updateModal.off()
        //   const search = document.getElementById('search')
        //   search?.focus()
        //   break
        // }
        // case Shortcut.i.code:
        //   updateModal.importer.set(true)
        //   break
        // case Shortcut.r.code:
        //   // void openSessionEdit()
        //   break
        // case Shortcut.backspace.code:
        // case Shortcut.delete.code:
        //   // void handleDelete(event)
        //   break
        // case Shortcut.ctrl_z.code:
        //   // void undo()
        //   break
        // case Shortcut.ctrl_y.code:
        //   // void redo()
        //   break
        // case Shortcut.c.code:
        //   // handleSelectCurrentSession()
        //   break
      }
    },
    { enabled, preventDefault: true },
    [modal, updateModal]
  )
}
