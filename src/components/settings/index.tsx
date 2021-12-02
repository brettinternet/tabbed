import cn from 'classnames'
import { useRef, useState } from 'react'

import { Button } from 'components/button'
import { Input, getClass as getInputClass } from 'components/input'
import { Kbd } from 'components/kbd'
import { Label } from 'components/label'
import { RadioGroup } from 'components/radiogroup'
import { Toggle } from 'components/toggle'
import { browserRuntime, browsers } from 'utils/env'
import { isDefined, parseNum } from 'utils/helpers'
import { ExtensionClickActions, Themes } from 'utils/settings'

import { useHandlers } from './handlers'

const H2: React.FC = ({ children }) => (
  <h2 className="text-lg pb-1 border-b border-gray-100">{children}</h2>
)

const Description: React.FC<{ id?: string }> = ({ children, id }) => (
  <p id={id} className="text-gray-600 dark:text-gray-300">
    {children}
  </p>
)

const Error: React.FC = ({ children }) => (
  <p className="text-red-600 dark:text-red-500">{children}</p>
)

export const Settings: React.FC = () => {
  const {
    settings,
    handleChangeFontSize,
    handleChangeTheme,
    handleChangeShortcuts,
    handleOpenShortcuts,
    handleChangeSaveClosedWindow,
    handleChangeSaveIncognito,
    handleOpenOptions,
    handleChangeSortFocusedWindowFirst,
    handleChangeExcludedUrls,
    handleChangeToggleExtensionClickAction,
    handleChangeTabCountBadge,
    handleChangePopupDimension,
    handleChangeDebugMode,
    handleClickReset,
  } = useHandlers()
  const [fontSize, setFontSize] = useState(settings.fontSize.toString())
  const [popupDimensions, setPopupDimensions] = useState(
    settings.popupDimensions
  )
  const [excludedUrlsValue, setExcludedUrlsValue] = useState(
    settings.excludedUrls.raw
  )
  const excludedUrlsTextArea = useRef<HTMLTextAreaElement>(null)

  return (
    <div className="space-y-9 max-w-md mx-auto">
      <H2>App</H2>
      <div className="space-y-3">
        <RadioGroup
          label="Theme"
          onChange={handleChangeTheme}
          options={[
            {
              name: 'Light',
              value: Themes.LIGHT,
            },
            {
              name: 'Dark',
              value: Themes.DARK,
            },
            {
              name: 'System',
              value: Themes.SYSTEM,
            },
          ]}
          value={settings.theme}
          optionsListClassName="flex flex-row items-center space-x-3"
        />
        <Description>Changes extension color theme.</Description>
      </div>

      <div className="space-y-3">
        <Label className="space-y-2">
          <div>Font size</div>
          <div className="flex items-center">
            <input
              type="range"
              className="block mr-2"
              onChange={(ev) => {
                setFontSize(ev.currentTarget.value)
              }}
              onBlur={handleChangeFontSize}
              value={fontSize}
              aria-describedby="font-size-description"
              min="10"
              max="24"
              step="2"
            />
            {fontSize}
          </div>
        </Label>
        <Description id="font-size-description">
          Changes base font size.
        </Description>
      </div>

      <div className="space-y-3">
        <Toggle
          label="Enable shortcuts"
          checked={settings.shortcuts}
          onChange={handleChangeShortcuts}
        />
        <Description>
          Enables extension shortcuts. Use <Kbd>?</Kbd> when enabled to{' '}
          <button
            onClick={handleOpenShortcuts}
            className="appearance-none text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-500"
          >
            view shortcuts
          </button>
          .
        </Description>
      </div>

      <H2>Sessions</H2>

      <div className="space-y-3">
        <Toggle
          label="Save closed windows"
          checked={settings.saveClosedWindows}
          onChange={handleChangeSaveClosedWindow}
        />
        <Description>
          Saves a single window session when windows are closed. This option may
          clutter up your "Previous" sessions.
        </Description>
      </div>

      <div className="space-y-3">
        <Toggle
          label="Save closed incognito windows"
          checked={settings.saveIncognito}
          onChange={handleChangeSaveIncognito}
        />
        <Description>
          Allows autosave to save incognito windows.{' '}
          {browserRuntime === browsers.CHROMIUM && (
            <>
              <button
                onClick={handleOpenOptions}
                className="appearance-none text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-500"
              >
                Enable incognito access
              </button>{' '}
              for this option to work.
            </>
          )}
        </Description>
      </div>

      <div className="space-y-3">
        <Toggle
          label="Always sort focused window first"
          checked={settings.sortFocusedWindowFirst}
          onChange={handleChangeSortFocusedWindowFirst}
        />
        <Description>
          Sorts the focused window first in the current session window list.
        </Description>
      </div>

      <div className="space-y-3">
        <Label className="space-y-2">
          <div>Excluded URLs</div>
          <textarea
            id="excluded-urls-textarea"
            className={cn('w-full max-h-64 min-h-11', getInputClass())}
            placeholder="chrome://bookmarks, http://example.com"
            spellCheck="false"
            onChange={(ev) => {
              setExcludedUrlsValue(ev.currentTarget.value)
            }}
            onBlur={(ev) => {
              handleChangeExcludedUrls(ev.currentTarget.value)
            }}
            value={excludedUrlsValue}
            aria-describedby="excluded-urls-description"
            rows={3}
            ref={excludedUrlsTextArea}
          />
        </Label>
        <div className="flex mt-2 justify-between">
          {settings.excludedUrls.error ? (
            <Error>{settings.excludedUrls.error}</Error>
          ) : (
            <p className="text-gray-600 dark:text-gray-500">&#x2713; URLs</p>
          )}
          <Button
            onClick={() => {
              const value = excludedUrlsTextArea.current?.value
              if (isDefined(value)) {
                handleChangeExcludedUrls(value)
              }
            }}
          >
            Check
          </Button>
        </div>
        <Description id="excluded-urls-description">
          Excludes tabs with matching URLs from saved sessions and windows. Use
          "*" to match wildcard patterns. Separate by new lines, spaces or
          commas.
        </Description>
      </div>

      <H2>Extension Icon</H2>

      <div className="space-y-3">
        <Toggle
          label="Open in tab"
          checked={settings.extensionClickAction === ExtensionClickActions.TAB}
          onChange={handleChangeToggleExtensionClickAction}
        />
        <Description>
          Opens the extension in a tab instead of a popup.
        </Description>
      </div>

      <div className="space-y-3">
        <Toggle
          label="Show tab count badge"
          checked={settings.showTabCountBadge}
          onChange={handleChangeTabCountBadge}
        />
        <Description>
          Shows a badge count of the total number of tabs.
        </Description>
      </div>

      <H2>Popup</H2>

      <div className="space-y-3">
        <div className="flex space-x-3">
          <Input
            label="Popup width"
            className="w-16"
            type="number"
            name="width"
            onChange={(ev) => {
              setPopupDimensions((d) => ({
                ...d,
                width: parseInt(ev.currentTarget.value),
              }))
            }}
            onBlur={handleChangePopupDimension}
            value={popupDimensions.width}
            aria-describedby="popup-dimension-description"
            min="300"
            max="800"
            step="25"
          />
          <Input
            label="Popup height"
            className="w-16"
            type="number"
            name="height"
            onChange={(ev) => {
              setPopupDimensions((d) => ({
                ...d,
                height: parseInt(ev.currentTarget.value),
              }))
            }}
            onBlur={handleChangePopupDimension}
            value={popupDimensions.height}
            aria-describedby="popup-dimension-description"
            min="300"
            max="600"
            step="25"
          />
        </div>
        <Description id="popup-dimension-description">
          Changes popup dimensions. Browsers limit the permissable dimensions of
          popups.
        </Description>
      </div>

      <H2>Other</H2>

      <div className="space-y-3">
        <Toggle
          label="Debug mode"
          onChange={handleChangeDebugMode}
          checked={settings.debugMode}
          aria-describedby="debug-mode-description"
        />
        <Description id="debug-mode-description">
          Enables verbose logging in the console.
        </Description>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleClickReset}
          aria-describedby="reset-settings-description"
        >
          Reset settings
        </Button>
        <Description id="reset-settings-description">
          Restores all settings to default values.
        </Description>
      </div>
    </div>
  )
}