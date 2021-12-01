import { Dialog, Transition } from '@headlessui/react'
import cn from 'classnames'
import { Fragment } from 'react'

import { Button } from 'components/button'

type ModalProps = {
  show: boolean
  close: () => void
  title?: React.ReactNode
  animationEnd?: () => void
}

export const Modal: React.FC<ModalProps> = ({
  children,
  show,
  close,
  title,
  animationEnd,
}) => (
  <Transition appear show={show} as={Fragment}>
    <Dialog
      as="div"
      className="fixed inset-0 z-modal overflow-y-auto"
      onClose={close}
      onAnimationEnd={animationEnd}
    >
      <div className="min-h-screen flex items-center justify-center">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-gray-900 bg-opacity-10" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="w-full min-h-screen md:min-h-full md:h-auto md:max-w-md md:my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl md:rounded-2xl">
            <div
              className={cn(
                'flex items-center px-6 pt-4 mb-6',
                title ? 'justify-between' : 'justify-end'
              )}
            >
              {title && (
                <Dialog.Title
                  as="h1"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {title}
                </Dialog.Title>
              )}
              <Button
                onClick={close}
                aria-label="Close"
                variant="transparent"
                iconProps={{ name: 'x' }}
              />
            </div>
            <div className="px-6 pb-6">{children}</div>
          </div>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition>
)
