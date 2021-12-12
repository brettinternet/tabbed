import browser from 'webextension-polyfill'

import { browserRuntime, browsers } from 'utils/env'

export const openOptions = async () => {
  if (browserRuntime === browsers.CHROMIUM) {
    await browser.tabs.create({
      url: `chrome://extensions/?id=${browser.runtime.id}`,
    })
  }
}
