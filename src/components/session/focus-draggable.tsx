import { FocusRing } from '@react-aria/focus'
import cn, { Argument as ClassNames } from 'classnames'
import { forwardRef, useRef } from 'react'
import { focusRingClass } from 'styles'

import { ifHTMLElement, isScrolledIntoView } from 'utils/dom'

import { draggableDataAttrName } from './dnd-store'

export const kindDataAttrName = 'data-kind'

export const handleKeyEvent = (event: React.KeyboardEvent<HTMLElement>) => {
  event.preventDefault()
  event.stopPropagation()
}

export const getClosestDraggableAncestor = (element: HTMLElement) =>
  ifHTMLElement(element?.closest(`[${draggableDataAttrName}]`))

const handleFocusDraggable: React.MouseEventHandler<HTMLElement> = (event) => {
  const draggable = ifHTMLElement(event.target)?.closest(
    `[${draggableDataAttrName}]`
  )
  ifHTMLElement(draggable)?.focus()
}

type ScrollOptions = {
  end?: boolean
  xAxis?: boolean
}

const scrollToElement = (
  element: HTMLElement,
  { end = false, xAxis = false }: ScrollOptions = {}
) => {
  const direction = xAxis ? 'scrollWidth' : 'scrollHeight'
  if (!isScrolledIntoView(element)) {
    window.scrollTo(end ? element[direction] : element.scrollLeft, 0)
  }
  if (!isScrolledIntoView(element)) {
    window.scrollTo(end ? document.body[direction] : 0, 0)
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

export const focusTabUp = (element: HTMLElement) => {
  const previousElement = ifHTMLElement(element.previousElementSibling)
  if (previousElement?.hasAttribute(draggableDataAttrName)) {
    previousElement.focus()
    scrollToElement(previousElement, { end: false, xAxis: false })
  } else {
    const draggableAncestor = ifHTMLElement(
      element.parentElement?.closest(`[${draggableDataAttrName}]`)
    )
    draggableAncestor?.focus()
  }
}

export const focusTabDown = (element: HTMLElement) => {
  const nextElement = ifHTMLElement(element.nextElementSibling)
  if (nextElement?.hasAttribute(draggableDataAttrName)) {
    nextElement.focus()
    scrollToElement(nextElement, { end: true, xAxis: false })
  }
}

const getWindowFocusHandlers = (
  isDragging: boolean,
  elementRef: React.MutableRefObject<HTMLDivElement | null>
) => {
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (
      !isDragging &&
      elementRef.current &&
      elementRef.current === document.activeElement
    ) {
      switch (event.key) {
        // Focus sibling window
        case 'ArrowRight': {
          handleKeyEvent(event)
          const nextElement = ifHTMLElement(
            elementRef.current.nextElementSibling
          )
          if (nextElement?.hasAttribute(draggableDataAttrName)) {
            nextElement.focus()
            scrollToElement(nextElement, { end: true, xAxis: true })
          }
          break
        }
        // Focus sibling window
        case 'ArrowLeft': {
          handleKeyEvent(event)
          const previousElement = ifHTMLElement(
            elementRef.current.previousElementSibling
          )
          if (previousElement?.hasAttribute(draggableDataAttrName)) {
            previousElement.focus()
            scrollToElement(previousElement, { end: false, xAxis: true })
          }
          break
        }
        // Focus first draggable child (tab)
        case 'ArrowDown': {
          handleKeyEvent(event)
          const firstDraggable = ifHTMLElement(
            elementRef.current.querySelector(`[${draggableDataAttrName}]`)
          )
          if (firstDraggable) {
            firstDraggable.focus()
            scrollToElement(firstDraggable, { end: false, xAxis: false })
          }
          break
        }
      }
    }
  }
  return handleKeyDown
}

const getTabFocusHandlers = (
  isDragging: boolean,
  elementRef: React.MutableRefObject<HTMLDivElement | null>
) => {
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (
      !isDragging &&
      elementRef.current &&
      elementRef.current === document.activeElement
    ) {
      switch (event.key) {
        // Focus window
        case 'ArrowRight': {
          handleKeyEvent(event)
          const parentWindowElement = ifHTMLElement(
            elementRef.current.parentElement?.closest(
              `[${draggableDataAttrName}][${kindDataAttrName}="window"]`
            )
          )
          const nextWindowElement = ifHTMLElement(
            parentWindowElement?.nextElementSibling
          )
          if (
            parentWindowElement &&
            nextWindowElement &&
            nextWindowElement?.hasAttribute(draggableDataAttrName)
          ) {
            const target =
              queryNeighborTab(
                elementRef.current,
                parentWindowElement,
                nextWindowElement
              ) || nextWindowElement
            target.focus()
            scrollToElement(target, { end: true, xAxis: true })
          }
          break
        }
        // Focus left tab
        case 'ArrowLeft': {
          handleKeyEvent(event)
          const parentWindowElement = ifHTMLElement(
            elementRef.current.parentElement?.closest(
              `[${draggableDataAttrName}][${kindDataAttrName}="window"]`
            )
          )
          const previousWindowElement = ifHTMLElement(
            parentWindowElement?.previousElementSibling
          )
          if (
            parentWindowElement &&
            previousWindowElement &&
            previousWindowElement?.hasAttribute(draggableDataAttrName)
          ) {
            const target =
              queryNeighborTab(
                elementRef.current,
                parentWindowElement,
                previousWindowElement
              ) || previousWindowElement
            target.focus()
            scrollToElement(target, {
              end: false,
              xAxis: true,
            })
          }
          break
        }
        // Focus sibling tab
        case 'ArrowUp': {
          handleKeyEvent(event)
          focusTabUp(elementRef.current)
          break
        }
        // Focus sibling tab
        case 'ArrowDown': {
          handleKeyEvent(event)
          focusTabDown(elementRef.current)
          break
        }
      }
    }
  }
  return handleKeyDown
}

type FocusDraggableProps = React.PropsWithChildren<
  Omit<React.HTMLProps<HTMLDivElement>, 'className'> & {
    isDragging: boolean
    kind: 'tab' | 'window'
    className?: ClassNames
  }
>

export const FocusDraggable = forwardRef<HTMLDivElement, FocusDraggableProps>(
  ({ children, isDragging, className, kind, ...props }, parentRef) => {
    const localRef = useRef<HTMLDivElement | null>(null)
    const handleKeyDown =
      kind === 'window'
        ? getWindowFocusHandlers(isDragging, localRef)
        : getTabFocusHandlers(isDragging, localRef)

    return (
      <FocusRing focusRingClass={focusRingClass} focusClass="outline-none">
        <div
          ref={(ref) => {
            localRef.current = ref
            if (typeof parentRef === 'function') {
              parentRef(ref)
            } else if (parentRef !== null) {
              parentRef.current = ref
            }
          }}
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
