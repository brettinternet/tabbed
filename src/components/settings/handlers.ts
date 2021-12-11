import browser from 'webextension-polyfill'

import { useSettings } from 'components/app/store'
import { useModal } from 'components/modal/store'
import { browserRuntime, browsers } from 'utils/env'
import {
  SettingsData,
  ExtensionClickActions,
  defaultSettings, // ExtensionClickActionType,
  ThemeType,
} from 'utils/settings'

/**
 * Find the closest input value to constraint list for font size
 */
const findClosest = (arr: number[], x: number): number =>
  arr.reduce((a, b) => (Math.abs(b - x) < Math.abs(a - x) ? b : a), arr[0])

const clamp = (x: number, min: number, max: number) =>
  Math.min(Math.max(x, min), max)

export const useHandlers = () => {
  const modal = useModal()
  const [userSettings, , updateSettings] = useSettings()
  const settings = userSettings || defaultSettings

  // const handleChangeLayout: React.ChangeEventHandler<HTMLInputElement> = useCallback(
  //   async (ev) => {
  //     await updateSettings({ layout: ev.currentTarget.value })
  //   },
  //   [updateSettings]
  // )

  // const handleChangeRadioExtensionClickAction: React.ChangeEventHandler<HTMLInputElement> =
  //   async (ev) => {
  //     await updateSettings({
  //       extensionClickAction: ev.currentTarget
  //         .value as ExtensionClickActionType,
  //     })
  //   }

  const handleChangeToggleExtensionClickAction = async (checked: boolean) => {
    await updateSettings({
      extensionClickAction: ExtensionClickActions[checked ? 'TAB' : 'POPUP'],
    })
  }

  const handleChangeSaveClosedWindow = async (checked: boolean) => {
    await updateSettings({
      saveClosedWindows: checked,
    })
  }

  const handleChangeSaveIncognito = async (checked: boolean) => {
    const change: Partial<SettingsData> = {
      saveIncognito: checked,
    }
    if (checked) {
      change.saveClosedWindows = true
    }
    await updateSettings(change)
  }

  const handleChangeTabCountBadge = async (checked: boolean) => {
    await updateSettings({
      showTabCountBadge: checked,
    })
  }

  const handleChangeShortcuts = async (checked: boolean) => {
    await updateSettings({
      shortcuts: checked,
    })
  }

  const handleChangeFontSize = async (value: string) => {
    const fontSizeValue = parseInt(value)
    await updateSettings({
      fontSize: findClosest([10, 12, 14, 16, 18, 20, 22, 24], fontSizeValue),
    })
  }

  const handleChangePopupDimension: React.ChangeEventHandler<HTMLInputElement> =
    async (ev) => {
      const value = parseInt(ev.currentTarget.value)
      const name = ev.currentTarget.name
      await updateSettings({
        popupDimensions: {
          ...settings.popupDimensions,
          [ev.currentTarget.name]: clamp(
            value,
            300,
            name === 'width' ? 800 : 600
          ),
        },
      })
    }

  const handleChangeTheme: (options: unknown) => void = async (option) => {
    await updateSettings({
      theme: option as ThemeType,
    })
  }

  const handleChangeDebugMode = async (checked: boolean) => {
    await updateSettings({
      debugMode: checked,
    })
  }

  const handleClickReset: React.MouseEventHandler<HTMLButtonElement> =
    async () => {
      await updateSettings(defaultSettings)
    }

  const handleChangeSortFocusedWindowFirst = async (checked: boolean) => {
    await updateSettings({
      sortFocusedWindowFirst: checked,
    })
  }

  const handleOpenShortcuts: React.MouseEventHandler<HTMLButtonElement> =
    () => {
      modal.shortcuts.set(true)
    }

  const handleOpenOptions: React.MouseEventHandler<HTMLButtonElement> =
    async () => {
      if (browserRuntime === browsers.CHROMIUM) {
        await browser.tabs.create({
          url: `chrome://extensions/?id=${browser.runtime.id}`,
        })
      }
    }

  const handleChangeExcludedUrls = async (value: string) => {
    const excludedUrls: SettingsData['excludedUrls'] = {
      raw: value.trim(),
      parsed: [],
      error: undefined,
    }
    if (excludedUrls.raw) {
      // Split on whitespace and commas https://stackoverflow.com/a/650037
      const parsed = excludedUrls.raw.split(/[\s,]+/).filter(Boolean)
      let hasError = false
      const urls = parsed.map((url) => {
        if (url.includes('*')) {
          return url
        } else {
          try {
            return new URL(url).href
          } catch (_err) {
            hasError = true
            return url
          }
        }
      })
      if (hasError) {
        excludedUrls.error = 'One or more URLs may be invalid.'
      }
      // Still assign parse even despite possible error in order to rely on user
      excludedUrls.parsed = urls
    }
    await updateSettings({
      excludedUrls,
    })
  }

  // const handlePurgeAllStorage: React.ChangeEventHandler<
  //   MouseEvent,
  //   HTMLButtonElement
  // > = async () => {
  //   await purgeAllStorage()
  //   window.location.reload()
  // }

  return {
    settings,
    // handleChangeLayout,
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
  }
}
