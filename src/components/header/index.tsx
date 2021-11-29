import cn, { Argument as ClassNames } from 'classnames'

import { Button } from 'components/button'
import { getMessage } from 'utils/i18n'

import { Search } from './search'

type HeaderProps = {
  onClickSettings: () => void
  className?: ClassNames
}

export const Header: React.FC<HeaderProps> = ({
  onClickSettings,
  className,
}) => (
  <header
    className={cn(
      'h-header flex justify-around items-center sticky top-0 lg:static',
      className
    )}
  >
    <ul className="w-full m-0 flex items-center justify-between px-6">
      <li className="w-full mr-3 md:ml-auto md:mr-0 md:max-w-xs">
        <Search />
      </li>
      {onClickSettings && (
        <li className="lg:ml-auto">
          <Button
            onClick={onClickSettings}
            aria-label={getMessage('open_settings', 'open settings')}
            title={getMessage('open_settings', 'open settings')}
            variant="transparent"
            iconProps={{ name: 'cog' }}
          />
        </li>
      )}
    </ul>
  </header>
)
