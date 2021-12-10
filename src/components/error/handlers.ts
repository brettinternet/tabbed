import { useCallback } from 'react'

import { useToasts } from 'components/toast/store'
import { log } from 'utils/logger'

const useToastError = (logContext?: string) => {
  const { add: addToast } = useToasts()
  return useCallback(
    (error: unknown) => {
      log.error(logContext, error)
      if (error instanceof Error) {
        const { message } = error
        if (message) {
          addToast({ message, variant: 'error' })
        }
      }
    },
    [addToast, logContext]
  )
}

type Unpromisify<T> = T extends Promise<infer U> ? U : T

const useTryCatch = <E = Error>(onError: (err: E) => void = log.error) => {
  return function <C extends (...args: any[]) => Promise<any>, T = unknown>(
    this: T,
    callback: C
  ) {
    const triedCb = async (
      ...args: Parameters<C>
    ): Promise<Unpromisify<ReturnType<C>> | void> => {
      try {
        return await callback.apply(this, args)
      } catch (err) {
        onError(err as E)
      }
    }

    return triedCb
  }
}

export const useTryToastError = (logContext?: string) => {
  const toastError = useToastError(logContext)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(useTryCatch(toastError), [toastError])
}
