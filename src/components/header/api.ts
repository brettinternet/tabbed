import browser from 'webextension-polyfill'

import { log } from 'utils/logger'
import type {
  SearchSessionsMessage,
  SearchSessionsResponse,
} from 'utils/messages'
import { MESSAGE_TYPE_SEARCH_SESSIONS } from 'utils/messages'

const logContext = 'components/search/send'

export const searchSessions = async (
  text: string
): Promise<SearchSessionsResponse> => {
  log.debug(logContext, 'searchSessions()', text)

  const message: SearchSessionsMessage = {
    type: MESSAGE_TYPE_SEARCH_SESSIONS,
    value: { text },
  }
  return await browser.runtime.sendMessage(message)
}
