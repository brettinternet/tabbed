import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef } from 'react'

import { Message } from 'components/message'

import { Toast as ToastObj } from './store'
import { createTimer } from './timer'

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
  const timer = useRef<ReturnType<typeof createTimer>>()

  useEffect(() => {
    if (autoDismiss && duration && !timer.current) {
      timer.current = createTimer(remove, duration, id)
    } else if (timer.current) {
      timer.current.clear()
    }

    return () => {
      if (timer.current) {
        timer.current.clear()
      }
    }
  }, [id, remove, duration, autoDismiss])

  const pause = useCallback(() => {
    if (autoDismiss && timer.current) {
      timer.current.pause()
    }
  }, [autoDismiss])

  const unpause = useCallback(() => {
    if (autoDismiss && timer.current) {
      timer.current.start()
    }
  }, [autoDismiss])

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
      body={message}
      onDismiss={() => {
        remove(id)
      }}
      onMouseEnter={pause}
      onMouseLeave={unpause}
    />
  )
}
