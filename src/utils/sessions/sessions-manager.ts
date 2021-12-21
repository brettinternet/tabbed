import { Exclude, instanceToPlain, Type } from 'class-transformer'
import { lightFormat } from 'date-fns'
import { debounce } from 'lodash'
import { uniqBy } from 'lodash'

import { isNewTab, urlsMatch } from 'utils/browser'
import { appName } from 'utils/env'
import { AppError } from 'utils/error'
import { downloadJson } from 'utils/helpers'
import { Settings } from 'utils/settings/settings-manager'
import { LocalStorage } from 'utils/storage'

import { CurrentSession, SavedSession } from './session'
import {
  SessionDataExport,
  SessionsManagerData,
  SessionsManagerClass,
  SavedSessionCategoryType,
  SessionData,
  UpdateSavedSessionData,
  SavedSessionData,
  SavedSessionCategory,
  StoredCurrentSessionData,
} from './types'

const logContext = 'background/sessions/sessions-manager'

type StoredSessions = {
  current: StoredCurrentSessionData
  previous: SavedSessionData[]
  saved: SavedSessionData[]
}

/**
 * Two side-effects are maintained here:
 * 1. save the data to storage when it changes
 * 2. push data to frontend
 */
export interface SessionsManager extends SessionsManagerClass {}
export class SessionsManager {
  @Type(() => CurrentSession)
  current: CurrentSession

  @Type(() => SavedSession)
  saved: SavedSession[]

  @Type(() => SavedSession)
  previous: SavedSession[]

  @Exclude()
  settings: Settings

  constructor(
    {
      current,
      saved,
      previous,
    }: SessionsManagerData<CurrentSession, SavedSession>,
    settings: Settings
  ) {
    this.current = current
    this.saved = saved
    this.previous = previous
    this.settings = settings
  }

  static async load(settings: Settings): Promise<SessionsManager> {
    const {
      current,
      saved = [],
      previous = [],
    } = (await LocalStorage.get<StoredSessions>(LocalStorage.key.SESSIONS)) ||
    {}

    // save more fields on current, like window title, etc
    return new SessionsManager(
      {
        current: await this.getCurrent(current),
        saved: saved.map((s) => SavedSession.from(s)),
        previous: previous.map((s) => SavedSession.from(s)),
      },
      settings
    )
  }

  updateSettings(settings: Settings) {
    this.settings = settings
  }

  /**
   * Save to local storage
   */
  async save() {
    this.validate()
    const storedSessions: StoredSessions = {
      current: {
        windows: this.current.windows.map(({ assignedWindowId }) => ({
          assignedWindowId,
        })),
      },
      saved: this.saved,
      previous: this.previous,
    }
    await LocalStorage.set(LocalStorage.key.SESSIONS, storedSessions)
  }

  /**
   * Validate data before save
   */
  private validate() {
    this.saved = uniqBy(this.saved, 'uuid')
    this.previous = uniqBy(this.previous, 'uuid')
  }

  toJSON() {
    return JSON.stringify(instanceToPlain(this))
  }

  // TODO: When to overwrite current and unshift previous current to "previous" - as autosave
  static async getCurrent(
    current?: StoredCurrentSessionData
  ): Promise<CurrentSession> {
    return await CurrentSession.fromBrowser({
      windowOrder: current?.windows,
    })
  }

  private async _updateCurrent() {
    await this.current.updateFromBrowser()
  }

  @Exclude()
  updateCurrent = debounce(this._updateCurrent, 250)

  /**
   * Avoid conflicts with imported sessions by assigned a new ID
   */
  import(session: SessionData) {
    const saveSession = SavedSession.from(session)
    this.addSaved(saveSession)
    this.save()
  }

  async addSaved<T extends Omit<SessionData, 'id'>>(session: T) {
    return this.add(session, SavedSessionCategory.SAVED)
  }

  async addPrevious<T extends Omit<SessionData, 'id'>>(session: T) {
    return this.add(session, SavedSessionCategory.PREVIOUS)
  }

  private async add<T extends Omit<SessionData, 'id'>>(
    session: T,
    category: SavedSessionCategoryType
  ) {
    const savedSession = SavedSession.from(session)
    this.filterWindowTabs(savedSession)
    this[category].unshift(savedSession)
    this.save()
    return session
  }

  private async filterWindowTabs(session: SavedSession) {
    session.windows = session.windows.map((win) => {
      win.tabs = win.tabs.filter((tab) => {
        if (!isNewTab(tab)) {
          return this.settings.excludedUrls.parsed.every((excludedUrl) =>
            excludedUrl.includes('*')
              ? !excludedUrl
                  .split('*')
                  .filter(Boolean)
                  .every((segment) => tab.url.includes(segment))
              : !urlsMatch(excludedUrl, tab.url)
          )
        }
      })
      return win
    })

    return session
  }

  /**
   * Look for current, saved or previous
   */
  get(sessionId: SessionData['id'], category?: SavedSessionCategoryType) {
    if (sessionId === this.current.id) {
      return this.current
    } else {
      return this.find(sessionId, category)
    }
  }

  /**
   * Search saved/previous
   */
  find(sessionId: SessionData['id'], category?: SavedSessionCategoryType) {
    const sessions = category
      ? this[category]
      : [...this.saved, ...this.previous]
    const session = sessions.find(({ id }) => id === sessionId)
    if (!session) {
      throw new AppError(
        logContext,
        `Unable to find session by ID ${sessionId}`
      )
    }

    return session
  }

  findIndex(sessionId: SessionData['id'], category?: SavedSessionCategoryType) {
    const sessions = category
      ? this[category]
      : [...this.saved, ...this.previous]
    const index = sessions.findIndex(({ id }) => id === sessionId)

    if (index === -1) {
      throw new AppError(
        logContext,
        `Unable to find session by ID ${sessionId}`
      )
    }

    return index
  }

  async update(
    sessionId: SessionData['id'],
    params: UpdateSavedSessionData,
    category?: SavedSessionCategoryType
  ) {
    const session = this.get(sessionId, category)
    session.update(params)
    await this.save()
  }

  async delete(sessionId: string, category: SavedSessionCategoryType) {
    const index = this.findIndex(sessionId, category)
    this[category].splice(index, 1)
    await this.save()
  }

  async download(sessionIds: SessionData['id'][]) {
    await this.updateCurrent()
    const storedSessions = [
      SavedSession.from(this.current),
      ...this.saved,
      ...this.previous,
    ]
    const sessions = sessionIds
      ? storedSessions.filter(({ id }) => sessionIds.includes(id))
      : storedSessions

    const now = new Date()
    const timestamp = lightFormat(now, 'yyyy-MM-dd-hh-mm-ss-SS')
    const data: SessionDataExport = {
      exportedDate: now,
      sessions,
    }
    const filename = `${appName}-${timestamp}.json`
    downloadJson(filename, data)
  }
}
