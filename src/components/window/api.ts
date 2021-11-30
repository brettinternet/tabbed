import browser from 'webextension-polyfill'

import {
  MESSAGE_TYPE_OPEN_SESSION_WINDOW,
  MESSAGE_TYPE_OPEN_SESSION_TAB,
  MESSAGE_TYPE_REMOVE_SESSION_WINDOW,
  MESSAGE_TYPE_PATCH_WINDOW,
  MESSAGE_TYPE_DOWNLOAD_SESSIONS,
} from 'utils/messages'
import type {
  OpenSessionWindowMessage,
  OpenSessionTabMessage,
  RemoveSessionWindowMessage,
  OpenWindowOptions,
  OpenTabOptions,
  PatchWindowOptions,
  PatchWindowMessage,
  DownloadSessionsMessage,
  DownloadSessionsOptions,
} from 'utils/messages'

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

export const openTab = async (
  sessionId: string,
  windowId: number,
  tabId: number,
  options?: OpenTabOptions
) => {
  const message: OpenSessionTabMessage = {
    type: MESSAGE_TYPE_OPEN_SESSION_TAB,
    value: { sessionId, windowId, tabId, options },
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

export const downloadSessions = async (options: DownloadSessionsOptions) => {
  const message: DownloadSessionsMessage = {
    type: MESSAGE_TYPE_DOWNLOAD_SESSIONS,
    value: options,
  }
  await browser.runtime.sendMessage(message)
}
