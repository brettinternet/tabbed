import cn, { Argument as ClassNames } from 'classnames'
import browser from 'webextension-polyfill'

import { Button } from 'components/button'
import { Dropdown, DropdownButtonProps } from 'components/dropdown'
import { Icon, IconName } from 'components/icon'
import { Active } from 'components/indicators'
import { Shortcut } from 'components/session/shortcut'
import { useWindowHandlers } from 'components/session/window-handlers'
import { useWindowShortcuts } from 'components/shortcuts/sessions'
import { useClipboard } from 'utils/clipboard'
import { BrandedUuid } from 'utils/generate'
import { stopPropagation } from 'utils/helpers'
import {
  CurrentSessionWindow,
  isCurrentSessionWindow,
  SavedSessionWindow,
  SessionWindow,
} from 'utils/session-window'

type StateActions = {
  dropdownStateItems: DropdownButtonProps[]
  stateActionTitle: string | undefined
  stateAction: DropdownButtonProps | undefined
}

/**
 * Window states:
 * "normal" | "minimized" | "maximized" | "fullscreen" | "docked"
 */
const useStateActions = (
  currentState: SessionWindow['state'],
  updateWindowState: (state: SessionWindow['state']) => void
): StateActions => {
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

  let dropdownStateItems: DropdownButtonProps[] = []
  switch (currentState) {
    case 'normal':
      dropdownStateItems = [fullscreen, minimize]
      break
    case 'minimized':
      dropdownStateItems = [normal, fullscreen]
      break
    case 'fullscreen':
      dropdownStateItems = [normal]
      break
    default:
      dropdownStateItems = []
      break
  }
  let stateActionTitle: string | undefined
  let stateAction: DropdownButtonProps | undefined
  switch (currentState) {
    case 'normal':
      stateActionTitle = 'Minimize'
      stateAction = minimize
      break
    case 'minimized':
      stateActionTitle = 'Normal'
      stateAction = normal
      break
    case 'fullscreen':
      stateActionTitle = 'Normal'
      stateAction = normal
      break
  }
  return {
    dropdownStateItems,
    stateActionTitle,
    stateAction,
  }
}

type WindowHeaderProps = {
  sessionId: BrandedUuid<'session'>
  window: CurrentSessionWindow | SavedSessionWindow
  className?: ClassNames
  index: number
  isLast: boolean
}

export const WindowHeader: React.FC<WindowHeaderProps> = ({
  sessionId,
  window: win,
  className,
  index,
  isLast,
}) => {
  const windowOrder = index + 1
  const { id: windowId, focused, title, state, tabs, incognito } = win
  const { openWindows, updateWindow, removeWindows } = useWindowHandlers()
  const { onCopy } = useClipboard(win.tabs.map((t) => t.url).join('\n'))

  const handleCopyUrl: React.MouseEventHandler<HTMLElement> = (event) => {
    event.stopPropagation()
    onCopy()
  }

  const handleOpen = () => {
    if (!focused) {
      openWindows({ sessionId, windowIds: [windowId] })
    }
  }

  useWindowShortcuts(
    windowOrder < 9 || isLast ? windowOrder : undefined,
    handleOpen
  )

  const handleNewTab = () => {
    if ('assignedWindowId' in win) {
      browser.tabs.create({ windowId: win.assignedWindowId })
    }
  }

  const { stateAction, stateActionTitle, dropdownStateItems } = useStateActions(
    state,
    (state: SessionWindow['state']) => {
      updateWindow({
        sessionId,
        windowId,
        options: { state },
      })
    }
  )

  return (
    <div
      className={cn(
        'group relative py-3 px-6 flex justify-between items-center transition-colors duration-75 hover:bg-gray-200 dark:hover:bg-gray-800',
        className
      )}
    >
      <div
        onDoubleClick={handleOpen}
        className={cn(
          'flex-1 flex flex-col h-full w-full max-w-[248px]',
          title ? 'justify-between' : 'justify-end'
        )}
      >
        {focused && (
          <div className="absolute left-0 top-0">
            <Active aria-label="Window is focused" title="Focused" />
          </div>
        )}
        {title && (
          <div className="line-clamp-2 max-w-full inline-block font-semibold text-gray-700 dark:text-gray-400">
            {title}
          </div>
        )}
        <div className="flex flex-row justify-start items-center overflow-hidden w-full max-w-full space-x-2">
          {windowOrder < 9 && (
            <Shortcut
              value={windowOrder}
              onClick={handleOpen}
              ariaLabel="focus window"
              modifiers={[
                {
                  mac: 'option',
                  other: 'alt',
                },
              ]}
            />
          )}
          {stateAction && (
            <Button
              variant="card-action"
              shape="none"
              className="text-xxs px-1 border rounded h-5"
              onClick={stateAction.onClick}
              onDoubleClick={stopPropagation}
              aria-label={stateActionTitle}
              title={stateActionTitle}
            >
              {state}
            </Button>
          )}
          <div className="text-gray-500 px-1 text-xxs">
            {tabs.length} tab{tabs.length > 1 && 's'}
          </div>
          {'assignedWindowId' in win && (
            <Button
              variant="none"
              shape="icon"
              className="text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-50"
              iconProps={{
                name: IconName.ADD,
                size: 'sm',
              }}
              onClick={handleNewTab}
              onDoubleClick={stopPropagation}
            />
          )}
          {incognito && (
            <Icon
              title="Incognito"
              aria-label="Incognito window"
              name={IconName.INCOGNITO}
              size="xs"
              className="text-purple-600 dark:text-indigo-200"
            />
          )}
        </div>
      </div>
      <div className="flex flex-row items-center justify-center">
        <Dropdown
          dropdownOffset={-24}
          buttonProps={{
            className: 'text-gray-400 hover:text-gray-700',
          }}
          iconProps={{
            size: 'sm',
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
              ...dropdownStateItems,
              {
                onClick: handleCopyUrl,
                text: 'Copy tab URLs',
                iconProps: { name: IconName.COPY_TO_CLIPBOARD },
              },
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
