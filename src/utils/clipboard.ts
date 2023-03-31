import copy from 'copy-to-clipboard'
import { useState, useCallback, useEffect } from 'react'

type Format = NonNullable<Parameters<typeof copy>[1]>['format']

type UseClipboardOptions = {
  timeout?: number
  format?: Format
}

/**
 * @source https://github.com/chakra-ui/chakra-ui/blob/6e795a9b8b2ff64b4d93a90a3c627e8474b93305/packages/legacy/hooks/src/use-clipboard.ts
 */
export const useClipboard = (
  defaultValue?: string,
  optionsOrTimeout: number | UseClipboardOptions = {}
) => {
  const [hasCopied, setHasCopied] = useState(false)
  const [value, setValue] = useState<string | undefined>(defaultValue)

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const { timeout = 1500, ...copyOptions } =
    typeof optionsOrTimeout === 'number'
      ? { timeout: optionsOrTimeout }
      : optionsOrTimeout

  const onCopy = useCallback(() => {
    if (value) {
      const didCopy = copy(value, copyOptions)
      setHasCopied(didCopy)
    }
  }, [value, copyOptions])

  useEffect(() => {
    let timeoutId: number | null = null

    if (hasCopied) {
      timeoutId = window.setTimeout(() => {
        setHasCopied(false)
      }, timeout)
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [timeout, hasCopied])

  return {
    value,
    setValue,
    onCopy,
    hasCopied,
  }
}
