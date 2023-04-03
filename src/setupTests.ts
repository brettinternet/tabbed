import '@testing-library/jest-dom'
// Setup https://github.com/extend-chrome/jest-chrome/issues/8
import { chrome } from 'jest-chrome'
import { levels } from 'loglevel'

import { Logger } from 'utils/logger'

// @ts-expect-error for browser polyfill
chrome.runtime.id = 'testid'
Object.assign(global, { chrome, browser: chrome })

// eslint-disable-next-line @typescript-eslint/no-var-requires
const browser = require('webextension-polyfill')

Object.assign(global, {
  browser,
  IS_PROD: false,
  IS_CHROME: true,
  IS_FIREFOX: false,
  BUILD_VERSION: 'test',
  BUILD_TIME: new Date().toISOString(),
  FEATURE_SAVE_SESSIONS: false,
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

type LoggerModule = {
  updateLogLevel: (enable?: boolean) => void
  logStartup: (details?: string[]) => void
  log: Logger
}

jest.doMock(
  'utils/logger',
  (): LoggerModule => ({
    logStartup: jest.fn(),
    updateLogLevel: jest.fn(),
    log: {
      levels,
      methodFactory: jest.fn(),
      trace: jest.fn(),
      debug: jest.fn(),
      log: jest.fn(),
      info: jest.fn(),
      warn: console.warn,
      error: console.error,
      setLevel: jest.fn(),
      getLevel: jest.fn(),
      setDefaultLevel: jest.fn(),
      enableAll: jest.fn(),
      disableAll: jest.fn(),
      resetLevel: jest.fn(),
    },
  })
)
