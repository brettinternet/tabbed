import { useCallback, useEffect, useState } from 'react'

const mediaQueries = [
  '', // base
  '(min-width: 320px)', // xxs
  '(min-width: 481px)', // xs
  '(min-width: 640px)', // sm
  '(min-width: 768px)', // md
  '(min-width: 1024px)', // lg
  '(min-width: 1280px)', // xl
  '(min-width: 1536px)', // 2xl
]

// reverse so first matching can be found on mobile first
const mediaQueryLists = mediaQueries.map((q) => window.matchMedia(q)).reverse()

/**
 * JS breakpoints which match Tailwind CSS defined breakpoints
 * Define each value in mobile-first fashion to match `mediaQueries` array
 */
export const useMedia = <T>(values: T[]) => {
  const getValue = useCallback((): T => {
    const index = mediaQueryLists.findIndex((mql) => mql.matches)
    // index of reversed must be inverted
    return (
      values[mediaQueryLists.length - index - 1] || values[values.length - 1]
    )
  }, [values])

  const [value, setValue] = useState<T>(getValue)

  useEffect(() => {
    const handler = () => {
      setValue(getValue)
    }
    mediaQueryLists.forEach((mql) => {
      mql.addEventListener('change', handler)
    })
    return () =>
      mediaQueryLists.forEach((mql) =>
        mql.removeEventListener('change', handler)
      )
  }, [getValue])

  return value
}
