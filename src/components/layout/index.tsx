import { Fragment } from 'react'

import { Head } from 'components/head'
import { Header } from 'components/header'
import { appName } from 'utils/env'

export const Layout: React.FC = ({ children }) => (
  <Fragment>
    <Head title={appName} />
    <Header />
    <main id="main">{children}</main>
  </Fragment>
)
