import { Dropdown } from 'components/dropdown'
import { IconName } from 'components/icon'
import { useModal } from 'components/modal/store'

type ModalDropdownProps = {
  // Disable portal when in modal to avoid click passthrough to overlay
  inModal?: boolean
}

export const ModalDropdown: React.FC<ModalDropdownProps> = ({
  inModal = false,
}) => {
  const { settings, shortcuts, help, about } = useModal()
  return (
    <Dropdown
      buttonProps={{
        variant: 'transparent',
      }}
      iconProps={{ name: IconName.MORE }}
      menuItemsClassName="text-base text-gray-800 dark:text-gray-200"
      portalEnabled={!inModal}
      animatedExit={!inModal}
      actionGroups={[
        [
          {
            onClick: () => {
              shortcuts.set(true)
            },
            text: 'Shortcuts',
            iconProps: {
              name: IconName.KEYBOARD,
              size: 'sm',
            },
          },
          {
            onClick: () => {
              help.set(true)
            },
            text: 'Help',
            iconProps: {
              name: IconName.HELP,
              size: 'sm',
            },
          },
          {
            onClick: () => {
              about.set(true)
            },
            text: 'About',
            iconProps: {
              name: IconName.INFO,
              size: 'sm',
            },
          },
        ],
        [
          {
            onClick: () => {
              settings.set(true)
            },
            text: 'Settings',
            iconProps: {
              name: IconName.SETTINGS,
              size: 'sm',
            },
          },
        ],
      ]}
    />
  )
}
