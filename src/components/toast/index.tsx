import { AnimatePresence } from 'framer-motion'

import { Portal } from 'utils/portal'

import { useToasts } from './store'
import { Toast } from './toast'

export const ToastContainer = () => {
  const { toasts, remove } = useToasts()
  return (
    <Portal>
      <ul className="fixed z-toast bottom-0 right-1/2 transform translate-x-1/2 sm:right-0 sm:transform-none sm:translate-x-0">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} remove={remove} />
          ))}
        </AnimatePresence>
      </ul>
    </Portal>
  )
}
