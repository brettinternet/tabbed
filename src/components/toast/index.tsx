import { AnimatePresence } from 'framer-motion'

import { useToasts } from './store'
import { Toast } from './toast'

export const ToastProvider = () => {
  const { toasts, remove } = useToasts()
  return (
    <ul className="fixed right-0 bottom-0">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} remove={remove} />
        ))}
      </AnimatePresence>
    </ul>
  )
}
