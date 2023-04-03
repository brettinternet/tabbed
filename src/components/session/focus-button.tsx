import { FocusRing, useFocusManager, useFocusRing } from '@react-aria/focus'
import { focusRingClass } from 'styles'

import { Button, ButtonProps } from 'components/button'
import { Dropdown, DropdownProps } from 'components/dropdown'
import { isHTMLElement } from 'utils/dom'

import {
  focusTabDown,
  focusTabUp,
  getClosestDraggableAncestor,
  handleKeyEvent,
} from './focus-draggable'

export const useFocusKeyHandler = () => {
  const { isFocusVisible, focusProps } = useFocusRing()
  const focusManager = useFocusManager()
  const onKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
    switch (event.key) {
      case 'Tab': {
        if (isHTMLElement(event.target)) {
          const closestDraggable = getClosestDraggableAncestor(event.target)
          if (closestDraggable) {
            handleKeyEvent(event)
            closestDraggable?.focus()
          }
        }
        break
      }
      case 'ArrowRight':
        handleKeyEvent(event)
        focusManager.focusNext({ wrap: true })
        break
      case 'ArrowLeft':
        handleKeyEvent(event)
        focusManager.focusPrevious({ wrap: true })
        break
      case 'ArrowDown': {
        if (isHTMLElement(event.target)) {
          handleKeyEvent(event)
          const closestDraggable = getClosestDraggableAncestor(event.target)
          if (closestDraggable?.dataset.kind === 'tab') {
            focusTabDown(event.target)
          } else {
            closestDraggable?.focus()
          }
        }
        break
      }
      case 'ArrowUp': {
        if (isHTMLElement(event.target)) {
          handleKeyEvent(event)
          const closestDraggable = getClosestDraggableAncestor(event.target)
          if (closestDraggable?.dataset.kind === 'tab') {
            focusTabUp(event.target)
          } else {
            closestDraggable?.focus()
          }
        }
        break
      }
    }
  }
  return {
    isFocusVisible,
    focusProps: {
      className: isFocusVisible ? focusRingClass : undefined,
      onKeyDown,
      ...focusProps,
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
    <FocusRing focusRingClass={focusRingClass}>
      <Button onKeyDown={onKeyDown} {...props}>
        {children}
      </Button>
    </FocusRing>
  )
}

export const FocusDropdown: React.FC<DropdownProps> = (dropdownProps) => {
  const { focusProps } = useFocusKeyHandler()
  return (
    <Dropdown
      {...dropdownProps}
      buttonProps={{
        ...dropdownProps.buttonProps,
        ...focusProps,
      }}
    />
  )
}
