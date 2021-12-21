import React from 'react'
import ReactDOM from 'react-dom'
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

ReactDOM.render(
  <React.StrictMode>
    <AppWithErrorBoundary />
  </React.StrictMode>,
  document.getElementById('root')
)

reportWebVitals((...args) => {
  log.debug('reportWebVitals', ...args)
})
