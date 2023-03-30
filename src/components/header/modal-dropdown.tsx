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
  const { settings, help, about } = useModal()
  return (
    <Dropdown
      dropdownOffset={-28}
      buttonProps={{
        className: 'text-gray-600 dark:text-gray-400',
        variant: 'transparent',
      }}
      iconProps={{ name: IconName.MORE }}
      menuItemsClassName="text-base"
      portalEnabled={!inModal}
      animatedExit={!inModal}
      actionGroups={[
        [
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
