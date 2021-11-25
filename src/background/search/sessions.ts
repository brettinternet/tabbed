import Fuse from 'fuse.js'

import { getAllSessions } from 'background/sessions/query'
import type { Session } from 'utils/browser/storage'

let fuse: Fuse<Session>
/**
 * @docs https://fusejs.io/api/options.html
 */
const options: Fuse.IFuseOptions<Session> = {
  includeScore: true,
  includeMatches: true,
  threshold: 0.2,
  keys: [
    {
      name: 'title', // session title
      weight: 2,
    },
    'windows.tabs.url',
    'windows.tabs.pendingUrl',
    'windows.tabs.title',
  ],
}

const setup = async () => {
  const list = await getAllSessions()
  fuse = new Fuse(list, options)
}

void setup()

const updateCollection = async () => {
  const list = await getAllSessions()
  fuse.setCollection(list)
}

export type SearchSessionsResults = Fuse.FuseResult<Session>[]

export const searchSessions = async (
  text: string
): Promise<SearchSessionsResults> => {
  await updateCollection()
  return fuse.search(text)
}
