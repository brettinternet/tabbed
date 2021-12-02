import { LocalStorage } from 'background/storage'
import { SettingsData, defaultSettings } from 'utils/settings'

export interface Settings extends SettingsData {}
export class Settings {
  constructor(partialSettings?: Partial<SettingsData>) {
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
    }: SettingsData = Object.assign({}, defaultSettings, partialSettings)

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

  static async load(): Promise<Settings> {
    const settings = await LocalStorage.get<SettingsData>(
      LocalStorage.key.SETTINGS
    )
    return new Settings(settings)
  }

  async save() {
    await LocalStorage.set(LocalStorage.key.SETTINGS, this)
  }

  async update(partialSettings: Partial<SettingsData>) {
    this.updateValues(partialSettings)
    await this.save()
    // TODO: push update to frontend (in case separate windows and one has stale settings)
    return this
  }

  private async updateValues({
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
  }: Partial<SettingsData>) {
    this.layout = layout ?? this.layout
    this.extensionClickAction =
      extensionClickAction ?? this.extensionClickAction
    this.showTabCountBadge = showTabCountBadge ?? this.showTabCountBadge
    this.shortcuts = shortcuts ?? this.shortcuts
    this.fontSize = fontSize ?? this.fontSize
    this.popupDimensions = popupDimensions ?? this.popupDimensions
    this.popoutState = popoutState ?? this.popoutState
    this.theme = theme ?? this.theme
    this.debugMode = debugMode ?? this.debugMode
    this.saveClosedWindows = saveClosedWindows ?? this.saveClosedWindows
    this.sortFocusedWindowFirst =
      sortFocusedWindowFirst ?? this.sortFocusedWindowFirst
    this.saveIncognito = saveIncognito ?? this.saveIncognito
    this.excludedUrls = excludedUrls ?? this.excludedUrls
  }
}
