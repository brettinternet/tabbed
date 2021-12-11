/**
 * @accessibility https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Search_role
 */
import { debounce } from 'lodash'
import { useRef } from 'react'

import { Button } from 'components/button'
import { Icon, IconName } from 'components/icon'
import { Input } from 'components/input'
import { getMessage } from 'utils/i18n'

import { useSearchValue } from './store'

export const Search: React.FC = () => {
  const searchRef = useRef<HTMLInputElement>(null)
  const [searchValue, setSearchValue] = useSearchValue()

  const submitSearch = async (text?: string) => {
    setSearchValue(text)
    if (text?.trim()) {
      console.log('submit: ', text)
      // const results = await searchSessions(text)
      // console.log('results: ', results)
    }
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault()
    if (searchRef.current) {
      void submitSearch(searchRef.current.value)
    }
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
    ev.preventDefault()
    const query = ev.target.value
    void submitSearch(query)
  }

  const clear: React.MouseEventHandler<HTMLButtonElement> = () => {
    setSearchValue(undefined)
    if (searchRef.current) {
      searchRef.current.value = ''
      searchRef.current.focus()
    }
  }

  const debouncedChange = debounce(handleChange, 250)

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      aria-label={getMessage('search__form_label', 'Sessions and tabs')}
      className="relative"
    >
      <Icon
        name={IconName.SEARCH}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 h-full pointer-events-none"
        size="sm"
      />
      <Input
        id="search"
        className="w-full xxs:pr-8 rounded-full px-7 py-1"
        type="text"
        placeholder={getMessage('search__input_placeholder', 'Search')}
        onChange={debouncedChange}
        spellCheck="false"
        shape="none"
        ref={searchRef}
      />
      {searchValue && (
        <Button
          type="button"
          className="hidden xxs:flex items-center justify-center absolute top-0 right-0 h-full w-8"
          aria-label={getMessage('search__input_clear', 'Clear')}
          onClick={clear}
          variant="none"
          iconProps={{ name: IconName.CLOSE, size: 'sm' }}
        />
      )}
    </form>
  )
}
