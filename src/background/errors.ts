export const throwSessionId = (sessionId: string) => {
  throw Error(`Unable to find session by ID ${sessionId}`)
}

export const throwWindowId = (windowId: number) => {
  throw Error(`Unable to find window by ID ${windowId}`)
}

export const throwTabId = (tabId: number) => {
  throw Error(`Unable to find tab by ID ${tabId}`)
}
