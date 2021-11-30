import browser from 'webextension-polyfill'

import {
  MESSAGE_TYPE_OPEN_SESSION_TAB,
  OpenSessionTabMessage,
  OpenTabOptions,
  MESSAGE_TYPE_REMOVE_SESSION_TAB,
  RemoveSessionTabMessage,
  PatchTabOptions,
  PatchTabMessage,
  MESSAGE_TYPE_PATCH_TAB,
  DiscardTabsMessage,
  MESSAGE_TYPE_DISCARD_TABS,
} from 'utils/messages'

export const openTab = async (value: {
  sessionId: string
  windowId: number
  tabId: number
  options?: OpenTabOptions
}) => {
  const message: OpenSessionTabMessage = {
    type: MESSAGE_TYPE_OPEN_SESSION_TAB,
    value,
  }
  await browser.runtime.sendMessage(message)
}

export const removeTab = async (value: {
  sessionId: string
  windowId: number
  tabId: number
}) => {
  const message: RemoveSessionTabMessage = {
    type: MESSAGE_TYPE_REMOVE_SESSION_TAB,
    value,
  }
  await browser.runtime.sendMessage(message)
}

export const patchTab = async (value: {
  sessionId: string
  windowId: number
  tabId: number
  options: PatchTabOptions
}) => {
  const message: PatchTabMessage = {
    type: MESSAGE_TYPE_PATCH_TAB,
    value,
  }
  await browser.runtime.sendMessage(message)
}

export const discardTabs = async (value: {
  sessionId: string
  windowId: number
  tabIds: number | number[]
}) => {
  const message: DiscardTabsMessage = {
    type: MESSAGE_TYPE_DISCARD_TABS,
    value,
  }
  await browser.runtime.sendMessage(message)
}
