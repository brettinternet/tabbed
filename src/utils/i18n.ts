import en from 'date-fns/locale/en-US'
import browser from 'webextension-polyfill'

import { isProd } from 'utils/env'
import { log } from 'utils/logger'

const logContext = 'utils/i18n'

export type Locales = 'en'

export const getDateLocale = (locale: Locales | string) => {
  if (locale.includes('en')) {
    return en
  }
}

export const locale = browser.i18n.getUILanguage()

/**
 * Up to 9 substitutions supported in Chrome
 * @docs https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getMessage
 */
export const getMessage = (
  messageName: string,
  defaultMessage: string = messageName,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  substitutions?: any
) => {
  const message = browser.i18n.getMessage(messageName, substitutions)
  if (!isProd && !message) {
    log.warn(
      logContext,
      'getMessage()',
      'Missing i18n message name:',
      messageName
    )
  }
  return message || defaultMessage
}
