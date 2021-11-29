import { Menu as M, Transition } from '@headlessui/react'
import cn, { Argument as ClassNames } from 'classnames'
import { Fragment } from 'react'

import { Button, ButtonProps, getClass } from 'components/button'
import { Icon } from 'components/icon'

const MenuItem: React.FC<{ buttonProps: ButtonProps }> = ({ buttonProps }) => (
  <M.Item as="li">
    {({ active }) => (
      <Button
        variant="none"
        shape="item"
        {...buttonProps}
        className={cn(
          'disabled:text-gray-600',
          buttonProps.className,
          active && 'bg-gray-200'
        )}
      />
    )}
  </M.Item>
)

type Actions = {
  actions: ButtonProps[]
}

type GroupedActions = {
  actionGroups: ButtonProps[][]
}

type MenuProps = {
  className?: ClassNames
  buttonClassName?: ClassNames
  buttonVariant?: ButtonProps['variant']
  buttonShape?: ButtonProps['shape']
} & (Actions | GroupedActions)

export const Dropdown: React.FC<MenuProps> = (props) => {
  const { className, buttonVariant, buttonShape } = props
  return (
    <M as="div" className={cn('relative', className)}>
      <M.Button
        className={cn(
          getClass({ variant: buttonVariant, shape: buttonShape }),
          props.buttonClassName
        )}
        aria-label="toggle menu"
      >
        <Icon name="more-vertical" className="pointer-events-none" />
      </M.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <M.Items
          as="ul"
          className={cn(
            'z-menu absolute right-0 w-32 mt-1 origin-top-right rounded shadow-lg bg-white dark:bg-gray-800',
            'actionGroups' in props && 'divide-y divide-gray-100',
            'ring-1 ring-black ring-opacity-5 focus:outline-none'
          )}
        >
          {'actionGroups' in props
            ? props.actionGroups.map((groups, index) => (
                <div key={index} className="p-1">
                  {groups.map((buttonProps, innerIndex) => (
                    <MenuItem
                      key={`${index}-${innerIndex}`}
                      buttonProps={buttonProps}
                    />
                  ))}
                </div>
              ))
            : props.actions.map((buttonProps, index) => (
                <MenuItem key={index} buttonProps={buttonProps} />
              ))}
        </M.Items>
      </Transition>
    </M>
  )
}
