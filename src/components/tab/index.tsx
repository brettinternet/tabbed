import cn from 'classnames'

import { Dropdown } from 'components/dropdown'
import { Icon } from 'components/icon'
import { isDefined } from 'utils/helpers'
import { SessionData, SessionWindowData, SessionTabData } from 'utils/sessions'

export type TabProps = {
  windowId: SessionWindowData['id']
  sessionId: SessionData['id']
  isDragging: boolean
  tab: SessionTabData
}

export const Tab: React.FC<TabProps> = ({ tab, isDragging }) => {
  const { url, title, muted, pinned, discarded, attention, active, groupId } =
    tab

  const handleOpen:
    | React.MouseEventHandler<HTMLButtonElement | HTMLDivElement>
    | undefined = tab.activeSession
    ? (ev) => {
        ev.preventDefault()
        if (!active) {
          // tab.focus()
        }
        return false
      }
    : undefined

  return (
    <div
      aria-disabled={tab.activeSession && tab.active}
      onDoubleClick={handleOpen}
      className={cn(
        'relative appearance-none transition-color transition-opacity duration-100 flex flex-row p-3 rounded border',
        isDragging ? 'shadow-xl' : 'shadow',
        'bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
      )}
    >
      <div className="space-y-2 w-full">
        <div className="flex items-center justify-between">
          <div className="max-w-tab-content">
            {title && <div>{title}</div>}
            <div className="truncate max-w-full inline-block text-blue-500">
              {url}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Dropdown
              buttonVariant="none"
              actionGroups={[
                [
                  {
                    onClick: handleOpen,
                    text: 'Open',
                    iconProps: { name: 'file-plus' },
                  },
                  {
                    onClick: () => {
                      // tab.togglePin()
                    },
                    text: pinned ? 'Unpin' : 'Pin',
                    iconProps: { name: 'thumbtack' },
                  },
                ],
                [
                  {
                    onClick: () => {
                      // tab.remove()
                    },
                    text: tab.activeSession ? 'Close' : 'Remove',
                    iconProps: { name: 'bin' },
                  },
                ],
              ]}
            />
          </div>
        </div>
        {(pinned ||
          muted ||
          discarded ||
          attention ||
          (isDefined(groupId) && groupId > -1) ||
          active) && (
          <div className="flex items-center flex-wrap">
            {pinned && (
              <Icon
                title="pinned"
                name="thumbtack"
                className="mr-2"
                size="sm"
              />
            )}
            {muted && (
              <Icon title="muted" name="sound-off" className="mr-2" size="sm" />
            )}
            {discarded && (
              <Icon
                title="discarded"
                name="file-no-access"
                className="mr-2"
                size="sm"
              />
            )}
            {attention && (
              <Icon title="alert" name="alarm" className="mr-2" size="sm" />
            )}
            {isDefined(groupId) && groupId > -1 && (
              <span
                title="group ID"
                className="inline-block px-1 bg-yellow-200 mr-2"
              >
                {groupId}
              </span>
            )}
            {active && (
              <Icon
                title="active"
                name="file-tick"
                className="mr-2"
                size="sm"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
