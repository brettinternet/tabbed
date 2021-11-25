/**
 * @accessibility https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Search_role
 */
import { debounce } from 'lodash'

import { getMessage } from 'utils/i18n'
import { useSearchValue } from './store'

export const Search: React.FC = () => {
  const [searchValue, setSearchValue] = useSearchValue()

  const submitSearch = async (text?: string) => {
    setSearchValue(text)
    if (text?.trim()) {
      // const results = await searchSessions(text)
      // console.log('results: ', results)
    }
  }

  let input: HTMLInputElement | undefined

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault()
    const query = input?.value
    void submitSearch(query)
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
    ev.preventDefault()
    const query = input?.value
    void submitSearch(query)
  }

  const clear: React.MouseEventHandler<HTMLButtonElement> = () => {
    setSearchValue(undefined)
    if (input) {
      input.value = ''
      input.focus()
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
      {/* <Input
        id="search"
        classNames="w-full xxs:pr-8"
        type="text"
        placeholder={getMessage('search__input_placeholder', 'Search')}
        onInput={debouncedChange}
        spellcheck="false"
        bind:ref={input}
      /> */}
      {searchValue && (
        <button
          className="hidden xxs:flex items-center justify-center absolute top-0 right-0 h-full w-8"
          aria-label={getMessage('search__input_clear', 'Clear')}
          onClick={clear}
        >
          x
        </button>
      )}
    </form>
  )
}
