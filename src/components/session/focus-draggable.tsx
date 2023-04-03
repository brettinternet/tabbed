import { FocusRing } from '@react-aria/focus'
import cn, { Argument as ClassNames } from 'classnames'
import { forwardRef } from 'react'
import { focusRingClass, focusRingClassInset, headerHeight } from 'styles'

import { ifHTMLElement, isHTMLElement } from 'utils/dom'
import { useMedia } from 'utils/window'

import { draggableDataAttrName } from './dnd-store'

export const kindDataAttrName = 'data-kind'

type AppDirection = 'vertical' | 'horizontal'
type DraggableKind = 'tab' | 'window'

export const handleKeyEvent = (event: React.KeyboardEvent<HTMLElement>) => {
  event.preventDefault()
  event.stopPropagation()
}

export const getClosestDraggableAncestor = (
  element?: HTMLElement,
  kind?: DraggableKind
) =>
  ifHTMLElement(
    element?.closest(
      `[${draggableDataAttrName}]${
        kind ? `[${kindDataAttrName}="${kind}"]` : ''
      }`
    )
  )

const handleFocusDraggable: React.MouseEventHandler<HTMLElement> = (event) => {
  const draggable = getClosestDraggableAncestor(ifHTMLElement(event.target))
  ifHTMLElement(draggable)?.focus()
}

type ScrollOptions = {
  direction: AppDirection
  kind: DraggableKind
}

const scrollToElement = (
  element: HTMLElement,
  { kind, direction }: ScrollOptions = { direction: 'vertical', kind: 'window' }
) => {
  if (
    kind === 'window' &&
    direction === 'vertical' &&
    element.scrollHeight > window.innerHeight
  ) {
    const yOffset = -headerHeight
    const rect = element.getBoundingClientRect()
    const top = rect.top + window.pageYOffset + yOffset
    // smooth behavior here causes unnecessary scroll in some cases
    window.scrollTo({
      top,
    })
  } else {
    element.scrollIntoView({
      block: 'center',
      inline: 'center',
      behavior: 'smooth',
    })
  }
}

const queryNeighborTab = (
  tab: HTMLElement,
  windowElement: HTMLElement,
  neightborWindowelement: HTMLElement
): HTMLElement | undefined => {
  const draggableCurrentChildren = windowElement?.querySelectorAll(
    `[${draggableDataAttrName}][${kindDataAttrName}="tab"]`
  )
  const draggableNeighborChildren = neightborWindowelement?.querySelectorAll(
    `[${draggableDataAttrName}][${kindDataAttrName}="tab"]`
  )
  if (draggableCurrentChildren && draggableNeighborChildren) {
    const index = Array.from(draggableCurrentChildren).indexOf(tab)
    return (
      ifHTMLElement(draggableNeighborChildren[index]) ||
      ifHTMLElement(
        draggableNeighborChildren[draggableNeighborChildren.length - 1]
      )
    )
  }
}

const isKind = (kind: string): kind is DraggableKind =>
  ['tab', 'window'].includes(kind)

export const focusFirstDraggable = (element = document.body) => {
  const firstDraggable = ifHTMLElement(
    element.querySelector(`[${draggableDataAttrName}]`)
  )
  if (firstDraggable) {
    firstDraggable.focus()
    const kind = firstDraggable.dataset.kind
    scrollToElement(firstDraggable, {
      kind: kind && isKind(kind) ? kind : 'window',
      direction: 'vertical',
    })
  }
}

const getLastDraggable = (element: HTMLElement) => {
  const draggables = element.querySelectorAll(`[${draggableDataAttrName}]`)
  return ifHTMLElement(draggables[draggables.length - 1])
}

const focusLastDraggable = (element: HTMLElement) => {
  const lastDraggable = getLastDraggable(element)
  if (lastDraggable) {
    lastDraggable.focus()
    const kind = lastDraggable.dataset.kind
    scrollToElement(lastDraggable, {
      kind: kind && isKind(kind) ? kind : 'window',
      direction: 'vertical',
    })
  }
}

const focusNextWindow = (element: HTMLElement, direction: AppDirection) => {
  const nextElement = ifHTMLElement(element.nextElementSibling)
  if (nextElement?.hasAttribute(draggableDataAttrName)) {
    nextElement.focus()
    scrollToElement(nextElement, { kind: 'window', direction })
  }
}

const focusPreviousWindow = (element: HTMLElement, direction: AppDirection) => {
  const previousElement = ifHTMLElement(element.previousElementSibling)
  if (previousElement?.hasAttribute(draggableDataAttrName)) {
    previousElement.focus()
    scrollToElement(previousElement, { kind: 'window', direction })
  }
}

export const focusTabUp = (
  element: HTMLElement,
  direction: AppDirection = 'vertical'
) => {
  const previousElement = ifHTMLElement(element.previousElementSibling)
  if (previousElement?.hasAttribute(draggableDataAttrName)) {
    previousElement.focus()
    scrollToElement(previousElement, { kind: 'tab', direction })
  } else {
    const draggableAncestor = getClosestDraggableAncestor(element, 'window')
    if (draggableAncestor) {
      draggableAncestor.focus()
      scrollToElement(draggableAncestor, { kind: 'window', direction })
    }
  }
}

export const focusTabDown = (
  element: HTMLElement,
  direction: AppDirection = 'vertical'
) => {
  const nextElement = ifHTMLElement(element.nextElementSibling)
  if (nextElement?.hasAttribute(draggableDataAttrName)) {
    nextElement.focus()
    scrollToElement(nextElement, { kind: 'tab', direction })
  }
}

const focusTabRight = (element: HTMLElement, direction: AppDirection) => {
  const parentWindowElement = getClosestDraggableAncestor(element, 'window')
  const nextWindowElement = ifHTMLElement(
    parentWindowElement?.nextElementSibling
  )
  if (
    parentWindowElement &&
    nextWindowElement &&
    nextWindowElement?.hasAttribute(draggableDataAttrName)
  ) {
    const target =
      queryNeighborTab(element, parentWindowElement, nextWindowElement) ||
      nextWindowElement
    target.focus()
    scrollToElement(target, { kind: 'tab', direction })
  }
}

const focusTabLeft = (element: HTMLElement, direction: AppDirection) => {
  const parentWindowElement = getClosestDraggableAncestor(element, 'window')
  const previousWindowElement = ifHTMLElement(
    parentWindowElement?.previousElementSibling
  )
  if (
    parentWindowElement &&
    previousWindowElement &&
    previousWindowElement?.hasAttribute(draggableDataAttrName)
  ) {
    const target =
      queryNeighborTab(element, parentWindowElement, previousWindowElement) ||
      previousWindowElement
    target.focus()
    scrollToElement(target, { kind: 'tab', direction })
  }
}

const getWindowFocusHandlers = (
  isDragging: boolean,
  direction: AppDirection
) => {
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (
      !isDragging &&
      isHTMLElement(event.target) &&
      event.target === document.activeElement
    ) {
      switch (event.key) {
        // Focus sibling window
        case 'ArrowRight':
          handleKeyEvent(event)
          focusNextWindow(event.target, direction)
          break
        // Focus sibling window
        case 'ArrowLeft':
          handleKeyEvent(event)
          focusPreviousWindow(event.target, direction)
          break
        case 'ArrowDown':
          handleKeyEvent(event)
          focusFirstDraggable(event.target)
          break
        case 'ArrowUp':
          if (direction === 'vertical') {
            handleKeyEvent(event)
            const previousWindow = ifHTMLElement(
              event.target.previousElementSibling
            )
            if (previousWindow) {
              focusLastDraggable(previousWindow)
            }
          }
          break
      }
    }
  }
  return handleKeyDown
}

const getTabFocusHandlers = (isDragging: boolean, direction: AppDirection) => {
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (
      !isDragging &&
      isHTMLElement(event.target) &&
      event.target === document.activeElement
    ) {
      switch (event.key) {
        case 'ArrowRight':
          if (direction === 'horizontal') {
            handleKeyEvent(event)
            focusTabRight(event.target, direction)
          } else {
            const parentWindow = getClosestDraggableAncestor(
              event.target,
              'window'
            )
            if (parentWindow) {
              focusNextWindow(parentWindow, direction)
            }
          }
          break
        case 'ArrowLeft':
          if (direction === 'horizontal') {
            handleKeyEvent(event)
            focusTabLeft(event.target, direction)
          } else {
            const parentWindow = getClosestDraggableAncestor(
              event.target,
              'window'
            )
            if (parentWindow) {
              focusPreviousWindow(parentWindow, direction)
            }
          }
          break
        case 'ArrowUp':
          handleKeyEvent(event)
          focusTabUp(event.target, direction)
          break
        case 'ArrowDown':
          handleKeyEvent(event)
          const parentWindow = getClosestDraggableAncestor(
            event.target,
            'window'
          )
          const lastDraggable = parentWindow
            ? getLastDraggable(parentWindow)
            : undefined
          if (lastDraggable === event.target && parentWindow) {
            focusNextWindow(parentWindow, direction)
          } else {
            focusTabDown(event.target, direction)
          }
          break
      }
    }
  }
  return handleKeyDown
}

type FocusDraggableProps = React.PropsWithChildren<
  Omit<React.HTMLProps<HTMLDivElement>, 'className'> & {
    isDragging: boolean
    kind: DraggableKind
    className?: ClassNames
  }
>

export const FocusDraggable = forwardRef<HTMLDivElement, FocusDraggableProps>(
  ({ children, isDragging, className, kind, ...props }, parentRef) => {
    const direction = useMedia<AppDirection>([
      'vertical',
      'vertical',
      'vertical',
      'vertical',
      'horizontal',
    ])
    const handleKeyDown =
      kind === 'window'
        ? getWindowFocusHandlers(isDragging, direction)
        : getTabFocusHandlers(isDragging, direction)

    return (
      <FocusRing
        focusClass="outline-none"
        focusRingClass={
          !isDragging
            ? kind === 'window'
              ? focusRingClassInset
              : focusRingClass
            : undefined
        }
      >
        <div
          ref={parentRef}
          className={cn(className)}
          {...props}
          {...{ [kindDataAttrName]: kind }}
          onKeyDown={handleKeyDown}
          onClick={handleFocusDraggable}
        >
          {children}
        </div>
      </FocusRing>
    )
  }
)
