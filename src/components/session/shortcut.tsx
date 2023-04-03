import cn, { Argument as ClassNames } from 'classnames'
import { Fragment } from 'react'

import { isMac } from 'components/app/store'
import { Icon, IconName } from 'components/icon'

import { useFocusKeyHandler } from './focus-button'

type Modifier = 'command' | 'control' | 'option' | 'alt' | 'shift'
type ModifierGroup = NonNullable<ShortcutProps['modifiers']>[number]

const T: React.FC<React.PropsWithChildren> = ({ children }) => (
  <span className="-mb-[2px]">{children}</span>
)

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
      return <T>Ctrl</T>
    case 'alt':
      return <T>Alt</T>
    case 'shift':
      return <T>Shift</T>
  }
}

type ShortcutProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
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
  ...props
}) => {
  const { focusProps } = useFocusKeyHandler()
  return (
    <button
      {...props}
      {...focusProps}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'flex flex-row items-center justify-center h-full space-x-1 border border-dotted rounded px-1',
        'border-gray-400 text-gray-500 dark:border-gray-600 dark:text-gray-400',
        className,
        focusProps.className
      )}
    >
      <kbd className="text-xxs inline-flex items-center">
        {modifiers?.length &&
          modifiers.map((modifierGroup, index) => (
            <Fragment key={index}>
              {displayModifier(modifierGroup)}
              <T>+</T>
            </Fragment>
          ))}
        <T>{value}</T>
      </kbd>
    </button>
  )
}
