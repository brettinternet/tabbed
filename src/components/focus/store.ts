import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'

const showFocusRingAtom = atom<boolean>(false)

export const useAllowFocusRingListener = () => {
  const [show, setShow] = useAtom(showFocusRingAtom)

  useEffect(() => {
    const handleClick = () => {
      setShow(false)
    }

    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [setShow])

  return [show, setShow] as const
}

export const useAllowFocusRing = () => {
  const [show, setShow] = useAtom(showFocusRingAtom)
  return [show, setShow] as const
}
