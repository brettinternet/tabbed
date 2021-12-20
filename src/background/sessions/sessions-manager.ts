import { Exclude, instanceToPlain, Type } from 'class-transformer'
import { lightFormat } from 'date-fns'
import { debounce } from 'lodash'
import { uniqBy } from 'lodash'

import { Settings } from 'background/app/settings'
import { isNewTab, urlsMatch } from 'background/browser'
import { handleMessageError } from 'background/error'
import { BackgroundError } from 'background/error'
import { LocalStorage } from 'background/storage'
import { appName } from 'utils/env'
import { downloadJson } from 'utils/helpers'
import {
  MESSAGE_TYPE_PUSH_SESSIONS_MANAGER_DATA,
  PushSessionManagerDataMessage,
  sendMessage,
} from 'utils/messages'
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
} from 'utils/sessions'

import { CurrentSession, SavedSession } from './session'

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

  /**
   * Save to local storage
   */
  private async save() {
    this.validate()
    const storedSessions: StoredSessions = {
      current: {
        windows: this.current.windows.map(({ id, assignedWindowId }) => ({
          id,
          assignedWindowId,
        })),
      },
      saved: this.saved,
      previous: this.previous,
    }
    await LocalStorage.set(LocalStorage.key.SESSIONS, storedSessions)
  }

  /**
   * Push update to frontend
   */
  private async sendUpdate() {
    try {
      await sendMessage<PushSessionManagerDataMessage>(
        MESSAGE_TYPE_PUSH_SESSIONS_MANAGER_DATA,
        this.toJSON()
      )
    } catch (err) {
      handleMessageError(err)
    }
  }

  /**
   * Handle side effects when the data changes
   * TODO: handle partial updates and set patch to frontend
   */
  async handleChange() {
    Promise.all([this.save(), this.sendUpdate()])
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

  async updateCurrent() {
    await this.current.updateFromBrowser()
    await this.handleChange()
  }

  @Exclude()
  updateCurrentDebounce = debounce(this.updateCurrent, 250)

  /**
   * Avoid conflicts with imported sessions by assigned a new ID
   */
  import(session: SessionData) {
    const saveSession = SavedSession.from(session)
    this.addSaved(saveSession)
    this.handleChange()
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
    this.handleChange()
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
      throw new BackgroundError(
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
      throw new BackgroundError(
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
    await this.handleChange()
  }

  async delete(sessionId: string, category: SavedSessionCategoryType) {
    const index = this.findIndex(sessionId, category)
    this[category].splice(index, 1)
    await this.handleChange()
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
