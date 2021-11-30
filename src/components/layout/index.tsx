import { Fragment } from 'react'

import { Head } from 'components/head'
import { Header } from 'components/header'
import { appName } from 'utils/env'

type LayoutProps = {
  onClickSettings: () => void
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  onClickSettings,
}) => (
  <Fragment>
    <Head title={appName} />
    <Header
      onClickSettings={onClickSettings}
      className="mx-auto max-w-screen-2xl"
    />
    <main id="main" className="mx-auto max-w-screen-2xl">
      {children}
    </main>
  </Fragment>
)
