import { LocalStorage } from 'background/storage'
import { isProd } from 'utils/env'
import {
  SettingsOptions,
  Layouts,
  Themes,
  ExtensionClickActions,
} from 'utils/settings'

const defaultSettings: SettingsOptions = {
  layout: Layouts.LIST,
  extensionClickAction: ExtensionClickActions.POPUP,
  showTabCountBadge: true,
  shortcuts: true,
  fontSize: 16,
  popupDimensions: {
    width: 600,
    height: 600,
  },
  popoutState: {
    top: 0,
    left: 0,
    height: 600,
    width: 600,
  },
  theme: Themes.LIGHT,
  debugMode: !isProd,
  saveClosedWindows: false,
  sortFocusedWindowFirst: false,
  saveIncognito: false,
  excludedUrls: {
    raw: `chrome://bookmarks
chrome-extension://*`,
    parsed: ['chrome://bookmarks', 'chrome-extension://*'],
    error: undefined,
  },
}

export interface Settings extends SettingsOptions {}
export class Settings {
  constructor(partialSettings?: Partial<SettingsOptions>) {
    this.setValues(partialSettings)
  }

  static async load(): Promise<Settings> {
    const settings = await LocalStorage.get<SettingsOptions>(
      LocalStorage.key.SETTINGS
    )
    return new Settings(settings)
  }

  async save() {
    await LocalStorage.set(LocalStorage.key.SETTINGS, this)
  }

  async setValues(partialSettings?: Partial<SettingsOptions>) {
    const {
      layout,
      extensionClickAction,
      showTabCountBadge,
      shortcuts,
      fontSize,
      popupDimensions,
      popoutState,
      theme,
      debugMode,
      saveClosedWindows,
      sortFocusedWindowFirst,
      saveIncognito,
      excludedUrls,
    }: SettingsOptions = Object.assign({}, defaultSettings, partialSettings)

    this.layout = layout
    this.extensionClickAction = extensionClickAction
    this.showTabCountBadge = showTabCountBadge
    this.shortcuts = shortcuts
    this.fontSize = fontSize
    this.popupDimensions = popupDimensions
    this.popoutState = popoutState
    this.theme = theme
    this.debugMode = debugMode
    this.saveClosedWindows = saveClosedWindows
    this.sortFocusedWindowFirst = sortFocusedWindowFirst
    this.saveIncognito = saveIncognito
    this.excludedUrls = excludedUrls
  }

  async update(partialSettings?: Partial<SettingsOptions>) {
    this.setValues(partialSettings)
    await this.save()
    return this
  }
}
