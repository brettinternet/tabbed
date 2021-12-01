import {
  Exclude,
  instanceToPlain,
  plainToInstance,
  Type,
} from 'class-transformer'
import { lightFormat } from 'date-fns'
import { debounce } from 'lodash'
import browser from 'webextension-polyfill'

import { handleMessageError } from 'background/error'
import { LocalStorage } from 'background/storage'
import { appName } from 'utils/env'
import { downloadJson } from 'utils/helpers'
import { AppError } from 'utils/logger'
import {
  MESSAGE_TYPE_PUSH_SESSIONS_MANAGER_DATA,
  PushSessionManagerDataMessage,
} from 'utils/messages'
import {
  SessionStatus,
  SessionStatusType,
  UpdateSessionData,
  SessionDataExport,
  SessionsManagerData,
  SessionsManagerClass,
} from 'utils/sessions'

import { Session } from './session'

const logContext = 'background/sessions/sessions-manager'

type SavedSessions = { previous: Session[]; saved: Session[] }

/**
 * Since subclasses are reasonably coupled anyway, we do use circular references
 * To reference parent class, but that's probably okay
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management#cycles_are_no_longer_a_problem
 * `class-transformer` serialization ignores circular references for us
 *
 * Two side-effects are maintained here:
 * 1. save the data to storage when it changes
 * 2. push data to frontend
 */
export interface SessionsManager extends SessionsManagerClass {}
export class SessionsManager {
  @Type(() => Session)
  current: Session

  @Type(() => Session)
  saved: Session[]

  @Type(() => Session)
  previous: Session[]

  constructor({ current, saved, previous }: SessionsManagerData<Session>) {
    this.current = current
    this.saved = saved
    this.previous = previous
  }

  static async load(): Promise<SessionsManager> {
    const { saved = [], previous = [] } =
      (await LocalStorage.get<SavedSessions>(LocalStorage.key.SESSIONS)) || {}

    const current = await this.getCurrent()
    return new SessionsManager({ current, saved, previous })
  }

  /**
   * Save to local storage
   */
  private async save() {
    this.validate()
    await LocalStorage.set(LocalStorage.key.SESSIONS, {
      saved: this.saved,
      previous: this.previous,
    })
  }

  /**
   * Push update to frontend
   */
  private async sendUpdate() {
    const message: PushSessionManagerDataMessage = {
      type: MESSAGE_TYPE_PUSH_SESSIONS_MANAGER_DATA,
      value: this.toJSON(),
    }

    try {
      await browser.runtime.sendMessage(message)
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
    this.saved.map((session) => ({ ...session, status: SessionStatus.SAVED }))
    this.previous.map((session) => ({
      ...session,
      status: SessionStatus.PREVIOUS,
    }))
    this.current.status = SessionStatus.CURRENT
    // TODO: check for duplicate IDs
  }

  get allSessions(): Session[] {
    return [this.current, ...this.saved, ...this.previous]
  }

  toJSON() {
    return JSON.stringify(instanceToPlain(this))
  }

  static fromJSON(json: string) {
    const { current, saved, previous }: { current: Session } & SavedSessions =
      JSON.parse(json)
    // return plainToInstance(SessionsManager, parsed)
    return new SessionsManager({ current, saved, previous })
  }

  /**
   * add a session according to its status
   * any session with a 'current' status will be added to 'previous'
   */
  add(session: Session) {
    switch (session.status) {
      case SessionStatus.SAVED:
        this.addSaved(session)
        break
      case SessionStatus.CURRENT:
      case SessionStatus.PREVIOUS:
        this.addPrevious(session)
        break
    }
  }

  // TODO: When to overwrite current and unshift previous current to "previous"
  static async getCurrent(): Promise<Session> {
    return await Session.createFromCurrentWindows()
  }

  async updateCurrent() {
    await this.current.updateCurrentWindows()
    await this.handleChange()
  }

  @Exclude()
  updateCurrentDebounce = debounce(this.updateCurrent, 250)

  /**
   * Avoid conflicts with imported sessions by assigned a new ID
   */
  import(session: Session) {
    session.newId()
    this.add(session)
    this.handleChange()
  }

  async addSaved(session: Session) {
    session.status = SessionStatus.SAVED
    session.userSavedDate = new Date()
    this.saved.unshift(session)
    this.handleChange()
    return session
  }

  async addPrevious(session: Session) {
    session.status = SessionStatus.PREVIOUS
    this.previous.unshift(session)
    this.handleChange()
    return session
  }

  /**
   * Look in current, saved, previous
   */
  find(sessionId: string, status?: SessionStatusType) {
    if (status === SessionStatus.CURRENT) {
      return this.current
    } else {
      return this.search(sessionId, status)
    }
  }

  /**
   * Look only in saved, previous
   */
  search(
    sessionId: string,
    status?: Extract<SessionStatusType, 'previous' | 'saved'>
  ) {
    const sessions = status ? this[status] : this.allSessions
    const session = sessions.find((s) => s.id === sessionId)
    if (!session) {
      throw Error('session not found')
    }

    return session
  }

  update(
    sessionId: string,
    params: UpdateSessionData,
    status?: SessionStatusType
  ) {
    const session = this.find(sessionId, status)
    if (session) {
      session.update(params)
      this.handleChange()
    } else {
      new AppError({
        message: `Unable to find session by ID ${sessionId}`,
        context: logContext,
      })
    }
  }

  delete(
    sessionId: string,
    status: Extract<SessionStatusType, 'previous' | 'saved'>
  ) {
    const index = this[status].findIndex((s) => s.id === sessionId)
    if (index > -1) {
      this[status].splice(index, 1)
      this.handleChange()
    } else {
      new AppError({
        message: `Unable to find session by ID ${sessionId}`,
        context: logContext,
      })
    }
  }

  async download(sessionIds?: string[]) {
    await this.updateCurrent()
    const sessions = sessionIds
      ? this.allSessions.filter(({ id }) => sessionIds.includes(id))
      : this.allSessions

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
