import { atom, useAtom } from 'jotai'
import { useCallback } from 'react'

import { Valueof } from 'utils/helpers'

export const Modal = {
  SETTINGS: 'settings',
  SHORTCUTS: 'shortcuts',
  SESSION_EDIT: 'sessionEdit',
  IMPORTER: 'importer',
} as const

export type ModalType = Valueof<typeof Modal>

const initialModals = {
  settings: false,
  shortcuts: false,
  sessionEdit: false,
  importer: false,
}

const modalAtom = atom(initialModals)
const whichModalAtom = atom((get) => {
  const modals = get(modalAtom)
  let key: ModalType
  for (key in modals) {
    if (modals[key]) {
      return key
    }
  }
})

export const useModal = () => {
  const [, setModals] = useAtom(modalAtom)
  const [modal] = useAtom(whichModalAtom)

  const setter = useCallback(
    (key: ModalType) => (value: boolean) => {
      setModals(() => ({
        // reset other values, exclusive state only
        ...initialModals,
        [key]: value,
      }))
    },
    []
  )
  const toggler = useCallback(
    (key: ModalType) => () => {
      setModals((current) => ({
        ...initialModals,
        [key]: !current[key],
      }))
    },
    []
  )

  return {
    modal,
    settings: {
      set: setter('settings'),
      toggle: toggler('settings'),
    },
    shortcuts: {
      set: setter('shortcuts'),
      toggle: toggler('shortcuts'),
    },
    sessionEdit: {
      set: setter('sessionEdit'),
      toggle: toggler('sessionEdit'),
    },
    importer: {
      set: setter('importer'),
      toggle: toggler('importer'),
    },
    off: () => {
      setModals(initialModals)
    },
  }
}
