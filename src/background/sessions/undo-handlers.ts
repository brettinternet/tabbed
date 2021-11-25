import {
  focusWindow,
  focusWindowTab,
  getActiveTabCurrentWindow,
} from 'utils/browser/query'
import { resaveSession } from 'utils/browser/storage'
import { isDefined } from 'utils/helpers'
import { log } from 'utils/logger'
import type {
  SaveExistingSessionMessage,
  SaveWindowMessage,
  OpenSessionMessage,
  OpenSessionWindowMessage,
  OpenSessionTabMessage,
  DeleteSessionMessage,
  RemoveSessionWindowMessage,
  RemoveSessionTabMessage,
  UpdateSessionMessage,
  PatchWindowMessage,
  PatchWindowOptions,
  PatchTabMessage,
  PatchTabOptions, // DiscardTabsMessage,
  // MoveTabsMessage,
  // DownloadSessionsMessage,
  // FindDuplicateSessionTabsMessage,
  // ImportSessionsFromTextMessage,
} from 'utils/messages'

import { updateSelectedSessionId } from '../send'
import { undoStack } from '../undo/stack'
// import { downloadSessions } from './export'
import {
  openSession,
  openSessionWindow,
  openSessionTab,
  updateSessions,
} from './actions'
import {
  saveExistingSession,
  saveWindowAsSession, // importSessionsFromText,
} from './create'
import { deleteSession, removeWindow, removeTab } from './delete'
import {
  updateSession,
  patchWindow,
  patchTab, // discardTabs,
  moveTabs,
  addWindowToSession,
  addTabToSessionWindow,
} from './put'
import {
  findSession,
  getCurrentSession,
  findSessionWithKey,
  findWindow,
} from './query'

const logContext = 'background/sessions/handlers'

export const undoableSaveExistingSession = async (
  value: SaveExistingSessionMessage['value']
) => {
  const sessionId = await saveExistingSession(value)
  if (sessionId) {
    undoStack.push({
      data: {
        sessionId,
      },
      undo: async function () {
        await deleteSession({ sessionId: this.data.sessionId })
        await updateSessions()
      },
      redo: async function () {
        const sessionId = await saveExistingSession(value)
        if (sessionId) {
          this.data.sessionId = sessionId
          await updateSessions()
        }
      },
    })
  } else {
    log.error(
      logContext,
      'undoableSaveExistingSession()',
      'Unable to push actions to undo stack',
      sessionId
    )
  }
}

export const undoableSaveWindowAsSession = async (
  value: SaveWindowMessage['value']
) => {
  const sessionId = await saveWindowAsSession(value)
  if (sessionId) {
    undoStack.push({
      data: {
        sessionId,
      },
      undo: async function () {
        await deleteSession({ sessionId: this.data.sessionId })
        await updateSessions()
      },
      redo: async function () {
        const sessionId = await saveWindowAsSession(value)
        await updateSessions()
        if (sessionId) {
          this.data.sessionId = sessionId
        }
      },
    })
  } else {
    log.error(
      logContext,
      'undoableSaveWindowAsSession()',
      'Unable to push actions to undo stack',
      sessionId
    )
  }
}

export const undoableUpdateSession = async (
  value: UpdateSessionMessage['value']
) => {
  const { sessionId } = value
  const session = await findSession(sessionId)
  await updateSession(value)
  undoStack.push({
    data: {},
    undo: async () => {
      await updateSession({ sessionId, title: session?.title })
      await updateSessions()
    },
    redo: async () => {
      await updateSession(value)
      await updateSessions()
    },
  })
}

export const undoableOpenSession = async (
  value: OpenSessionMessage['value']
) => {
  const windowIds = await openSession(value)
  if (windowIds) {
    undoStack.push({
      data: {},
      undo: async () => {
        const currentSession = await getCurrentSession()
        const tasks = windowIds.map(async (windowId) => {
          await removeWindow({ sessionId: currentSession.id, windowId })
        })
        await Promise.all(tasks)
      },
      redo: async () => {
        await openSession(value)
      },
    })
  } else {
    log.error(
      logContext,
      'undoableOpenSession()',
      'Unable to push actions to undo stack',
      windowIds
    )
  }
}

export const undoableOpenSessionWindow = async (
  value: OpenSessionWindowMessage['value']
) => {
  const result = await openSessionWindow(value)
  const currentFocusedTab = await getActiveTabCurrentWindow()
  if (result && isDefined(result.windowId)) {
    undoStack.push({
      data: {
        created: result.created,
        windowId: result.windowId,
        currentFocusedTab,
      },
      undo: async function () {
        const currentSession = await getCurrentSession()
        if (this.data.created) {
          await removeWindow({
            sessionId: currentSession.id,
            windowId: this.data.windowId,
          })
        } else if (
          this.data.currentFocusedTab &&
          isDefined(this.data.currentFocusedTab.windowId)
        ) {
          await focusWindow(this.data.currentFocusedTab.windowId)
        }
      },
      redo: async function () {
        const result = await openSessionWindow(value)
        if (result && isDefined(result.windowId)) {
          this.data = {
            created: result.created,
            windowId: result.windowId,
            currentFocusedTab,
          }
        }
      },
    })
  } else {
    log.error(
      logContext,
      'undoableOpenSessionWindow()',
      'Unable to push actions to undo stack',
      result
    )
  }
}

export const undoableOpenSessionTab = async (
  value: OpenSessionTabMessage['value']
) => {
  const result = await openSessionTab(value)
  const currentFocusedTab = await getActiveTabCurrentWindow()
  if (
    result?.tab &&
    isDefined(result.tab.id) &&
    isDefined(result.tab.windowId)
  ) {
    undoStack.push({
      data: {
        created: result.created,
        tabId: result.tab.id,
        windowId: result.tab.windowId,
        currentFocusedTab,
      },
      undo: async function () {
        const currentSession = await getCurrentSession()
        if (this.data.created) {
          await removeTab({
            sessionId: currentSession.id,
            windowId: this.data.windowId,
            tabId: this.data.tabId,
          })
        } else if (
          this.data.currentFocusedTab?.windowId &&
          isDefined(this.data.currentFocusedTab.id)
        ) {
          await focusWindowTab(
            this.data.currentFocusedTab.windowId,
            this.data.currentFocusedTab.id
          )
        }
      },
      redo: async function () {
        const result = await openSessionTab(value)
        if (
          result?.tab &&
          isDefined(result.tab.id) &&
          isDefined(result.tab.windowId)
        ) {
          this.data = {
            created: result.created,
            tabId: result.tab.id,
            windowId: result.tab.windowId,
            currentFocusedTab,
          }
        }
      },
    })
  } else {
    log.error(
      logContext,
      'undoableOpenSessionTab()',
      'Unable to push actions to undo stack',
      result
    )
  }
}

export const undoableDeleteSession = async (
  value: DeleteSessionMessage['value']
) => {
  const sessionInfo = await deleteSession(value)
  if (sessionInfo?.session) {
    undoStack.push({
      data: {
        sessionInfo,
      },
      undo: async function () {
        await resaveSession(
          this.data.sessionInfo.key,
          this.data.sessionInfo.session,
          this.data.sessionInfo.index
        )
        await updateSessions()
        await updateSelectedSessionId(this.data.sessionInfo.session.id)
      },
      redo: async function () {
        await deleteSession({
          sessionId: this.data.sessionInfo.session.id,
        })
        await updateSessions()
      },
    })
  } else {
    log.error(
      logContext,
      'undoableDeleteSession()',
      'Unable to push actions to undo stack',
      sessionInfo
    )
  }
}

export const undoableRemoveWindow = async (
  value: RemoveSessionWindowMessage['value']
) => {
  const getSessionInfo = async () => {
    const sessionInfo = await findSessionWithKey(value.sessionId)
    const windowIndex = sessionInfo.session?.windows.findIndex(
      ({ id }) => id === value.windowId
    )
    return {
      ...sessionInfo,
      windowIndex,
    }
  }
  const sessionInfo = await getSessionInfo()
  await removeWindow(value)
  if (sessionInfo.session) {
    undoStack.push({
      data: {
        sessionInfo,
      },
      undo: async function () {
        const { session, windowIndex } = this.data.sessionInfo
        if (isDefined(windowIndex)) {
          await addWindowToSession({
            sessionId: session.id,
            win: session.windows[windowIndex],
            index: windowIndex,
          })
          await updateSessions()
        }
      },
      redo: async function () {
        const sessionInfo = await getSessionInfo()
        await removeWindow(value)
        await updateSessions()
        if (sessionInfo.session) {
          this.data.sessionInfo = sessionInfo
        }
      },
    })
  } else {
    log.error(
      logContext,
      'undoableRemoveWindow()',
      'Unable to push actions to undo stack',
      sessionInfo
    )
  }
}

export const undoableRemoveTab = async (
  value: RemoveSessionTabMessage['value']
) => {
  const getSessionInfo = async () => {
    const sessionInfo = await findSessionWithKey(value.sessionId)
    const windowIndex = sessionInfo.session?.windows.findIndex(
      ({ id }) => id === value.windowId
    )
    return {
      ...sessionInfo,
      windowIndex,
    }
  }
  const sessionInfo = await getSessionInfo()
  await removeTab(value)
  if (sessionInfo.session) {
    undoStack.push({
      data: {
        sessionInfo,
      },
      undo: async function () {
        const { session, windowIndex } = this.data.sessionInfo
        if (isDefined(windowIndex)) {
          const tabIndex = session.windows?.[windowIndex].tabs?.findIndex(
            ({ id }) => id === value.tabId
          )
          if (isDefined(tabIndex)) {
            const tab = session.windows[windowIndex].tabs?.[tabIndex]
            if (tab) {
              await addTabToSessionWindow({
                sessionId: session.id,
                tab,
                windowIndex,
                index: tabIndex,
              })
              await updateSessions()
            }
          }
        }
      },
      redo: async function () {
        const sessionInfo = await getSessionInfo()
        await removeTab(value)
        await updateSessions()
        if (sessionInfo.session) {
          this.data.sessionInfo = sessionInfo
        }
      },
    })
  } else {
    log.error(
      logContext,
      'undoableRemoveTab()',
      'Unable to push actions to undo stack',
      sessionInfo
    )
  }
}

export const undoablePatchWindow = async (
  value: PatchWindowMessage['value']
) => {
  const session = await findSession(value.sessionId)
  const win = session ? findWindow(value.windowId, session) : undefined
  if (win) {
    const { focused, state, left, top } = win
    const oldOptions: PatchWindowOptions = {
      focused,
      state,
      left,
      top,
      drawAttention: false,
    }
    await patchWindow(value)
    undoStack.push({
      data: {},
      undo: async function () {
        await patchWindow({
          sessionId: value.sessionId,
          windowId: value.windowId,
          options: oldOptions,
        })
      },
      redo: async function () {
        await patchWindow(value)
      },
    })
  } else {
    log.error(
      logContext,
      'undoablePatchWindow()',
      'Unable to push actions to undo stack',
      session
    )
  }
}

export const undoablePatchTab = async (value: PatchTabMessage['value']) => {
  const session = await findSession(value.sessionId)
  const win = session ? findWindow(value.windowId, session) : undefined
  const tab = win?.tabs?.find(({ id }) => id === value.tabId)
  if (session && win && tab) {
    const { url, active, highlighted, pinned, mutedInfo, index } = tab
    const oldOptions: PatchTabOptions = {
      url,
      active,
      highlighted,
      pinned,
      muted: mutedInfo ? mutedInfo.muted : undefined,
    }
    await patchTab(value)
    undoStack.push({
      data: {},
      undo: async function () {
        await patchTab({
          sessionId: value.sessionId,
          windowId: value.windowId,
          tabId: value.tabId,
          options: oldOptions,
        })
        // move to index when pinned so tab returns to previous order
        if (
          oldOptions.pinned !== value.options.pinned &&
          isDefined(win.id) &&
          isDefined(tab.id)
        ) {
          await moveTabs({
            sessionId: session.id,
            windowId: win.id,
            tabIds: tab.id,
            index,
          })
        }
      },
      redo: async function () {
        await patchTab(value)
      },
    })
  } else {
    log.error(
      logContext,
      'undoablePatchTab()',
      'Unable to push actions to undo stack',
      session
    )
  }
}
