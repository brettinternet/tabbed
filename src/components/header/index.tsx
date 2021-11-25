// import { Layout } from "utils/settings";
import { getMessage } from 'utils/i18n'
import { Icon, IconName } from 'components/icon'
import { Search } from './search'

type HeaderProps = {
  onClickSettings: () => void
}

export const Header: React.FC<HeaderProps> = ({ onClickSettings }) => (
  <header className="h-header flex justify-around items-center sticky top-0 lg:static">
    <ul className="w-full m-0 flex px-4">
      <li className="w-full mr-3 md:ml-auto md:mr-0 md:max-w-xs">
        <Search />
      </li>
      {onClickSettings && (
        <li className="lg:ml-auto">
          <button
            className="px-4 py-1 h-full rounded-sm"
            onClick={onClickSettings}
            aria-label={getMessage('open_settings', 'open settings')}
            title={getMessage('open_settings', 'open settings')}
          >
            <Icon name={IconName.SETTINGS} />
          </button>
        </li>
      )}
    </ul>
  </header>
)
