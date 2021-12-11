import cn, { Argument as ClassNames } from 'classnames'

import { Dropdown } from 'components/dropdown'
import { IconName } from 'components/icon'
import { useModal } from 'components/modal/store'

import { Search } from './search'

type HeaderProps = {
  className?: ClassNames
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const { settings, shortcuts } = useModal()

  return (
    <header
      className={cn(
        'h-header z-header flex justify-around items-center sticky top-0 md:static bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <ul className="w-full m-0 flex items-center justify-between px-6">
        <li className="w-full mr-3 md:ml-auto md:mr-0 md:max-w-xs">
          <Search />
        </li>
        <li className="md:ml-auto">
          <Dropdown
            buttonProps={{
              variant: 'transparent',
            }}
            iconProps={{ name: IconName.MORE }}
            menuItemsClassName="text-base text-gray-800"
            actions={[
              {
                onClick: () => {
                  shortcuts.set(true)
                },
                text: 'Shortcuts',
                iconProps: {
                  name: IconName.KEYBOARD,
                  size: 'sm',
                },
              },
              {
                onClick: () => {
                  settings.set(true)
                },
                text: 'Settings',
                iconProps: {
                  name: IconName.SETTINGS,
                  size: 'sm',
                },
              },
            ]}
          />
        </li>
      </ul>
    </header>
  )
}
