import { atom, useAtom } from 'jotai'
import { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { MessageVariant, MessageVariantType } from 'components/message'
import { log } from 'utils/logger'

const logContext = 'components/toast/store'

export type ToastOptions = {
  message: React.ReactNode
  variant?: MessageVariantType
  autoDismiss?: boolean
  duration?: number
  title?: string
  onDismiss?: (id: string) => void
}

export type Toast = ToastOptions & {
  id: string
  duration: number
  autoDismiss: boolean
}

const toastsAtom = atom<Toast[]>([])

/**
 * TODO: add pause/play timer
 */
export const useToasts = () => {
  const [_toasts, setToasts] = useAtom(toastsAtom)

  const add = (toastOptions: ToastOptions) => {
    const id = uuidv4()
    const toast = {
      autoDismiss: true,
      duration: 4000,
      variant: MessageVariant.NONE,
      ...toastOptions,
      id,
    }
    log.debug(logContext, toast)
    setToasts((toasts) => [...toasts, toast])
    return id
  }

  const update = (id: Toast['id'], toastOptions: ToastOptions) => {
    setToasts((toasts) => {
      const index = toasts.findIndex((t) => t.id === id)
      if (index > -1) {
        toasts[index] = { ...toasts[index], ...toastOptions }
      } else {
        log.error(logContext, 'update()', `Unable to find toast ID '${id}'`)
      }
      return toasts.slice()
    })
  }

  const remove = (id: Toast['id']) => {
    setToasts((toasts) => {
      const index = toasts.findIndex((t) => t.id === id)
      if (index > -1) {
        const [toast] = toasts.splice(index, 1)
        if (toast.onDismiss) {
          toast.onDismiss(toast.id)
        }
      } else {
        log.error(logContext, 'remove()', `Unable to find toast ID '${id}'`)
      }
      return toasts.slice()
    })
  }

  return {
    toasts: _toasts,
    add: useCallback(add, [setToasts]),
    update: useCallback(update, [setToasts]),
    remove: useCallback(remove, [setToasts]),
    removeAll: useCallback(() => {
      setToasts([])
    }, [setToasts]),
  }
}
