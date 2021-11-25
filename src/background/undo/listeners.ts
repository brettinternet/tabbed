import browser from 'webextension-polyfill'

import type {
  UndoMessage,
  RedoMessage,
  CanUndoRedoMessage,
} from 'utils/messages'
import {
  MESSAGE_TYPE_UNDO,
  MESSAGE_TYPE_REDO,
  MESSAGE_TYPE_CAN_UNDO_REDO,
} from 'utils/messages'

import { undoStack } from './stack'

export const setupUndoListeners = () => {
  browser.runtime.onMessage.addListener((message: UndoMessage) => {
    if (message.type === MESSAGE_TYPE_UNDO) {
      return undoStack.undo()
    }
  })

  browser.runtime.onMessage.addListener((message: RedoMessage) => {
    if (message.type === MESSAGE_TYPE_REDO) {
      return undoStack.redo()
    }
  })

  browser.runtime.onMessage.addListener((message: CanUndoRedoMessage) => {
    if (message.type === MESSAGE_TYPE_CAN_UNDO_REDO) {
      return Promise.resolve({
        undo: undoStack.canUndo(),
        redo: undoStack.canRedo(),
      })
    }
  })
}
