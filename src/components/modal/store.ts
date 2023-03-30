import { atom, useAtom } from 'jotai'
import { useCallback } from 'react'

import { Valueof } from 'utils/helpers'

export const Modal = {
  SETTINGS: 'settings',
  SESSION_EDIT: 'sessionEdit',
  IMPORTER: 'importer',
  ABOUT: 'about',
  HELP: 'help',
} as const

export type ModalType = Valueof<typeof Modal>

const initialModals = {
  settings: false,
  sessionEdit: false,
  importer: false,
  about: false,
  help: false,
}

const whichModal = (modals: typeof initialModals) => {
  let key: ModalType
  for (key in modals) {
    if (modals[key]) {
      return key
    }
  }
}

const modalAtom = atom(initialModals)

export const useModal = () => {
  const [modals, setModals] = useAtom(modalAtom)

  const setter = useCallback(
    (key: ModalType) => (value: boolean) => {
      setModals(() => ({
        // reset other values, exclusive state only
        ...initialModals,
        [key]: value,
      }))
    },
    [setModals]
  )

  const toggler = useCallback(
    (key: ModalType) => () => {
      setModals((current) => ({
        ...initialModals,
        [key]: !current[key],
      }))
    },
    [setModals]
  )

  return {
    modal: whichModal(modals),
    off: () => {
      setModals(initialModals)
    },
    settings: {
      set: setter('settings'),
      toggle: toggler('settings'),
    },
    sessionEdit: {
      set: setter('sessionEdit'),
      toggle: toggler('sessionEdit'),
    },
    importer: {
      set: setter('importer'),
      toggle: toggler('importer'),
    },
    about: {
      set: setter('about'),
      toggle: toggler('about'),
    },
    help: {
      set: setter('help'),
      toggle: toggler('help'),
    },
  }
}
