import { instanceToPlain, plainToInstance, Type } from 'class-transformer'

import { AppError } from 'utils/logger'

import { getAllWindows } from './query'
import {
  Session,
  SessionStatus,
  SessionStatusType,
  UpdateSessionOptions,
} from './session'
import { LocalStorage } from './storage'

const logContext = 'utils/browser/sessions'

type SavedSessions = { previous: Session[]; saved: Session[] }

/**
 * Since subclasses are reasonably coupled anyway, we do use circular references
 * To reference parent class, but that's probably okay
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management#cycles_are_no_longer_a_problem
 * `class-transformer` serialization ignores circular references for us
 */
export class SessionsManager {
  @Type(() => Session)
  current: Session

  @Type(() => Session)
  saved: Session[]

  @Type(() => Session)
  previous: Session[]

  constructor(current: Session, saved: Session[], previous: Session[]) {
    this.current = current
    this.saved = saved
    this.previous = previous
  }

  static async load(): Promise<SessionsManager> {
    const { saved = [], previous = [] } =
      (await LocalStorage.get<SavedSessions>(LocalStorage.key.SESSIONS)) || {}

    const startTime = performance.now()
    const current = await this.getCurrent()
    const endTime = performance.now()
    console.log(`Call to getCurrent took ${endTime - startTime} milliseconds`)
    return new SessionsManager(current, saved, previous)
  }

  async save() {
    this.validate()
    await LocalStorage.set(LocalStorage.key.SESSIONS, {
      saved: this.saved,
      previous: this.previous,
    })
  }

  validate() {
    this.saved.map((session) => ({ ...session, status: SessionStatus.SAVED }))
    this.previous.map((session) => ({
      ...session,
      status: SessionStatus.PREVIOUS,
    }))
    this.current.status = SessionStatus.CURRENT
  }

  get allSessions(): Session[] {
    return [this.current, ...this.saved, ...this.previous]
  }

  toJSON() {
    return JSON.stringify(instanceToPlain(this))
  }

  static fromJSON(json: string) {
    const parsed: { current: Session } & SavedSessions = JSON.parse(json)
    return new SessionsManager(parsed.current, parsed.saved, parsed.previous)
  }

  /**
   * add a session according to its status
   */
  add(session: Session) {
    switch (session.status) {
      case SessionStatus.CURRENT:
        this.addCurrent(session)
        break
      case SessionStatus.SAVED:
        this.addSaved(session)
        break
      case SessionStatus.PREVIOUS:
        this.addPrevious(session)
        break
    }
  }

  static async getCurrent(): Promise<Session> {
    return new Session({
      windows: await getAllWindows({ populate: true }, true),
      status: SessionStatus.CURRENT,
      active: true,
    })
  }

  /**
   * Avoid conflicts with imported sessions by assigned a new ID
   */
  import(session: Session) {
    session.newId()
    this.add(session)
  }

  /**
   * Adds session to current session
   * If there's already a current session, then it saved current to previous
   * If no session is provided, then the current session is pulled from extension API
   */
  async addCurrent(session?: Session) {
    if (this.current) {
      await this.addPrevious(this.current)
    }
    this.current = session || (await SessionsManager.getCurrent())
    return session
  }

  async addSaved(session: Session) {
    session.status = SessionStatus.SAVED
    session.userSavedDate = new Date()
    this.saved.unshift(session)
    return session
  }

  /**
   * To add current to previous, simply use `addCurrent`
   */
  private async addPrevious(session: Session) {
    session.status = SessionStatus.PREVIOUS
    this.previous.unshift(session)
    return session
  }

  /**
   * Look in current, saved, previous
   */
  get(sessionId: string, status?: SessionStatusType) {
    if (status === SessionStatus.CURRENT) {
      return this.current
    } else {
      return this.find(sessionId, status)
    }
  }

  /**
   * Look only in saved, previous
   */
  find(
    sessionId: string,
    status?: Extract<SessionStatusType, 'previous' | 'saved'>
  ) {
    const sessions = status ? this[status] : this.allSessions
    return sessions.find((s) => s.id === sessionId)
  }

  update(
    sessionId: string,
    params: UpdateSessionOptions,
    status?: SessionStatusType
  ) {
    const session = this.get(sessionId, status)
    if (session) {
      session.update(params)
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
    } else {
      new AppError({
        message: `Unable to find session by ID ${sessionId}`,
        context: logContext,
      })
    }
  }
}
