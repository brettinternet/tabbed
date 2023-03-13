import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import browser from 'webextension-polyfill'

import { AppWithErrorBoundary } from 'components/app'
import { isProd } from 'utils/env'
import { log } from 'utils/logger'
import { reportWebVitals } from 'utils/report-web-vitals'

import './index.css'

// for debugging
if (!isProd) {
  window.browser = browser
}

const container = document.getElementById('root')
if (!container) {
  throw Error('Missing React root')
}
const root = createRoot(container)

root.render(
  <StrictMode>
    <AppWithErrorBoundary />
  </StrictMode>
)

reportWebVitals((...args) => {
  log.debug('reportWebVitals', ...args)
})
