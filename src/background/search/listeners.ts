import browser from 'webextension-polyfill'

import type { SearchSessionsMessage } from 'utils/messages'
import { MESSAGE_TYPE_SEARCH_SESSIONS } from 'utils/messages'

import { searchSessions } from './sessions'

export const setupSearchListeners = () => {
  browser.runtime.onMessage.addListener((message: SearchSessionsMessage) => {
    if (message.type === MESSAGE_TYPE_SEARCH_SESSIONS) {
      return searchSessions(message.value.text)
    }
  })
}
