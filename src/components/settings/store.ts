import { atom, useAtom } from 'jotai'
import { SetStateAction, useCallback, useEffect } from 'react'

import { isPopup, useBackground } from 'components/app/store'
import { useTryToastError } from 'components/error/handlers'
import { getKeys } from 'utils/helpers'
import { updateLogLevel } from 'utils/logger'
import {
  MESSAGE_TYPE_UPDATED_SETTING,
  sendMessage,
  UpdatedSettingMessage,
} from 'utils/messages'
import {
  Settings,
  Themes,
  ThemeType,
  loadSettings,
  updateSettings,
  defaultSettings,
} from 'utils/settings'

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
const handleSettingsSideEffects = async <K extends keyof Settings>(
  key: K,
  settings: Settings
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

const settingsAtom = atom<Settings>(defaultSettings)

export type SetSettings = (update: SetStateAction<Settings>) => void
export const useSettings = (): [
  Settings,
  (values: Partial<Settings>) => Promise<void>
] => {
  const tryToastError = useTryToastError()
  const port = useBackground()
  const [settings, setSettings] = useAtom(settingsAtom)

  useEffect(() => {
    if (!settings) {
      const load = async () => {
        const settings = await loadSettings()
        const keys = getKeys(settings)
        await Promise.all(
          keys.map(async (key) => handleSettingsSideEffects(key, settings))
        )
        setSettings(settings)
      }

      void load()
    }
  }, [settings])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _updateSettings = useCallback(
    tryToastError(async (values: Partial<Settings>) => {
      const keys = getKeys(values)
      const settings = await updateSettings(values)
      await Promise.all(
        keys.map(async (key) => handleSettingsSideEffects(key, settings))
      )
      sendMessage<UpdatedSettingMessage>(
        port,
        MESSAGE_TYPE_UPDATED_SETTING,
        values
      )
      setSettings(settings)
    }),
    [port, tryToastError]
  )

  return [settings, _updateSettings]
}
