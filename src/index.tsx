import React from 'react'
import ReactDOM from 'react-dom'

import { App } from 'components/app'
import { log } from 'utils/logger'
import { reportWebVitals } from 'utils/report-web-vitals'

import './index.css'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

reportWebVitals((...args) => {
  log.debug('reportWebVitals', ...args)
})
