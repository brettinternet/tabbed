export type Valueof<T> = T[keyof T]

/**
 * Determine if a value is defined
 */
export const isDefined = <T>(arg: T | undefined): arg is T =>
  typeof arg !== 'undefined'

/**
 * @usage typed version of Object.keys
 * https://stackoverflow.com/a/59459000
 */
export const getKeys = Object.keys as <T extends Record<string, unknown>>(
  obj: T
) => Array<keyof T>

/**
 * Returns value if exists in object
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
 * Parse value that may be undefined - good for `target.dataset.value`
 */
export const parseNum = (str: string | undefined) =>
  str ? parseInt(str, 10) : undefined

export const findDuplicates = (arr: unknown[]) => {
  const sorted = arr.slice().sort()
  const duplicates = []
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] === sorted[i]) {
      duplicates.push(sorted[i])
    }
  }
  return duplicates
}

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
 * Reorder item in list with splice
 * @source https://github.com/lodash/lodash/issues/1701
 * https://stackoverflow.com/a/5306832
 */
export const reorder = <T>(
  list: T[],
  startIndex: number,
  endIndex: number,
  mutate?: (target: T) => T
): T[] => {
  const copy = list.slice()
  let [target] = copy.splice(startIndex, 1)
  if (mutate) {
    target = mutate(target)
  }
  copy.splice(endIndex, 0, target)
  return copy
}

/**
 * Reorder item in list with splice
 */
export const spliceSeparate = <T>(
  from: T[],
  to: T[],
  startIndex: number,
  endIndex: number,
  mutate?: (target: T) => T
): [T[], T[]] => {
  const fromCopy = from.slice()
  const toCopy = to.slice()
  let [target] = fromCopy.splice(startIndex, 1)
  if (mutate) {
    target = mutate(target)
  }
  toCopy.splice(endIndex, 0, target)
  return [fromCopy, toCopy]
}

export const generateFallbackId = () => new Date().valueOf()

/**
 * Downloads data as JSON by creating a url blog, adding an anchor to
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
