import { Menu as M } from '@headlessui/react'
import cn, { Argument as ClassNames } from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { usePopper } from 'react-popper'

import {
  Button,
  ButtonProps,
  getClass as getButtonClass,
} from 'components/button'
import { Icon } from 'components/icon'
import { Portal } from 'utils/window'

const MenuItem: React.FC<{ buttonProps: ButtonProps }> = ({ buttonProps }) => (
  <M.Item as="li">
    {({ active }) => (
      <Button
        variant="none"
        shape="item"
        {...buttonProps}
        className={cn(buttonProps.className, active && 'bg-gray-200')}
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
  buttonProps?: ButtonProps
} & (Actions | GroupedActions)

export const Dropdown: React.FC<MenuProps> = (props) => {
  const { className, buttonProps: triggerButtonProps } = props
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const { styles, attributes } = usePopper(trigger, container, {
    placement: 'bottom-end',
  })

  return (
    <M as="div" className={cn('relative', className)}>
      {({ open }) => (
        <>
          <M.Button
            ref={setTrigger}
            aria-label="toggle menu"
            className={cn(
              getButtonClass({
                variant: 'none',
                shape: 'icon',
                ...triggerButtonProps,
              }),
              triggerButtonProps?.className
            )}
            {...triggerButtonProps}
          >
            <Icon name="more-vertical" className="pointer-events-none" />
          </M.Button>
          <AnimatePresence>
            {open && (
              <Portal>
                <div
                  ref={setContainer}
                  style={styles.popper}
                  {...attributes.popper}
                >
                  <M.Items
                    static
                    as={motion.ul}
                    initial={{ opacity: 0, scale: 0.95, y: '-0.5rem' }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      transition: { duration: 0.1 },
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                      y: '-0.5rem',
                      transition: { duration: 0.15 },
                    }}
                    className={cn(
                      'z-menu min-w-32 rounded shadow-lg bg-white dark:bg-gray-800',
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
                </div>
              </Portal>
            )}
          </AnimatePresence>
        </>
      )}
    </M>
  )
}
