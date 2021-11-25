import { pick } from 'lodash'
import { Tabs, Windows } from 'webextension-polyfill'

import { getTabUrl } from 'utils/browser/query'
import type { Session } from 'utils/browser/storage'
import { log } from 'utils/logger'

const logContext = 'background/sessions/compress'

const compressTab = (tab: Tabs.Tab) => {
  const tabPicks: Array<keyof Tabs.Tab> = [
    'active',
    'title',
    'groupId',
    'index',
    'highlighted',
    'pinned',
    'incognito',
    'windowId',
    'id',
    'favIconUrl',
  ]
  const compressedTab = pick(tab, tabPicks)
  compressedTab.url = getTabUrl(tab)
  return compressedTab
}

export const compressWindow = (win: Windows.Window) => {
  const winPicks: Array<keyof Windows.Window> = [
    'id',
    'tabs',
    'focused',
    'incognito',
    'alwaysOnTop',
    'incognito',
    'state',
  ]
  const compressedWin = pick(win, winPicks)
  compressedWin.tabs = win.tabs?.map(compressTab)
  return compressedWin
}

export const compressSession = (session: Session) => {
  log.debug(logContext, 'compressSession()')

  const sessionPicks: Array<keyof Session> = [
    'id',
    'title',
    'windows',
    'createdDate',
    'lastModifiedDate',
    'userSavedDate',
    'type',
  ]
  const compressedSession = pick(session, sessionPicks)
  compressedSession.windows = session.windows.map(compressWindow)
  return compressedSession
}
