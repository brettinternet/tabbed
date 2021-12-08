import React from 'react'
import ReactDOM from 'react-dom'
import 'reflect-metadata'
import browser from 'webextension-polyfill'

import { App } from 'components/app'
import { isProd } from 'utils/env'
import { log } from 'utils/logger'
import { reportWebVitals } from 'utils/report-web-vitals'

import './index.css'

if (!isProd) {
  window.browser = browser
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

reportWebVitals((...args) => {
  log.debug('reportWebVitals', ...args)
})
