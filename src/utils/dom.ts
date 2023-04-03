/**
 * Check if element or node is HTMLElement
 */
export const isHTMLElement = (element: unknown): element is HTMLElement =>
  element instanceof HTMLElement

export const ifHTMLElement = (element: unknown): HTMLElement | undefined => {
  return isHTMLElement(element) ? element : undefined
}

/**
 * Whether an element is completely scrolled into view
 * @source https://stackoverflow.com/a/22480938
 */
export const isScrolledIntoView = (element: Element) => {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.left >= 0 &&
    rect.right <= window.innerWidth
  )
}

export const stopPropagation = (
  event: { stopPropagation?: () => void } = {}
) => {
  event.stopPropagation?.()
}
