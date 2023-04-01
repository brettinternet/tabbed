import cn, { Argument as ClassNames } from 'classnames'
import { Fragment } from 'react'

import { isMac } from 'components/app/store'
import { Icon, IconName } from 'components/icon'

type Modifier = 'command' | 'control' | 'option' | 'alt' | 'shift'
type ModifierGroup = NonNullable<ShortcutProps['modifiers']>[number]

const displayModifier = (modifier: ModifierGroup) => {
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
  }

  switch (modifier.other) {
    case 'control':
      return 'Ctrl'
    case 'alt':
      return 'Alt'
    case 'shift':
      return 'Shift'
  }
}

type ShortcutProps = {
  value: number | string
  className?: ClassNames
  onClick: React.MouseEventHandler<HTMLButtonElement>
  ariaLabel: string
  modifiers?: Array<{
    mac?: Modifier
    other: Modifier
  }>
}

export const Shortcut: React.FC<ShortcutProps> = ({
  value,
  className,
  onClick,
  ariaLabel,
  modifiers,
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
      {modifiers?.length &&
        modifiers.map((modifierGroup, index) => (
          <Fragment key={index}>{displayModifier(modifierGroup)}+</Fragment>
        ))}
      <span className="-mb-[1px]">{value}</span>
    </kbd>
  </button>
)
