import cn, { Argument as ClassNames } from 'classnames'

import { Button } from 'components/button'
import { Icon, IconName } from 'components/icon'
import { openExtensionNewTab } from 'utils/browser'
import { appName } from 'utils/env'

import { ModalDropdown } from './modal-dropdown'

// import { Search } from './search'

export * from './constants'

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
          <span className="font-bold text-lg">{appName}</span>
        </li>
        {/* TODO: */}
        {/* <li className="w-full mr-3 md:ml-auto md:mr-0 md:max-w-xs">
          <Search />
        </li> */}
        <li className="hidden xxs:block ml-auto md:hidden">
          <Button onClick={openExtensionNewTab}>Open in tab</Button>
        </li>
        <li className="ml-2 md:ml-auto">
          <ModalDropdown />
        </li>
      </ul>
    </header>
  )
}
