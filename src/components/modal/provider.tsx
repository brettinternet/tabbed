import { useEffect, useState } from 'react'

import { Settings } from 'components/settings'
import { Shortcuts } from 'components/shortcuts'

import { Modal } from './modal'
import { Modal as ModalOption, ModalType, useModal } from './store'

type ActiveModal = ModalType | undefined

const getModalContent = (modal: ActiveModal) => {
  switch (modal) {
    case ModalOption.SETTINGS:
      return { Content: Settings, title: 'Settings' }
    case ModalOption.SHORTCUTS:
      return { Content: Shortcuts, title: 'Shortcuts' }
    default:
      return {}
  }
}

export const ModalProvider: React.FC = () => {
  const { modal, off } = useModal()
  const [activeModal, setActiveModal] = useState<ActiveModal>(modal)
  const { Content, title } = getModalContent(activeModal)

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
    >
      {Content && <Content />}
    </Modal>
  )
}
