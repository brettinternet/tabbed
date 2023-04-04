import { useFocusManager } from '@react-aria/focus'
import cn from 'classnames'
import { useCallback } from 'react'

import { Button, ButtonProps } from 'components/button'
import { Dropdown, DropdownProps } from 'components/dropdown'
import { FocusRing } from 'components/focus'
import { useFocusRing } from 'components/focus'
import { isHTMLElement } from 'utils/dom'

import {
  focusTabDown,
  focusTabUp,
  getClosestDraggableAncestor,
  handleKeyEvent,
} from './focus-draggable'

export const useFocusKeyHandler = () => {
  const { isFocusVisible, setAllowFocusRing, focusProps } = useFocusRing()
  const focusManager = useFocusManager()
  const activate = useCallback(() => {
    setAllowFocusRing(true)
  }, [setAllowFocusRing])
  const onKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      switch (event.key) {
        case 'Tab':
          if (isHTMLElement(event.target)) {
            const closestDraggable = getClosestDraggableAncestor(event.target)
            if (closestDraggable) {
              handleKeyEvent(event, activate)
              closestDraggable?.focus()
            }
          }
          break
        case 'ArrowRight':
          handleKeyEvent(event, activate)
          focusManager.focusNext({ wrap: true })
          break
        case 'ArrowLeft':
          handleKeyEvent(event, activate)
          focusManager.focusPrevious({ wrap: true })
          break
        case 'ArrowDown':
          if (isHTMLElement(event.target)) {
            handleKeyEvent(event, activate)
            const closestDraggable = getClosestDraggableAncestor(event.target)
            if (closestDraggable?.dataset.kind === 'tab') {
              focusTabDown(closestDraggable, 'vertical')
            } else {
              closestDraggable?.focus()
            }
          }
          break
        case 'ArrowUp':
          if (isHTMLElement(event.target)) {
            handleKeyEvent(event, activate)
            const closestDraggable = getClosestDraggableAncestor(event.target)
            if (closestDraggable?.dataset.kind === 'tab') {
              focusTabUp(closestDraggable, 'vertical')
            } else {
              closestDraggable?.focus()
            }
          }
          break
      }
    },
    [activate, focusManager]
  )
  return {
    isFocusVisible,
    focusProps: {
      ...focusProps,
      onKeyDown,
    },
  }
}

type FocusButtonProps = React.PropsWithChildren<ButtonProps>

export const FocusButton: React.FC<FocusButtonProps> = ({
  children,
  ...props
}) => {
  const {
    focusProps: { onKeyDown },
  } = useFocusKeyHandler()
  return (
    <FocusRing>
      <Button onKeyDown={onKeyDown} {...props}>
        {children}
      </Button>
    </FocusRing>
  )
}

export const FocusDropdown: React.FC<DropdownProps> = (dropdownProps) => {
  const {
    focusProps: { className, ...focusProps },
  } = useFocusKeyHandler()
  return (
    <Dropdown
      {...dropdownProps}
      buttonProps={{
        ...dropdownProps.buttonProps,
        ...focusProps,
        className: cn(className, dropdownProps.buttonProps?.className),
      }}
    />
  )
}
