import { Fragment } from 'react'

import { Head } from 'components/head'
import { Header } from 'components/header'
import { appName } from 'utils/env'

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Fragment>
    <Head title={appName} />
    <Header />
    <main id="main" className="md:pt-header">
      {children}
    </main>
  </Fragment>
)
