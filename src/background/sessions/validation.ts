import type { Session } from 'utils/browser/storage'
import {
  saveNewSession,
  deleteSessionInCollection,
  getLocalStorageKey,
} from 'utils/browser/storage'
import { log } from 'utils/logger'

import { getAllSessions } from './query'

const logContext = 'background/sessions/validation'

const removeDuplicateSessionIds = async (sessions: Session[]) => {
  const hash: Record<string, boolean> = {}
  let index = 0
  let { type } = sessions[0]
  for (const session of sessions) {
    if (hash[session.id]) {
      log.warn(
        logContext,
        'removeDuplicateSessionIds()',
        'Duplicate session ID found'
      )
      const key = getLocalStorageKey(session.type)
      await deleteSessionInCollection(key, session.id)
      await saveNewSession(key, session, index)
    }
    hash[session.id] = true
    // reset index with each new type
    if (session.type === type) {
      index++
    } else {
      type = session.type
      index = 0
    }
  }
}

export const startupValidation = async () => {
  log.debug(logContext, 'startupValidation()')

  const sessions = await getAllSessions()
  await removeDuplicateSessionIds(sessions)
}
