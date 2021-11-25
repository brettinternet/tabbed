import cn from 'classnames'
import { motion } from 'framer-motion'
import { useEffect } from 'react'

import { Icon } from 'components/icon'

import { ToastVariant, ToastVariantType, Toast as ToastObj } from './store'

const getTypeClass = (variant: ToastVariantType | undefined) => {
  switch (variant) {
    case ToastVariant.SUCCESS:
      return 'bg-white dark:bg-gray-700'
    case ToastVariant.INFO:
      return 'bg-blue-500 text-white dark:bg-gray-700'
    case ToastVariant.WARN:
      return 'bg-yellow-500 text-white dark:bg-yellow-600'
    case ToastVariant.ERROR:
      return 'bg-red-600 text-white dark:bg-red-400'
    default:
      return 'bg-white dark:bg-gray-700 border border-gray-300'
  }
}

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
    <motion.li
      className={cn(
        'flex justify-between items-center m-4 p-3 min-h-11 shadow-md rounded w-72',
        getTypeClass(variant)
      )}
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.5,
        transition: {
          duration: 0.15,
        },
      }}
    >
      <p>
        {title && <b className="mr-1">{title}</b>}
        {message}
      </p>
      <button
        onClick={() => {
          remove(id)
        }}
      >
        <Icon name="x" />
      </button>
    </motion.li>
  )
}
