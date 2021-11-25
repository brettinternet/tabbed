import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { App } from 'components/app'
import { reportWebVitals } from 'utils/report-web-vitals'
import { log } from 'utils/logger'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

reportWebVitals((...args) => {
  log.debug('reportWebVitals', ...args)
})
