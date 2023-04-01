import cn, { Argument as ClassNames } from 'classnames'

import { Icon, IconName } from 'components/icon'

import { ModalDropdown } from './modal-dropdown'

// import { Search } from './search'

type HeaderProps = {
  className?: ClassNames
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header
      className={cn(
        'fixed h-header z-header flex items-center top-0 md:fixed w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <ul className="w-full m-0 flex items-center justify-between px-6">
        <li className="md:mr-auto flex flex-row items-center text-gray-700 dark:text-gray-200">
          <Icon name={IconName.TAB} className="mr-2" />
          <span className="font-bold text-lg">Tabbed</span>
        </li>
        {/* TODO: */}
        {/* <li className="w-full mr-3 md:ml-auto md:mr-0 md:max-w-xs">
          <Search />
        </li> */}
        <li className="md:ml-auto">
          <ModalDropdown />
        </li>
      </ul>
    </header>
  )
}
