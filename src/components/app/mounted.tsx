import { useSettings } from 'components/settings/store'
import { useShortcuts } from 'components/shortcuts/store'

export const Mounted: React.FC = () => {
  const [settings] = useSettings()
  useShortcuts(settings?.shortcuts || false)

  return null
}
