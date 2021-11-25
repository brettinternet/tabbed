import { atom, useAtom } from 'jotai'

const searchValueAtom = atom<string | undefined>(undefined)
export const useSearchValue = () => useAtom(searchValueAtom)
