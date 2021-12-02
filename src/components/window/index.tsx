import { ButtonProps } from 'components/button'
import { Dropdown } from 'components/dropdown'
import { Icon } from 'components/icon'
import { useToasts } from 'components/toast/store'
import { SessionWindowData } from 'utils/sessions'

import { useHandlers } from './handlers'

type WindowHeaderProps = {
  sessionId: string
  window: SessionWindowData
}

/**
 * Window states:
 * "normal" | "minimized" | "maximized" | "fullscreen" | "docked"
 */
const getStateActions = (
  currentState: SessionWindowData['state'],
  updateWindowState: (state: SessionWindowData['state']) => void
): ButtonProps[] => {
  const normal: ButtonProps = {
    onClick: () => {
      updateWindowState('normal')
    },
    text: 'Normal',
    iconProps: { name: 'file' },
  }

  const minimize: ButtonProps = {
    onClick: () => {
      updateWindowState('minimized')
    },
    text: 'Minimize',
    iconProps: { name: 'file-minus' },
  }

  const fullscreen: ButtonProps = {
    onClick: () => {
      updateWindowState('fullscreen')
    },
    text: 'Fullscreen',
    iconProps: { name: 'file-plus' },
  }

  switch (currentState) {
    case 'normal':
      return [fullscreen, minimize]
    case 'minimized':
      return [normal, fullscreen]
    case 'fullscreen':
      return [normal]
    default:
      return []
  }
}

export const WindowHeader: React.FC<WindowHeaderProps> = ({
  sessionId,
  window: { id: windowId, focused, title, state, tabs, activeSession },
}) => {
  const { add: addToast } = useToasts()
  const {
    handleOpenWindow,
    handleSaveWindow,
    handleRemoveWindow,
    handleUpdateWindow,
  } = useHandlers(addToast)
  const handleOpen: React.MouseEventHandler<
    HTMLDivElement | HTMLButtonElement
  > = () => {
    if (!focused) {
      handleOpenWindow(sessionId, windowId)
    }
  }
  return (
    <div className="flex justify-between items-center transition-colors duration-75 hover:bg-gray-200">
      <div onDoubleClick={handleOpen} className="space-y-2 py-3 px-6 w-full">
        {title && <div>{title}</div>}
        <div className="flex items-center flex-wrap text-xs text-gray-500 space-x-2">
          <div>{state}</div>
          {focused && <Icon title="active" name="file-tick" size="sm" />}
          <div>
            {tabs.length} tab{tabs.length > 1 && 's'}
          </div>
        </div>
      </div>
      <div className="py-3 px-6">
        <Dropdown
          buttonVariant="none"
          actionGroups={[
            [
              {
                onClick: handleOpen,
                text: activeSession ? 'Focus' : 'Open',
                iconProps: { name: 'file-tick' },
                disabled: focused,
              },
              // {
              //   onClick: () => {
              //     handleSaveWindow(sessionId, windowId)
              //   },
              //   text: 'Save',
              //   iconProps: { name: 'save' },
              // },
              ...(activeSession
                ? getStateActions(
                    state,
                    (state: SessionWindowData['state']) => {
                      handleUpdateWindow(sessionId, windowId, { state })
                    }
                  )
                : []),
            ],
            [
              {
                onClick: () => {
                  handleRemoveWindow(sessionId, windowId)
                },
                text: activeSession ? 'Close' : 'Delete',
                iconProps: { name: activeSession ? 'x' : 'bin' },
              },
            ],
          ]}
        />
      </div>
    </div>
  )
}
