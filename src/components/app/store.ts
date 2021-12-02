import { atom, useAtom } from 'jotai'
import { SetStateAction, useCallback, useEffect } from 'react'
import browser from 'webextension-polyfill'

import { useErrorHandler } from 'components/error/handlers'
import { useToasts } from 'components/toast/store'
import { popupUrl, tabUrl, popoutUrl, sidebarUrl } from 'utils/env'
import { getKeys } from 'utils/helpers'
import { updateLogLevel } from 'utils/logger'
import {
  SettingsData,
  defaultSettings,
  Themes,
  ThemeType,
} from 'utils/settings'

import { saveSettings } from './api'

// Feature flags
export const isPopup =
  window.location.href.includes(popupUrl) || !window.location.href.includes('?')
export const isTab = window.location.href.includes(tabUrl)
export const isPopout = window.location.href.includes(popoutUrl)
export const isSidebar = window.location.href.includes(sidebarUrl)
export const isSidebarSupported = !!browser.sidebarAction
export const isMac = window.navigator.userAgent.toLowerCase().includes('mac')

const setFontSize = (size: number) => {
  document.documentElement.style.fontSize = `${size}px`
}

const setTheme = (theme: ThemeType) => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (theme === Themes.DARK || (theme === Themes.SYSTEM && prefersDark)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const setBodySize = (width: number, height: number) => {
  document.body.style.width = `${width}px`
  document.body.style.height = `${height}px`
}

/**
 * Invokes side effects for settings startup and changes
 */
const handleSettingsSideEffects = async <K extends keyof SettingsData>(
  key: K,
  settings: SettingsData
) => {
  switch (key) {
    case 'fontSize': {
      setFontSize(settings.fontSize)
      break
    }
    // case 'shortcuts': {
    //   setupShortcuts(settings.shortcuts)
    //   break
    // }
    case 'popupDimensions': {
      if (isPopup) {
        setBodySize(
          settings.popupDimensions.width,
          settings.popupDimensions.height
        )
      }
      break
    }
    case 'theme': {
      setTheme(settings.theme)
      break
    }
    case 'debugMode': {
      updateLogLevel(settings.debugMode)
      break
    }
    // case 'sortFocusedWindowFirst':
    //   await sortCurrentSession()
    //   break
  }
}

const settingsAtom = atom<SettingsData>(defaultSettings)

export type SetSettings = (update: SetStateAction<SettingsData>) => void
export const useSettings = (): [
  SettingsData,
  SetSettings,
  (values: Partial<SettingsData>) => Promise<void>
] => {
  const { add: addToast } = useToasts()
  const handleError = useErrorHandler(addToast)
  const [settings, setSettings] = useAtom(settingsAtom)

  const updateSettings = useCallback(
    async (values: Partial<SettingsData>) => {
      try {
        const settings = await saveSettings(values)
        if (settings) {
          const keys = getKeys(values)
          await Promise.all(
            keys.map(async (key) => handleSettingsSideEffects(key, settings))
          )
          setSettings(settings)
        }
      } catch (err) {
        handleError(err)
      }
    },
    [setSettings, handleError]
  )

  useEffect(() => {
    const act = async () => {
      const keys = getKeys(settings)
      await Promise.all(
        keys.map(async (key) => handleSettingsSideEffects(key, settings))
      )
    }

    void act()
  }, [settings])

  return [settings, setSettings, updateSettings]
}
