import { Link } from 'components/link'
import {
  appName,
  authorUrl,
  privacyPolicyUrl,
  repoUrl,
  storeUrl,
} from 'utils/env'

const H1: React.FC<React.PropsWithChildren> = ({ children }) => (
  <h1 className="text-xl text-center font-light">{children}</h1>
)

export const About: React.FC = () => {
  return (
    <div className="space-y-6 flex flex-col items-center max-w-xs mx-auto text-center">
      <section className="space-y-4">
        <H1>App</H1>
        <p>
          <Link newWindow href={storeUrl}>
            {appName}
          </Link>{' '}
          is a browser extension experiment to visualize and organize window
          tabs.
        </p>
        <ul className="space-y-2">
          <li>
            <Link newWindow href={privacyPolicyUrl}>
              Privacy policy
            </Link>
          </li>
          <li>
            Authored by{' '}
            <Link newWindow href={authorUrl}>
              Brett
            </Link>
          </li>
        </ul>
      </section>

      <hr className="w-10" />

      <section className="space-y-4">
        <H1>Build</H1>
        <ul className="space-y-2">
          {BUILD_TIME && (
            <li>
              Build date: {new Date(BUILD_TIME).toISOString().substring(0, 10)}
            </li>
          )}
          {BUILD_VERSION && <li>Version: {BUILD_VERSION}</li>}
          <li>
            <Link newWindow href={repoUrl}>
              View source
            </Link>
          </li>
        </ul>
      </section>
    </div>
  )
}
