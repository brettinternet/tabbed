import { motion } from 'framer-motion'
import { useEffect } from 'react'

import { Message } from 'components/message'

import { Toast as ToastObj } from './store'

type ToastProps = ToastObj & { remove: (id: string) => void }

export const Toast: React.FC<ToastProps> = ({
  id,
  variant,
  title,
  message,
  autoDismiss,
  duration,
  remove,
}) => {
  useEffect(() => {
    let timeoutId: number | undefined

    if (autoDismiss && duration > 0) {
      timeoutId = window.setTimeout(remove, duration, id)
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [id, remove, duration, autoDismiss])

  return (
    <Message
      as={motion.li}
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.5,
        transition: {
          duration: 0.15,
        },
      }}
      variant={variant}
      title={title}
      message={message}
      onDismiss={() => {
        remove(id)
      }}
    />
  )
}
