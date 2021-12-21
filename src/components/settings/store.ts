import { atom, useAtom } from 'jotai'
import { SetStateAction, useCallback, useEffect, useState } from 'react'

import { isPopup } from 'components/app/store'
import { useTryToastError } from 'components/error/handlers'
import { getKeys } from 'utils/helpers'
import { updateLogLevel } from 'utils/logger'
import {
  MESSAGE_TYPE_UPDATED_SETTING,
  sendMessage,
  UpdatedSettingMessage,
} from 'utils/messages'
import { Settings } from 'utils/settings/settings-manager'
import { SettingsData, Themes, ThemeType } from 'utils/settings/types'

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

const settingsManagerAtom = atom<Settings | undefined>(undefined)

export type SetSettings = (
  update: SetStateAction<SettingsData | undefined>
) => void
export const useSettings = (): [
  SettingsData | undefined,
  (values: Partial<SettingsData>) => Promise<void>,
  Settings | undefined
] => {
  const tryToastError = useTryToastError()
  const [settingsManager, setSettingsManager] = useAtom(settingsManagerAtom)

  useEffect(() => {
    if (!settingsManager) {
      const load = async () => {
        const settingsManager = await Settings.load()
        const settings = settingsManager.get()
        const keys = getKeys(settings)
        await Promise.all(
          keys.map(async (key) => handleSettingsSideEffects(key, settings))
        )
        setSettingsManager(settingsManager)
      }

      void load()
    }
  }, [settingsManager])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateSettings = useCallback(
    tryToastError(async (values: Partial<SettingsData>) => {
      if (settingsManager) {
        await settingsManager.update(values)
        const keys = getKeys(values)
        await Promise.all([
          await sendMessage<UpdatedSettingMessage>(
            MESSAGE_TYPE_UPDATED_SETTING,
            values
          ),
          ...keys.map(async (key) =>
            handleSettingsSideEffects(key, settingsManager.get())
          ),
        ])

        // React doesn't see this as new state since class is only mutated
        setSettingsManager(new Settings(settingsManager))
      }
    }),
    [settingsManager, tryToastError]
  )

  return [settingsManager?.get(), updateSettings, settingsManager]
}
