// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea/set
import { v4 as uuidv4 } from 'uuid'
import browser, { Windows } from 'webextension-polyfill'

import { isProd } from 'utils/env'
import type { Valueof } from 'utils/helpers'
import { isDefined, insert } from 'utils/helpers'
import type { Settings } from 'utils/settings'
import { defaultSettings } from 'utils/settings'

export const localStorageKeys = {
  SETTINGS: 'settings',
  CURRENT_SESSION: 'current_session',
  PREVIOUS_SESSIONS: 'previous_sessions',
  USER_SAVED_SESSIONS: 'user_saved_sessions',
} as const
export type LocalStorageKey = Valueof<typeof localStorageKeys>

export const readSettings = async (): Promise<Settings> => {
  const { settings } = await (browser.storage.local.get(
    localStorageKeys.SETTINGS
  ) as Promise<{ settings: Settings | undefined }>)
  if (settings) {
    return {
      ...defaultSettings,
      ...settings,
    }
  }
  return defaultSettings
}

export const writeSetting = async (settings: Partial<Settings>) => {
  const currentSettings = await readSettings()
  await browser.storage.local.set({
    [localStorageKeys.SETTINGS]: Object.assign({}, currentSettings, settings),
  })
}

export const sessionTypes = {
  CURRENT: 'current',
  PREVIOUS: 'previous',
  SAVED: 'saved',
}
export type SessionType = Valueof<typeof sessionTypes>

export type Session = {
  id: string
  title?: string
  windows: Windows.Window[]
  createdDate: string
  lastModifiedDate: string
  userSavedDate?: string
  type: SessionType
}

export type SessionLists = {
  current: Session
  previous: Session[]
  saved: Session[]
}

const getSessionType = (key: LocalStorageKey) => {
  switch (key) {
    case localStorageKeys.CURRENT_SESSION:
      return sessionTypes.CURRENT
    case localStorageKeys.PREVIOUS_SESSIONS:
      return sessionTypes.PREVIOUS
    case localStorageKeys.USER_SAVED_SESSIONS:
    default:
      return sessionTypes.SAVED
  }
}

export const getLocalStorageKey = (type: SessionType) => {
  switch (type) {
    case sessionTypes.CURRENT:
      return localStorageKeys.CURRENT_SESSION
    case sessionTypes.PREVIOUS:
      return localStorageKeys.PREVIOUS_SESSIONS
    case sessionTypes.SAVED:
    default:
      return localStorageKeys.USER_SAVED_SESSIONS
  }
}

const checkCollectionKey = (key: LocalStorageKey): boolean => {
  if (
    key === localStorageKeys.PREVIOUS_SESSIONS ||
    key === localStorageKeys.USER_SAVED_SESSIONS
  ) {
    return true
  }

  return false
}

/**
 * Save a single session
 */
const saveSingleSession = async (key: LocalStorageKey, session: Session) => {
  await browser.storage.local.set({
    [key]: session,
  })
}

export const patchSession = async (key: LocalStorageKey, session: Session) => {
  if (key === localStorageKeys.CURRENT_SESSION) {
    session.lastModifiedDate = new Date().toJSON()
    await saveSingleSession(key, session)
  } else {
    await patchSessionInCollection(key, session)
  }
}

const saveSessionToCollection = async (
  key: LocalStorageKey,
  session: Session,
  index?: number
) => {
  if (checkCollectionKey(key)) {
    const existing = await readSessionCollection(key)
    const newSessions = isDefined(index)
      ? insert(existing, session, index)
      : [session, ...existing]
    await browser.storage.local.set({
      [key]: newSessions,
    })
  } else {
    throw Error(`${key} is not a collection storage key`)
  }
}

/**
 * Initialize and save session
 */
export const createSessionFromWindows = async (
  key: LocalStorageKey,
  windows: Session['windows'],
  title?: string
) => {
  const now = new Date().toJSON()
  const session: Session = {
    id: uuidv4(),
    windows,
    createdDate: now,
    lastModifiedDate: now,
    type: getSessionType(key),
    title,
  }
  if (key === localStorageKeys.CURRENT_SESSION) {
    await saveSingleSession(key, session)
  } else {
    await saveSessionToCollection(key, session)
  }
  return session
}

/**
 * Save an existing session from current/previous session, or copying user saved sessions
 *
 * Saving an existing session needs a new ID in order to avoid duplicates
 */
export const saveNewSession = async (
  key: LocalStorageKey,
  session: Session,
  index?: number
) => {
  const now = new Date().toJSON()
  session.id = uuidv4()
  session.lastModifiedDate = now
  session.type = getSessionType(key)
  if (key === localStorageKeys.CURRENT_SESSION) {
    await saveSingleSession(key, session)
  } else {
    if (key === localStorageKeys.USER_SAVED_SESSIONS) {
      session.userSavedDate = now
    }
    await saveSessionToCollection(key, session, index)
  }
  return session
}

/**
 * This does not set a new id, and expects session to already be qualified
 *
 * TODO: should we still reassign a new ID to ensure it's always unique?
 */
export const resaveSession = async (
  key: LocalStorageKey,
  session: Session,
  index?: number
) => {
  if (!session.id) {
    throw Error(`Invalid session ID: ${session.id}`)
  }
  if (session.type !== getSessionType(key)) {
    throw Error(`Session type doesn't match local storage key: ${session.id}`)
  }
  if (key === localStorageKeys.CURRENT_SESSION) {
    await saveSingleSession(key, session)
  } else {
    await saveSessionToCollection(key, session, index)
  }
  return session
}

/**
 * Save an imported session, assign new ID to allow duplicate imports
 * Move imported current sessions to previous
 */
export const saveImportedSession = async (session: Session) => {
  session.id = uuidv4()
  if (session.type === sessionTypes.CURRENT) {
    session.type = sessionTypes.PREVIOUS
  }
  const key = getLocalStorageKey(session.type)
  await saveSessionToCollection(key, session)
}

/**
 * Remove entire session (current session which exists on its own key)
 */
export const removeSession = async (key: LocalStorageKey) => {
  await browser.storage.local.remove(key)
}

/**
 * Read a session category
 */
export const readSession = async <T extends LocalStorageKey, U = Session>(
  key: T
): Promise<U | undefined> => {
  const res = await (browser.storage.local.get(key) as Promise<
    Record<T, U | undefined>
  >)
  return res?.[key]
}

/**
 * Read all session from collection
 */
export const readSessionCollection = async <T extends LocalStorageKey>(
  key: T
) => (await readSession<T, Session[]>(key)) || []

/**
 * Delete a single session in a collection
 */
export const deleteSessionInCollection = async (
  key: LocalStorageKey,
  sessionId: string
) => {
  if (checkCollectionKey(key)) {
    const existing = await readSessionCollection(key)
    await browser.storage.local.set({
      [key]: existing.filter(({ id }) => id !== sessionId),
    })
  } else {
    throw Error(`${key} is not a collection storage key`)
  }
}

export const patchSessionInCollection = async (
  key: LocalStorageKey,
  session: Session
) => {
  if (checkCollectionKey(key)) {
    const existing = await readSessionCollection(key)
    const updateIndex = existing.findIndex(({ id }) => id === session.id)
    session.lastModifiedDate = new Date().toJSON()
    existing.splice(updateIndex, 1, session)
    await browser.storage.local.set({
      [key]: existing,
    })
  } else {
    throw Error(`${key} is not a collection storage key`)
  }
}

/**
 * @WARNING destructive, only use in dev
 */
export const purgeAllStorage = async () => {
  if (!isProd) {
    await browser.storage.local.clear()
  }
}
