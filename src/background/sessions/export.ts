import { lightFormat } from 'date-fns'

import type { Session } from 'utils/browser/storage'
import { appName } from 'utils/env'
import { isDefined } from 'utils/helpers'
import { log } from 'utils/logger'
import type { DownloadSessionsOptions } from 'utils/messages'

import { throwSessionId } from '../errors'
import { getAllSessions, findSession } from './query'

const logContext = 'background/sessions/export'

export type SessionDataExport = {
  exportedDate: Date
  sessions?: Session[]
}

/**
 * TODO: Compress by removing extra fields
 */
export const downloadSessions = async ({
  sessionIds,
}: DownloadSessionsOptions) => {
  log.debug(logContext, 'downloadSession()', { sessionIds })

  let exportSessions: Session[] | undefined
  let title = appName
  if (isDefined(sessionIds) && !Array.isArray(sessionIds)) {
    const sessionId = sessionIds
    const session = await findSession(sessionId)
    if (session) {
      exportSessions = [session]
      if (session.title) {
        title = session.title
          .replace(/\\|\/|:|\?|\.|"|<|>|\|/g, '-')
          .replace(/^( )+/, '')
      }
    } else {
      throwSessionId(sessionId)
    }
  } else {
    let sessions = await getAllSessions()
    if (sessionIds) {
      sessions = sessions.filter((s) => sessionIds.includes(s.id))
    }
    exportSessions = sessions
  }

  if (exportSessions) {
    const now = new Date()
    const timestamp = lightFormat(now, 'yyyy-MM-dd-hh-mm-ss-SS')
    const data: SessionDataExport = {
      exportedDate: now,
      sessions: exportSessions,
    }
    const filename = `${title}-${timestamp}.json`
    const url = window.URL.createObjectURL(
      new Blob([JSON.stringify(data, null, '\t')], {
        type: 'application/json',
      })
    )

    // https://stackoverflow.com/a/19328891
    const anchor = document.createElement('a')
    anchor.style.display = 'none'
    anchor.setAttribute('href', url)
    anchor.setAttribute('download', filename)
    document.body.append(anchor)
    anchor.click()
    window.URL.revokeObjectURL(url)
    anchor.remove()
  } else {
    throw Error('Unable to read sessions')
  }
}
