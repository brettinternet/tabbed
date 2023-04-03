/**
 * Check if element or node is HTMLElement
 */
export const isHTMLElement = (element: unknown): element is HTMLElement =>
  element instanceof HTMLElement

export const ifHTMLElement = (element: unknown): HTMLElement | undefined => {
  return isHTMLElement(element) ? element : undefined
}

export const stopPropagation = (
  event: { stopPropagation?: () => void } = {}
) => {
  event.stopPropagation?.()
}
