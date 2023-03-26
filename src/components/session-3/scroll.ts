const handleWheel = (event: WheelEvent) => {
  console.log('event: ', event)
  return event.deltaX / 120
}

export const useScroll = (
  ref: React.RefObject<HTMLElement | null | undefined>
) => {
  const toggle = (enable: boolean) => {
    // if (enable) {
    // console.log('SCROLL CONTAINER', ref.current)
    // ref.current?.addEventListener('wheel', handleWheel)
    // ref.current?.addEventListener('scroll', (event) => {
    //   // event.defaultPrevented()
    //   console.log('scrolling!', event)
    // })
    // } else {
    // ref.current?.removeEventListener('wheel', handleWheel)
    // }
  }

  return toggle
}
