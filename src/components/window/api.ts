import browser from 'webextension-polyfill'

import {
  MESSAGE_TYPE_OPEN_SESSION_WINDOW,
  OpenSessionWindowMessage,
  OpenWindowOptions,
  MESSAGE_TYPE_REMOVE_SESSION_WINDOW,
  RemoveSessionWindowMessage,
  MESSAGE_TYPE_PATCH_WINDOW,
  PatchWindowMessage,
  PatchWindowOptions,
  MESSAGE_TYPE_DOWNLOAD_SESSIONS,
  DownloadSessionsMessage,
  DownloadSessionsOptions,
  MESSAGE_TYPE_SAVE_WINDOW,
  SaveWindowMessage,
} from 'utils/messages'

export const saveWindow = async (sessionId: string, windowId: number) => {
  const message: SaveWindowMessage = {
    type: MESSAGE_TYPE_SAVE_WINDOW,
    value: { sessionId, windowId },
  }
  await browser.runtime.sendMessage(message)
}

export const openWindow = async (
  sessionId: string,
  windowId: number,
  options?: OpenWindowOptions
) => {
  const message: OpenSessionWindowMessage = {
    type: MESSAGE_TYPE_OPEN_SESSION_WINDOW,
    value: { sessionId, windowId, options },
  }
  await browser.runtime.sendMessage(message)
}

export const removeWindow = async (sessionId: string, windowId: number) => {
  const message: RemoveSessionWindowMessage = {
    type: MESSAGE_TYPE_REMOVE_SESSION_WINDOW,
    value: { sessionId, windowId },
  }
  await browser.runtime.sendMessage(message)
}

export const patchWindow = async (
  sessionId: string,
  windowId: number,
  options: PatchWindowOptions
) => {
  const message: PatchWindowMessage = {
    type: MESSAGE_TYPE_PATCH_WINDOW,
    value: { sessionId, windowId, options },
  }
  await browser.runtime.sendMessage(message)
}

export const downloadSessions = async (value: DownloadSessionsOptions) => {
  const message: DownloadSessionsMessage = {
    type: MESSAGE_TYPE_DOWNLOAD_SESSIONS,
    value,
  }
  await browser.runtime.sendMessage(message)
}
