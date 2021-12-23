import { atom, useAtom } from 'jotai'
import { useCallback } from 'react'

import { useToasts } from 'components/toast/store'
import { isConnectionFailed } from 'utils/error'
import { log } from 'utils/logger'

const useToastBackgroundError = <E extends { message: string }>(
  disconnectedToastId: string | undefined,
  setDisconnectedToastId: React.Dispatch<
    React.SetStateAction<string | undefined>
  >,
  logContext?: string
) => {
  const { add: addToast } = useToasts()
  return useCallback(
    (error: E) => {
      const { message } = error
      if (isConnectionFailed(error) && !disconnectedToastId) {
        log.warn(logContext, error)
        const id = addToast({
          message: 'Pending browser connection',
          variant: 'warn',
          autoDismiss: false,
        })
        setDisconnectedToastId(id)
      } else {
        log.error(logContext, error)
        addToast({ message, variant: 'error' })
      }
    },
    [addToast, logContext, disconnectedToastId, setDisconnectedToastId]
  )
}

type Unpromisify<T> = T extends Promise<infer U> ? U : T

const useTryCatch = <E = Error>(
  onError: (err: E) => void = log.error,
  onSuccess: () => void
) => {
  return function <C extends (...args: any[]) => any, T = unknown>(
    this: T,
    callback: C
  ) {
    const triedCb = async (
      ...args: Parameters<C>
    ): Promise<Unpromisify<ReturnType<C>> | void> => {
      try {
        const r = await callback.apply(this, args)
        onSuccess()
        return r
      } catch (err) {
        onError(err as E)
      }
    }

    return triedCb
  }
}

const disconnectedAtom = atom<string | undefined>(undefined)

/**
 * Returns function that tries callback, and toasts error on failure
 * If error is failed connection then toast warning that clears on the next success
 */
export const useTryToastError = (logContext?: string) => {
  const [disconnectedToastId, setDisconnectedToastId] =
    useAtom(disconnectedAtom)
  const toastError = useToastBackgroundError(
    disconnectedToastId,
    setDisconnectedToastId,
    logContext
  )
  const clearToast = useCallback(() => {
    setDisconnectedToastId(undefined)
  }, [setDisconnectedToastId])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(useTryCatch(toastError, clearToast), [toastError])
}
