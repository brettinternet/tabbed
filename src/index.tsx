import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import browser from 'webextension-polyfill'

import { AppWithErrorBoundary } from 'components/app'
import { log } from 'utils/logger'

import './index.css'

// for debugging
if (!IS_PROD) {
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

if (!IS_PROD) {
  import('utils/report-web-vitals').then(({ reportWebVitals }) => {
    reportWebVitals((...args) => {
      log.debug('reportWebVitals', ...args)
    })
  })
}
