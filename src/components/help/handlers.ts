import browser from 'webextension-polyfill'

export const openOptions = async () => {
  if (IS_CHROME) {
    await browser.tabs.create({
      url: `chrome://extensions/?id=${browser.runtime.id}`,
    })
  }
}
