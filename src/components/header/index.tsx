import cn, { Argument as ClassNames } from 'classnames'

import { Dropdown } from 'components/dropdown'
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
        'h-header z-header flex justify-around items-center sticky top-0 md:static bg-white dark:bg-gray-900 border-b border-gray-200',
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
            iconProps={{ name: 'cog' }}
            menuItemsClassName="text-base"
            actions={[
              {
                onClick: () => {
                  shortcuts.set(true)
                },
                text: 'Shortcuts',
                iconProps: {
                  name: 'keyboard',
                },
              },
              {
                onClick: () => {
                  settings.set(true)
                },
                text: 'Settings',
                iconProps: {
                  name: 'adjust-vertical-alt',
                },
              },
            ]}
          />
        </li>
      </ul>
    </header>
  )
}
