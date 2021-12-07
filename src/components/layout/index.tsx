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
    <Header onClickSettings={onClickSettings} />
    <main id="main">{children}</main>
  </Fragment>
)
