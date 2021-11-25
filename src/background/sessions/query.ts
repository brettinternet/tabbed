import { getAllWindows } from 'utils/browser/query'
import {
  localStorageKeys,
  createSessionFromWindows,
  patchSession,
  readSession,
  readSessionCollection,
} from 'utils/browser/storage'
import type { SessionLists, Session } from 'utils/browser/storage'
import { findDuplicates } from 'utils/helpers'
import { log } from 'utils/logger'
import type { SessionQuery } from 'utils/messages'

import { throwSessionId } from '../errors'

const logContext = 'background/sessions/query'

export const getCurrentSession = async (): Promise<Session> => {
  log.debug(logContext, 'getCurrentSession()')

  const session = await readSession(localStorageKeys.CURRENT_SESSION)
  const windows = await getAllWindows({ populate: true }, true)
  if (!session) {
    const newSession = await createSessionFromWindows(
      localStorageKeys.CURRENT_SESSION,
      windows
    )
    return newSession
  } else {
    session.windows = windows
    await patchSession(localStorageKeys.CURRENT_SESSION, session)
    return session
  }
}

export const getSessionLists = async (): Promise<SessionLists> => {
  log.debug(logContext, 'getSessionCategories()')

  return {
    current: await getCurrentSession(),
    previous: await readSessionCollection(localStorageKeys.PREVIOUS_SESSIONS),
    saved: await readSessionCollection(localStorageKeys.USER_SAVED_SESSIONS),
  }
}

export const getAllSessions = async (): Promise<Session[]> => {
  const sessionLists = await getSessionLists()
  return [sessionLists.current, ...sessionLists.previous, ...sessionLists.saved]
}

export const querySession = async ({
  current,
  sessionId,
}: SessionQuery): Promise<Session | undefined> => {
  if (current) {
    return await getCurrentSession()
  }

  const sessions = await getAllSessions()
  if (sessionId) {
    return sessions.find((s) => s.id === sessionId)
  }
}

export const findSession = async (sessionId: Session['id']) => {
  const sessions = await getAllSessions()
  return sessions.find((s) => s.id === sessionId)
}

export const findWindow = (windowId: number, session: Session) =>
  session.windows.find((w) => w.id === windowId)

export const findSessionWithKey = async (sessionId: string) => {
  const sessionLists = await getSessionLists()
  if (sessionId === sessionLists.current.id) {
    return {
      key: localStorageKeys.CURRENT_SESSION,
      session: sessionLists.current,
      index: 0,
    }
  }
  const previousIndex = sessionLists.previous.findIndex(
    ({ id }) => id === sessionId
  )
  const previous = sessionLists.previous[previousIndex]
  if (previous) {
    return {
      key: localStorageKeys.PREVIOUS_SESSIONS,
      session: previous,
      index: previousIndex,
    }
  }
  const savedIndex = sessionLists.saved.findIndex(({ id }) => id === sessionId)
  const saved = sessionLists.saved[savedIndex]
  if (saved) {
    return {
      key: localStorageKeys.USER_SAVED_SESSIONS,
      session: saved,
      index: savedIndex,
    }
  }

  return {}
}

export const findDuplicateSessionTabs = async (sessionId: string) => {
  const session = await findSession(sessionId)
  if (session) {
    const tabUrls = session.windows.reduce((acc, w) => {
      if (w.tabs) {
        const urls = w.tabs.reduce(
          (_acc, { url }) => (url ? _acc.concat(url) : _acc),
          [] as string[]
        )
        return acc.concat(urls)
      }
      return acc
    }, [] as string[])
    return findDuplicates(tabUrls)
  } else {
    throwSessionId(sessionId)
  }
}
