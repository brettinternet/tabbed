import { Menu as M } from '@headlessui/react'
import { Placement } from '@popperjs/core'
import cn, { Argument as ClassNames } from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { usePopper } from 'react-popper'

import {
  Button,
  ButtonProps,
  getClass as getButtonClass,
} from 'components/button'
import { Icon, IconName, IconProps } from 'components/icon'
import { isDefined } from 'utils/helpers'
import { Portal } from 'utils/portal'

export type DropdownButtonProps = {
  onClick: () => void
} & Omit<ButtonProps, 'onClick'>

const MenuItem: React.FC<{ buttonProps: DropdownButtonProps }> = ({
  buttonProps,
}) => (
  <M.Item
    as={Button}
    variant="item"
    shape="item"
    {...buttonProps}
    className={({ active }) =>
      cn(buttonProps.className, active && 'bg-gray-200 dark:bg-gray-700')
    }
  />
)

type Actions = {
  actions: DropdownButtonProps[]
}

type GroupedActions = {
  actionGroups: DropdownButtonProps[][]
}

type MenuProps = {
  className?: ClassNames
  buttonProps?: ButtonProps
  dropdownOffset?: number
  iconProps?: Partial<IconProps>
  menuItemsClassName?: ClassNames
  portalEnabled?: boolean
  animatedExit?: boolean
  placement?: Placement
} & (Actions | GroupedActions) &
  React.PropsWithChildren

export const Dropdown: React.FC<MenuProps> = (props) => {
  const {
    children,
    className,
    buttonProps: triggerButtonProps,
    dropdownOffset,
    iconProps,
    menuItemsClassName,
    portalEnabled = true,
    animatedExit = true,
    placement = 'bottom-end',
  } = props
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const { styles, attributes } = usePopper(trigger, container, {
    placement,
    modifiers: isDefined(dropdownOffset)
      ? [{ name: 'offset', options: { offset: [0, dropdownOffset] } }]
      : undefined,
  })

  return (
    <M as="div" className={cn('relative', className)}>
      {({ open }) => (
        <>
          <M.Button
            ref={setTrigger}
            aria-label="toggle menu"
            {...triggerButtonProps}
            className={cn(
              getButtonClass({
                variant: 'none',
                shape: 'icon',
                ...triggerButtonProps,
              }),
              triggerButtonProps?.className
            )}
          >
            {children || (
              <Icon
                name={IconName.MORE}
                className="pointer-events-none"
                {...iconProps}
              />
            )}
          </M.Button>
          <AnimatePresence>
            {open && (
              <Portal enabled={portalEnabled}>
                <div
                  ref={setContainer}
                  style={styles.popper}
                  {...attributes.popper}
                  className="z-menu"
                >
                  <M.Items
                    static
                    as={motion.div}
                    initial={{ opacity: 0, scale: 0.95, y: '-0.5rem' }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      transition: { duration: 0.1 },
                    }}
                    exit={
                      animatedExit
                        ? {
                            opacity: 0,
                            scale: 0.95,
                            y: '-0.5rem',
                            transition: { duration: 0.15 },
                          }
                        : undefined
                    }
                    className={cn(
                      'min-w-32 rounded shadow-lg bg-white dark:bg-gray-800 border border-transparent dark:border-gray-600',
                      'actionGroups' in props
                        ? 'divide-y divide-gray-100 dark:divide-gray-600'
                        : 'p-1',
                      'ring-1 ring-black ring-opacity-5 focus:outline-none',
                      menuItemsClassName
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
                </div>
              </Portal>
            )}
          </AnimatePresence>
        </>
      )}
    </M>
  )
}
