/**
 * @usage defines a type of an object's values
 */
export type Valueof<T> = T[keyof T]

/**
 * @usage changes a required field to an optional one
 * @source https://stackoverflow.com/a/54178819
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }
/**
 * @usage defines mutually exclusive relationship between types
 * @source https://stackoverflow.com/a/53229567
 */
export type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U

/**
 * @usage Determine if a value is defined
 */
export const isDefined = <T>(arg: T | undefined): arg is T =>
  typeof arg !== 'undefined'

/**
 * @usage Determine if a value is undefined, null or empty string
 */
export const isEmpty = (arg: string | number | null | undefined): boolean =>
  typeof arg === 'undefined' || arg === null || arg === ''

/**
 * @usage typed version of Object.keys
 * https://stackoverflow.com/a/59459000
 */
export const getKeys = Object.keys as <T extends Record<string, unknown>>(
  obj: T
) => Array<keyof T>

/**
 * @usage Returns value if exists in object
 */
export const objValue = <T extends Record<string, unknown>>(
  value: unknown,
  obj: T
): Valueof<T> | undefined => {
  if (Object.values(obj).includes(value)) {
    return value as T[keyof T]
  }
}

/**
 * @usage Parse value that may be undefined - good for `target.dataset.value`
 */
export const parseNum = (str: string | undefined) =>
  str ? parseInt(str, 10) : undefined

/**
 * @source https://stackoverflow.com/a/2901298
 */
export const numberWithCommas = (x: number) =>
  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export const insert = <T>(list: T[], item: T, index: number) => {
  if (index > -1 && index < list.length) {
    list.splice(index, 0, item)
  } else {
    throw Error('insert index exceeds list boundaries')
  }
  return list
}

/**
 * @usage Reorder item in list with splice
 * @source https://github.com/lodash/lodash/issues/1701
 * https://stackoverflow.com/a/5306832
 * @returns a new array
 */
export const reorder = <T>(
  _list: T[],
  fromIndex: number,
  toIndex: number
): T[] => {
  const list = _list.slice() // clone
  let [target] = list.splice(fromIndex, 1)
  list.splice(toIndex, 0, target)
  return list
}

/**
 * @usage Reorder item in list with splice
 * @returns two new arrays nested in a tuple
 */
export const spliceSeparate = <T>(
  _from: T[],
  _to: T[],
  fromIndex: number,
  toIndex: number
): [T[], T[]] => {
  const from = _from.slice() // clone
  const to = _to.slice() // clone
  let [target] = from.splice(fromIndex, 1)
  to.splice(toIndex, 0, target)
  return [from, to]
}

/**
 * @usage Downloads data as JSON by creating a url blog, adding an anchor to
 * the DOM and initiliazing the download
 */
export const downloadJson = (filename: string, data: unknown) => {
  const url = window.URL.createObjectURL(
    new Blob([JSON.stringify(data, null, '\t')], {
      type: 'application/json',
    })
  )

  // https://stackoverflow.com/a/19328891
  const anchor = document.createElement('a')
  anchor.style.display = 'none'
  anchor.setAttribute('href', url)
  anchor.setAttribute('download', filename)
  document.body.append(anchor)
  anchor.click()
  window.URL.revokeObjectURL(url)
  anchor.remove()
}

export const tryParse = (str: unknown) => {
  try {
    return JSON.parse(str as string)
  } catch {
    return str
  }
}

export const stopPropagation = (
  event: { stopPropagation?: () => void } = {}
) => {
  event.stopPropagation?.()
}

/**
 * Tween function
 */
export const easeOutCirc = (
  i: number,
  start: number,
  end: number,
  steps: number
): number => {
  const distance = end - start
  return distance * Math.sqrt(1 - (i = i / steps - 1) * i) + start
}
