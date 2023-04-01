import browser from 'webextension-polyfill'

import { isChrome } from 'utils/env'

export const openOptions = async () => {
  if (isChrome) {
    await browser.tabs.create({
      url: `chrome://extensions/?id=${browser.runtime.id}`,
    })
  }
}
