import { DraggableProvidedDraggableProps } from '@hello-pangea/dnd'
import { FocusRing } from '@react-aria/focus'
import cn, { Argument as ClassNames } from 'classnames'
import { forwardRef, useRef } from 'react'
import { focusRingClass } from 'styles'

import { isScrolledIntoView } from 'utils/helpers'

type DataDraggable = Pick<
  DraggableProvidedDraggableProps,
  'data-rfd-draggable-id'
>

const draggableDataProp: keyof DataDraggable = 'data-rfd-draggable-id'
const kindDataProp = 'data-kind'

const ifHTMLElement = (element: unknown): HTMLElement | undefined => {
  return element instanceof HTMLElement ? element : undefined
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
    `[${draggableDataProp}][${kindDataProp}="tab"]`
  )
  const draggableNeighborChildren = neightborWindowelement?.querySelectorAll(
    `[${draggableDataProp}][${kindDataProp}="tab"]`
  )
  if (draggableCurrentChildren && draggableNeighborChildren) {
    const index = Array.from(draggableCurrentChildren).indexOf(tab)
    return ifHTMLElement(draggableNeighborChildren[index])
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
          event.preventDefault()
          event.stopPropagation()
          const nextElement = ifHTMLElement(
            elementRef.current.nextElementSibling
          )
          if (nextElement?.hasAttribute(draggableDataProp)) {
            nextElement.focus()
            scrollToElement(nextElement, { end: true, xAxis: true })
          }
          break
        }
        // Focus sibling window
        case 'ArrowLeft': {
          event.preventDefault()
          event.stopPropagation()
          const previousElement = ifHTMLElement(
            elementRef.current.previousElementSibling
          )
          if (previousElement?.hasAttribute(draggableDataProp)) {
            previousElement.focus()
            scrollToElement(previousElement, { end: false, xAxis: true })
          }
          break
        }
        // Focus first draggable child (tab)
        case 'ArrowDown': {
          event.preventDefault()
          event.stopPropagation()
          const firstDraggable = ifHTMLElement(
            elementRef.current.querySelector(`[${draggableDataProp}]`)
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
          event.preventDefault()
          event.stopPropagation()
          const parentWindowElement = ifHTMLElement(
            elementRef.current.parentElement?.closest(
              `[${draggableDataProp}][${kindDataProp}="window"]`
            )
          )
          const nextWindowElement = ifHTMLElement(
            parentWindowElement?.nextElementSibling
          )
          if (
            parentWindowElement &&
            nextWindowElement &&
            nextWindowElement?.hasAttribute(draggableDataProp)
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
          event.preventDefault()
          event.stopPropagation()
          const parentWindowElement = ifHTMLElement(
            elementRef.current.parentElement?.closest(
              `[${draggableDataProp}][${kindDataProp}="window"]`
            )
          )
          const previousWindowElement = ifHTMLElement(
            parentWindowElement?.previousElementSibling
          )
          if (
            parentWindowElement &&
            previousWindowElement &&
            previousWindowElement?.hasAttribute(draggableDataProp)
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
          event.preventDefault()
          event.stopPropagation()
          const previousElement = ifHTMLElement(
            elementRef.current.previousElementSibling
          )
          if (previousElement?.hasAttribute(draggableDataProp)) {
            previousElement.focus()
            scrollToElement(previousElement, { end: false, xAxis: false })
          } else {
            const draggableAncestor = ifHTMLElement(
              elementRef.current.parentElement?.closest(
                `[${draggableDataProp}]`
              )
            )
            draggableAncestor?.focus()
          }
          break
        }
        // Focus sibling tab
        case 'ArrowDown': {
          event.preventDefault()
          event.stopPropagation()
          const nextElement = ifHTMLElement(
            elementRef.current.nextElementSibling
          )
          if (nextElement?.hasAttribute(draggableDataProp)) {
            nextElement.focus()
            scrollToElement(nextElement, { end: true, xAxis: false })
          }
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
      <FocusRing
        focusRingClass={!isDragging ? focusRingClass : undefined}
        focusClass="outline-none"
      >
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
          {...{ [kindDataProp]: kind }}
          onKeyDown={handleKeyDown}
          // tabIndex={0}
        >
          {children}
        </div>
      </FocusRing>
    )
  }
)
