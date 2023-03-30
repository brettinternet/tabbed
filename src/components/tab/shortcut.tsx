import cn, { Argument as ClassNames } from 'classnames'

import { isMac } from 'components/app/store'
import { Icon, IconName } from 'components/icon'

type ShortcutProps = {
  value: number | string
  className?: ClassNames
  onClick: () => void
  ariaLabel: string
}

export const Shortcut: React.FC<ShortcutProps> = ({
  value,
  className,
  onClick,
  ariaLabel,
}) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className={cn(
      'inline-flex flex-row items-center justify-center space-x-1 border rounded px-1',
      'border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400',
      className
    )}
  >
    <kbd className="shadow-sm text-xxs flex-1 inline-flex items-center h-[20px] leading-[20px]">
      {isMac ? (
        <Icon name={IconName.KEYBOARD_COMMAND} ariaLabel="Command" size="xs" />
      ) : (
        'Ctrl'
      )}
      <span className="-mb-[1px]">{value}</span>
    </kbd>
  </button>
)
