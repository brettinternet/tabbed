import cn, { Argument as ClassNames } from 'classnames'

import { useAppDetails } from 'components/app/store'
import { Icon, IconName } from 'components/icon'

type ShortcutProps = {
  number: number
  className?: ClassNames
  onClick: () => void
  ariaLabel: string
}

export const Shortcut: React.FC<ShortcutProps> = ({
  number,
  className,
  onClick,
  ariaLabel,
}) => {
  const [appDetails] = useAppDetails()
  return (
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
        {appDetails?.os === 'mac' ? (
          <Icon
            name={IconName.KEYBOARD_COMMAND}
            ariaLabel="Command"
            size="xs"
          />
        ) : (
          'Ctrl'
        )}
        <span className="-mb-[1px]">{number}</span>
      </kbd>
    </button>
  )
}
