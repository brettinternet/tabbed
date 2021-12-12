import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Portal component
 */
export const Portal = ({
  children,
  enabled = true,
}: {
  children: React.ReactNode
  enabled?: boolean
}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (!enabled) {
    return <>{children}</>
  }

  return createPortal(children, document.body)
}
