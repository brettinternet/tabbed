import browser, { Tabs } from 'webextension-polyfill'

import { log } from 'utils/logger'
import {
  MESSAGE_TYPE_GET_SESSIONS_MANAGER_DATA,
  GetSessionsManagerDataMessage,
  GetSessionListsResponse,
  MESSAGE_TYPE_SAVE_EXISTING_SESSION,
  SaveExistingSessionMessage,
  MESSAGE_TYPE_SAVE_WINDOW,
  SaveWindowMessage,
  MESSAGE_TYPE_OPEN_SESSION,
  OpenSessionMessage,
  MESSAGE_TYPE_OPEN_SESSION_WINDOW,
  OpenSessionWindowMessage,
  MESSAGE_TYPE_OPEN_SESSION_TAB,
  OpenSessionTabMessage,
  MESSAGE_TYPE_DELETE_SESSION,
  DeleteSessionMessage,
  MESSAGE_TYPE_REMOVE_SESSION_WINDOW,
  RemoveSessionWindowMessage,
  MESSAGE_TYPE_REMOVE_SESSION_TAB,
  RemoveSessionTabMessage,
  MESSAGE_TYPE_UPDATE_SESSION,
  OpenWindowOptions,
  OpenTabOptions,
  UpdateSessionMessage,
  MESSAGE_TYPE_PATCH_WINDOW,
  PatchWindowOptions,
  MESSAGE_TYPE_PATCH_TAB,
  PatchWindowMessage,
  MESSAGE_TYPE_DISCARD_TABS,
  PatchTabOptions,
  PatchTabMessage,
  DiscardTabsMessage,
  MESSAGE_TYPE_MOVE_TABS,
  MESSAGE_TYPE_DOWNLOAD_SESSIONS,
  MESSAGE_TYPE_FIND_DUPLICATE_SESSION_TABS,
  MESSAGE_TYPE_QUERY_SESSION,
  MoveTabsMessage,
  DownloadSessionsMessage,
  DownloadSessionsOptions,
  FindDuplicateSessionTabsMessage,
  FindDuplicateSessionTabsResponse,
  QuerySessionMessage,
  QuerySessionResponse,
  SessionQuery,
  PushSessionManagerDataMessage,
  MESSAGE_TYPE_PUSH_SESSIONS_MANAGER_DATA,
} from 'utils/messages'
import { SessionsManagerData, SessionStatusType } from 'utils/sessions'

const logContext = 'components/sessions/api'

export const startListeners = (
  setSessionsManager: React.Dispatch<
    React.SetStateAction<SessionsManagerData | undefined>
  >
) => {
  browser.runtime.onMessage.addListener(
    (message: PushSessionManagerDataMessage) => {
      if (message.type === MESSAGE_TYPE_PUSH_SESSIONS_MANAGER_DATA) {
        setSessionsManager(JSON.parse(message.value))
      }
    }
  )
}

export const getSessionsManagerData = async (): Promise<
  GetSessionListsResponse | undefined
> => {
  log.debug(logContext, 'getSessionsManagerData()')

  const message: GetSessionsManagerDataMessage = {
    type: MESSAGE_TYPE_GET_SESSIONS_MANAGER_DATA,
  }
  try {
    const jsonStr = await browser.runtime.sendMessage(message)
    return JSON.parse(jsonStr)
  } catch (err) {
    log.error(err)
  }
}

export const querySession = async (
  query: SessionQuery
): Promise<QuerySessionResponse> => {
  log.debug(logContext, 'querySession()', query)

  const message: QuerySessionMessage = {
    type: MESSAGE_TYPE_QUERY_SESSION,
    value: query,
  }
  return await browser.runtime.sendMessage(message)
}

export const saveExistingSession = async (sessionId: string) => {
  const message: SaveExistingSessionMessage = {
    type: MESSAGE_TYPE_SAVE_EXISTING_SESSION,
    value: { sessionId },
  }
  await browser.runtime.sendMessage(message)
}

export const openSession = async (sessionId: string) => {
  const message: OpenSessionMessage = {
    type: MESSAGE_TYPE_OPEN_SESSION,
    value: { sessionId },
  }
  await browser.runtime.sendMessage(message)
}

export const deleteSession = async (
  sessionId: string,
  status: Exclude<SessionStatusType, 'current'>
) => {
  const message: DeleteSessionMessage = {
    type: MESSAGE_TYPE_DELETE_SESSION,
    value: { sessionId, status },
  }
  await browser.runtime.sendMessage(message)
}

export const renameSession = async (sessionId: string, title: string) => {
  const message: UpdateSessionMessage = {
    type: MESSAGE_TYPE_UPDATE_SESSION,
    value: { sessionId, title },
  }
  await browser.runtime.sendMessage(message)
}

export const moveTabs = async (value: {
  sessionId: string
  windowId: number
  tabIds: number | number[]
  index: Tabs.MoveMovePropertiesType['index']
}) => {
  const message: MoveTabsMessage = {
    type: MESSAGE_TYPE_MOVE_TABS,
    value,
  }
  await browser.runtime.sendMessage(message)
}

export const downloadSessions = async (options: DownloadSessionsOptions) => {
  const message: DownloadSessionsMessage = {
    type: MESSAGE_TYPE_DOWNLOAD_SESSIONS,
    value: options,
  }
  await browser.runtime.sendMessage(message)
}
