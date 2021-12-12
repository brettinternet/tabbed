import { Dialog, Transition } from '@headlessui/react'
import cn from 'classnames'
import { Fragment } from 'react'

import { Button } from 'components/button'
import { ModalDropdown } from 'components/header/modal-dropdown'
import { IconName } from 'components/icon'
import { Valueof } from 'utils/helpers'

const Variant = {
  DRAWER: 'drawer-right',
  CARD: 'card',
} as const

type VariantType = Valueof<typeof Variant>

export type ModalProps = {
  show: boolean
  close: () => void
  title?: React.ReactNode
  animationEnd?: () => void
  variant: VariantType
}

export const Modal: React.FC<ModalProps> = ({
  children,
  show,
  close,
  title,
  animationEnd,
  variant,
}) => (
  <Transition appear show={show} as={Fragment}>
    <Dialog
      as="div"
      className="fixed inset-0 z-modal"
      onClose={close}
      onAnimationEnd={animationEnd}
    >
      <div
        className={cn(
          'min-h-screen flex items-center',
          variant === Variant.CARD ? 'justify-center' : 'justify-end'
        )}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="z-overlay fixed inset-0 bg-gray-900 bg-opacity-30 dark:bg-opacity-60" />
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
          <div
            className={cn(
              'z-modal w-full min-h-screen md:min-h-full md:h-auto md:max-w-md bg-white dark:bg-gray-800 shadow-xl border border-transparent dark:border-gray-700',
              variant === Variant.CARD
                ? 'md:my-8 md:rounded-2xl'
                : 'pl-3 md:rounded-tl-2xl md:rounded-bl-2xl'
            )}
          >
            <div
              className={cn(
                'h-modal-header flex items-center px-6 py-6 md:py-4',
                title ? 'justify-between' : 'justify-end',
                'border-b border-gray-100 dark:border-gray-700'
              )}
            >
              {title && (
                <Dialog.Title
                  as="h1"
                  className="text-2xl font-medium leading-6 text-gray-900 dark:text-white"
                >
                  {title}
                </Dialog.Title>
              )}
              <div className="flex space-x-2">
                <ModalDropdown inModal />
                <Button
                  onClick={close}
                  aria-label="Close"
                  variant="transparent"
                  iconProps={{ name: IconName.CLOSE }}
                />
              </div>
            </div>
            <div
              className={cn(
                'p-6 overflow-y-auto scroll',
                variant === Variant.CARD ? 'min-h-11' : 'h-modal-drawer-body'
              )}
            >
              {children}
            </div>
          </div>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition>
)
