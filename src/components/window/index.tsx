import cn, { Argument as ClassNames } from 'classnames'

import { ButtonProps } from 'components/button'
import { Dropdown } from 'components/dropdown'
import { Icon, IconName } from 'components/icon'
import { SessionWindowData } from 'utils/sessions'

import { useHandlers } from './handlers'

type WindowHeaderProps = {
  sessionId: string
  window: SessionWindowData
  className?: ClassNames
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
    iconProps: { name: IconName.WINDOW },
  }

  const minimize: ButtonProps = {
    onClick: () => {
      updateWindowState('minimized')
    },
    text: 'Minimize',
    iconProps: { name: IconName.MINIMIZE },
  }

  const fullscreen: ButtonProps = {
    onClick: () => {
      updateWindowState('fullscreen')
    },
    text: 'Fullscreen',
    iconProps: { name: IconName.FULLSCREEN },
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
  window: {
    id: windowId,
    focused,
    title,
    state,
    tabs,
    activeSession,
    incognito,
  },
  className,
}) => {
  const {
    handleOpenWindow,
    // handleSaveWindow,
    handleRemoveWindow,
    handleUpdateWindow,
  } = useHandlers()

  const handleOpen: React.MouseEventHandler<
    HTMLDivElement | HTMLButtonElement
  > = () => {
    if (!focused) {
      handleOpenWindow({ sessionId, windowIds: [windowId] })
    }
  }

  return (
    <div
      className={cn(
        'group relative flex justify-between items-center transition-colors duration-75 hover:bg-gray-200 dark:hover:bg-gray-800',
        className
      )}
    >
      <div
        onDoubleClick={handleOpen}
        className="space-y-2 py-3 px-6 w-full max-w-full"
      >
        {title && (
          <div className="truncate max-w-full inline-block">{title}</div>
        )}
        <div className="flex items-center flex-wrap text-xs text-gray-500 space-x-2">
          <div>{state}</div>
          {focused && (
            <Icon title="active" name={IconName.WINDOW_OPEN} size="sm" />
          )}
          {incognito && (
            <Icon title="active" name={IconName.INCOGNITO} size="sm" />
          )}
          <div>
            {tabs.length} tab{tabs.length > 1 && 's'}
          </div>
        </div>
      </div>
      <div className="absolute h-full right-0 py-3 px-6 transition-opacity duration-75 opacity-0 group-hover:opacity-100">
        <Dropdown
          dropdownOffset
          buttonProps={{
            className:
              'bg-gray-200 border border-gray-400 dark:bg-gray-800 dark:border-gray-600',
          }}
          actionGroups={[
            [
              {
                onClick: handleOpen,
                text: activeSession ? 'Focus' : 'Open',
                iconProps: { name: IconName.WINDOW_OPEN },
                disabled: focused,
              },
              // {
              //   onClick: () => {
              //     handleSaveWindow(sessionId, windowId)
              //   },
              //   text: 'Save',
              //   iconProps: { name: IconName.SAVE },
              // },
              ...(activeSession
                ? getStateActions(
                    state,
                    (state: SessionWindowData['state']) => {
                      handleUpdateWindow({
                        sessionId,
                        windowId,
                        options: { state },
                      })
                    }
                  )
                : []),
            ],
            [
              {
                onClick: () => {
                  handleRemoveWindow({ sessionId, windowIds: [windowId] })
                },
                text: activeSession ? 'Close' : 'Delete',
                iconProps: {
                  name: activeSession
                    ? IconName.WINDOW_REMOVE
                    : IconName.DELETE,
                },
              },
            ],
          ]}
        />
      </div>
    </div>
  )
}
