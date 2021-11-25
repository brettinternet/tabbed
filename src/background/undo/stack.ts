import { log } from 'utils/logger'

const logContext = 'background/undo/stack'

const MAX_STACK = 10

type ActionGroup = {
  undo: () => void | Promise<void>
  redo: () => void | Promise<void>
  data: unknown
}

type PushArg<T extends Record<string, unknown> = Record<string, unknown>> = {
  undo: () => void | Promise<void>
  redo: () => void | Promise<void>
  data: T
}

class Undo {
  private stack: ActionGroup[] = []
  private current = -1

  constructor() {
    log.debug('Initializing undo stack')
  }

  push = <T extends Record<string, unknown>>(actionGroup: PushArg<T>) => {
    this.current++
    this.stack.splice(this.current) // clear stack ahead of current
    this.stack.push(actionGroup)
    if (this.stack.length > MAX_STACK) {
      this.stack.splice(0, this.stack.length - MAX_STACK)
      this.current = this.stack.length - 1
    }
  }

  undo = async () => {
    log.debug(logContext, 'undo() - start', this.stack, this.current)

    if (this.current > -1) {
      const action = this.stack[this.current]
      log.debug(logContext, 'action:', action)
      if (action) {
        try {
          await action.undo.call(action)
          this.current--
        } catch (err) {
          log.error(logContext, err)
          this.removeCurrent() // remove entry in order to recover from error
          this.current--
          throw err // elevate error to caller
        }
      } else {
        log.error(
          logContext,
          'Action not found, current index out of sync with stack'
        )
        this.current = this.stack.length - 1
      }
    } else {
      log.warn('No actions to undo')
    }

    const lower = -1
    if (this.current < lower) {
      this.current = lower
    }
    log.debug(logContext, 'undo() - end', this.stack, this.current)
  }

  redo = async () => {
    log.debug(logContext, 'redo() - start', this.stack, this.current)

    const action = this.stack[this.current + 1]
    log.debug(logContext, 'action:', action)
    if (action) {
      try {
        await action.redo.call(action)
        this.current++
      } catch (err) {
        log.error(logContext, err)
        this.removeCurrent() // remove entry in order to recover from error
        if (this.current > this.stack.length - 1) {
          this.current = this.stack.length - 1
        } else {
          this.current++
        }
        throw err // elevate error to caller
      }
    } else {
      log.warn('No actions to redo')
    }

    const upper = this.stack.length - 1
    if (this.current > upper) {
      this.current = upper
    }
    log.debug(logContext, 'redo() - end', this.stack, this.current)
  }

  canUndo = () => this.current > -1
  canRedo = () => this.current !== this.stack.length - 1

  removeCurrent = () => {
    this.stack.splice(this.current, 1)
  }
}

export const undoStack = new Undo()
