import { useEffect, useState } from 'react'

import { About } from 'components/about'
import { Help } from 'components/help'
import { Settings } from 'components/settings'

import { Modal, ModalProps } from './modal'
import { Modal as ModalOption, ModalType, useModal } from './store'

type ActiveModal = ModalType | undefined

type ModalValues = {
  Content?: React.ComponentType
  title?: string
  modalProps?: Partial<ModalProps>
}

const getModalValues = (modal: ActiveModal): ModalValues => {
  switch (modal) {
    case ModalOption.SETTINGS:
      return {
        Content: Settings,
        title: 'Settings',
        modalProps: { variant: 'drawer-right' },
      }
    case ModalOption.HELP:
      return {
        Content: Help,
        title: 'Help',
        modalProps: { variant: 'drawer-right' },
      }
    case ModalOption.ABOUT:
      return {
        Content: About,
        title: 'About',
        modalProps: { variant: 'card' },
      }
    default:
      return {}
  }
}

export const ModalProvider: React.FC = () => {
  const { modal, off } = useModal()
  const [activeModal, setActiveModal] = useState<ActiveModal>(modal)
  const { Content, title, modalProps } = getModalValues(activeModal)

  useEffect(() => {
    if (modal) {
      setActiveModal(modal)
    }
  }, [modal])

  return (
    <Modal
      show={!!modal}
      close={off}
      title={title}
      animationEnd={() => {
        setActiveModal(undefined)
      }}
      variant={modalProps?.variant || 'card'}
    >
      {Content && <Content />}
    </Modal>
  )
}
