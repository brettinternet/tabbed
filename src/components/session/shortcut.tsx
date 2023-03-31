import cn, { Argument as ClassNames } from 'classnames'

import { isMac } from 'components/app/store'
import { Icon, IconName } from 'components/icon'

type Modifier = 'command' | 'control' | 'option' | 'alt'

const displayModifier = (modifier: NonNullable<ShortcutProps['modifier']>) => {
  if (isMac) {
    switch (modifier.mac) {
      case 'command':
        return (
          <Icon
            name={IconName.KEYBOARD_COMMAND}
            ariaLabel="Command"
            size="xs"
          />
        )
      case 'option':
        return (
          <Icon name={IconName.KEYBOARD_OPTION} ariaLabel="Command" size="xs" />
        )
    }
  } else {
    switch (modifier.other) {
      case 'command':
        return 'Ctrl'
      case 'alt':
        return 'Alt'
    }
  }
}

type ShortcutProps = {
  value: number | string
  className?: ClassNames
  onClick: React.MouseEventHandler<HTMLButtonElement>
  ariaLabel: string
  modifier?: {
    mac: Modifier
    other: Modifier
  }
}

export const Shortcut: React.FC<ShortcutProps> = ({
  value,
  className,
  onClick,
  ariaLabel,
  modifier,
}) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className={cn(
      'inline-flex flex-row items-center justify-center space-x-1 border border-dotted rounded px-1',
      'border-gray-400 text-gray-500 dark:border-gray-600 dark:text-gray-400',
      className
    )}
  >
    <kbd className="shadow-sm text-xxs flex-1 inline-flex items-center h-[20px] leading-[20px]">
      {modifier && displayModifier(modifier)}
      <span className="-mb-[1px]">{value}</span>
    </kbd>
  </button>
)
