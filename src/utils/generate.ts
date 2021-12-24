import { v4 as uuidv4 } from 'uuid'
import browser from 'webextension-polyfill'

import { SessionTab } from 'utils/session-tab'
import { SessionWindow } from 'utils/session-window'

import { Valueof } from './helpers'

/**
 * const map of different UUID brands
 */
export const Uuid = {
  TAB: 'tab',
  WINDOW: 'window',
  SESSION: 'session',
} as const
export type UuidType = Valueof<typeof Uuid>

/**
 * @note Branded type to increase type safety and prevent abuse
 * https://gist.github.com/brettinternet/b32a63f057eb58f1a2de3765141097a7
 */
export type BrandedUuid<T extends UuidType> = {
  __uuid: T
}

/**
 * @usage Generates UUID with a entity prefix
 * @returns prefix + "-" + UUID with a branded type
 */
export const createId = <T extends UuidType>(prefix: T): BrandedUuid<T> =>
  `${prefix}-${uuidv4()}` as unknown as BrandedUuid<T>

/**
 * @usage Cast a value to the UUID brand type
 * @returns the same value with a branded type
 */
export const brandUuid = <T extends UuidType>(str: string) =>
  str as unknown as BrandedUuid<T>

/**
 * @usage Cast a branded UUID back to a string
 * @returns the same value with type string
 */
export const unbrandUuid = <T extends UuidType>(uuid: BrandedUuid<T>): string =>
  uuid as unknown as string

/**
 * @usage Unlikely to be used, but since browser windows and tabs are optional,
 * this is a fallback more for typing than for an actual value
 */
export const fallbackTabId = (): number => new Date().valueOf()
export const fallbackWindowId = (): number => browser.windows.WINDOW_ID_CURRENT

const getSortedOccurrences = (arr: string[]) => {
  const hash = arr.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sorted = Object.keys(hash).sort((a, b) => {
    return hash[b] - hash[a]
  })

  return sorted
}

const SHOW_TITLE_COUNT = 3
const formatTopTitlesAndMore = (titles: string[]) => {
  const sorted = getSortedOccurrences(titles)
  const top = sorted.slice(0, SHOW_TITLE_COUNT)
  const more = sorted.length - top.length
  let str: string | undefined
  if (top.length > 1) {
    str = top.join(', ')
  } else {
    str = top[0]
  }
  if (more > 0) {
    str = str.concat(` & ${more} more`)
  }

  return str
}

const titleFromProperties = (
  hostname: string,
  protocol: string,
  title: string | undefined
) => {
  // custom URL protocols
  if (protocol.includes('chrome-extension')) {
    return title // chrome extension pages
  }
  if (protocol.includes('about')) {
    return title // Firefox config pages
  }
  // common colloquialisms
  if (hostname.includes('mail.google')) {
    return 'gmail'
  }

  // common overrides
  if (hostname.includes('github.io')) {
    return hostname.split('.')[0]
  }
}

const parseTitle = (tab: SessionTab) => {
  const urlObj = new URL(tab.url)
  const protocol = urlObj.protocol
  let hostname = urlObj.hostname
  let tabTitle: string
  const specialTitle = titleFromProperties(hostname, protocol, tab.title)
  if (specialTitle) {
    tabTitle = specialTitle
  } else {
    hostname = hostname.replace('www.', '')
    const reg = new RegExp(/(\.[^.]{0,2})(\.[^.]{0,2})(\.*$)|(\.[^.]*)(\.*$)/)
    tabTitle = hostname.replace(reg, '').split('.').pop() || ''
  }
  if (tabTitle.length > MAX_TITLE_LENTH) {
    tabTitle = (tab.title || tabTitle)?.trim()
    while (tabTitle.length > MAX_TITLE_LENTH && tabTitle.includes(' ')) {
      const temp: string[] = tabTitle.split(' ')
      temp.pop()
      tabTitle = temp.join(' ')
    }
  }
  return tabTitle
}

const getTitlesFromTabs = (tabs: SessionTab[]) => {
  return tabs.reduce((acc, tab) => {
    const tabTitle = parseTitle(tab)
    if (tabTitle) {
      return acc.concat(tabTitle)
    }
    return acc
  }, [] as string[])
}

const MAX_TITLE_LENTH = 15
export const generateWindowTitle = (tabs: SessionTab[]) => {
  const titles = getTitlesFromTabs(tabs)
  return formatTopTitlesAndMore(titles)
}

export const generateSessionTitle = (windows: SessionWindow[]) => {
  const titles = windows.reduce((acc, { tabs }) => {
    return acc.concat(getTitlesFromTabs(tabs))
  }, [] as string[])
  return formatTopTitlesAndMore(titles)
}
