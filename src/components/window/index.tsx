import cn, { Argument as ClassNames } from 'classnames'

import { Dropdown, DropdownButtonProps } from 'components/dropdown'
import { Icon, IconName } from 'components/icon'
import { useWindowHandlers } from 'components/session/handlers'
import { BrandedUuid } from 'utils/generate'
import { isCurrentSessionWindow, SessionWindow } from 'utils/session-window'

type WindowHeaderProps = {
  sessionId: BrandedUuid<'session'>
  window: SessionWindow
  className?: ClassNames
}

/**
 * Window states:
 * "normal" | "minimized" | "maximized" | "fullscreen" | "docked"
 */
const getStateActions = (
  currentState: SessionWindow['state'],
  updateWindowState: (state: SessionWindow['state']) => void
): DropdownButtonProps[] => {
  const normal: DropdownButtonProps = {
    onClick: () => {
      updateWindowState('normal')
    },
    text: 'Normal',
    iconProps: { name: IconName.WINDOW },
  }

  const minimize: DropdownButtonProps = {
    onClick: () => {
      updateWindowState('minimized')
    },
    text: 'Minimize',
    iconProps: { name: IconName.MINIMIZE },
  }

  const fullscreen: DropdownButtonProps = {
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
  window: win,
  className,
}) => {
  const { id: windowId, focused, title, state, tabs, incognito } = win
  const { openWindows, updateWindow, removeWindows } = useWindowHandlers()

  const handleOpen = () => {
    if (!focused) {
      openWindows({ sessionId, windowIds: [windowId] })
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
                text: isCurrentSessionWindow(win) ? 'Focus' : 'Open',
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
              ...(isCurrentSessionWindow(win)
                ? getStateActions(state, (state: SessionWindow['state']) => {
                    updateWindow({
                      sessionId,
                      windowId,
                      options: { state },
                    })
                  })
                : []),
            ],
            [
              {
                onClick: () => {
                  removeWindows({ sessionId, windowIds: [windowId] })
                },
                text: isCurrentSessionWindow(win) ? 'Close' : 'Delete',
                iconProps: {
                  name: isCurrentSessionWindow(win)
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
