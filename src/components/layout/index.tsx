import { appName } from 'utils/env'
import { Head } from 'components/head'
import { Header } from 'components/header'

type LayoutProps = {
  onClickSettings: () => void
  height?: number
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  height,
  onClickSettings,
}) => (
  <div
    {...(height
      ? {
          id: 'popup',
          style: { height },
          className: 'scroll overflow-y-auto',
        }
      : {})}
  >
    <Head title={appName} />
    <Header onClickSettings={onClickSettings} />
    <main id="main" className="mx-auto max-w-screen-2xl">
      {children}
    </main>
  </div>
)
