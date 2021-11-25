import { throwSessionId, throwWindowId, throwTabId } from 'background/errors'
import { closeTab, closeWindow } from 'utils/browser/query'
import {
  localStorageKeys,
  patchSessionInCollection,
  deleteSessionInCollection,
} from 'utils/browser/storage'
import { isDefined } from 'utils/helpers'
import { log } from 'utils/logger'

import { findSessionWithKey } from './query'

const logContext = 'background/sessions/delete'

/**
 * @returns deleted session
 */
export const deleteSession = async ({
  sessionId,
}: {
  sessionId: string
}): Promise<ReturnType<typeof findSessionWithKey> | undefined> => {
  log.debug(logContext, 'deleteSession()', sessionId)

  const sessionInfo = await findSessionWithKey(sessionId)
  const { key, session } = sessionInfo
  if (key && session) {
    await deleteSessionInCollection(key, session.id)
    return sessionInfo
  } else {
    throwSessionId(sessionId)
  }
}

export const removeWindow = async ({
  sessionId,
  windowId,
}: {
  sessionId: string
  windowId: number
}) => {
  log.debug(logContext, 'removeWindow()', { sessionId, windowId })

  const sessionInfo = await findSessionWithKey(sessionId)
  const { key, session } = sessionInfo

  if (key && session) {
    const windowIndex = session.windows.findIndex(({ id }) => id === windowId)
    if (key === localStorageKeys.CURRENT_SESSION) {
      await closeWindow(windowId)
    } else {
      if (windowIndex > -1) {
        session.windows.splice(windowIndex, 1)
        await patchSessionInCollection(key, session)
      } else {
        throwWindowId(windowId)
      }
    }
  } else {
    throwSessionId(sessionId)
  }
}

export const removeTab = async ({
  sessionId,
  windowId,
  tabId,
}: {
  sessionId: string
  windowId: number
  tabId: number
}) => {
  log.debug(logContext, 'removeTab()', { sessionId, windowId, tabId })

  const { key, session } = await findSessionWithKey(sessionId)

  if (key && session) {
    if (key === localStorageKeys.CURRENT_SESSION) {
      await closeTab(tabId)
    } else {
      const windowIndex = session.windows.findIndex((w) => w.id === windowId)
      if (windowIndex > -1) {
        const tabIndex = session.windows[windowIndex].tabs?.findIndex(
          (t) => t.id === tabId
        )
        if (isDefined(tabIndex) && tabIndex > -1) {
          session.windows[windowIndex].tabs?.splice(tabIndex, 1)
          await patchSessionInCollection(key, session)
        } else {
          throwTabId(tabId)
        }
      } else {
        throwWindowId(windowId)
      }
    }
  } else {
    throwSessionId(sessionId)
  }
}
