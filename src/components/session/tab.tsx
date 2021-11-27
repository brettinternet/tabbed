import cn from 'classnames'
import { DraggableProvided } from 'react-beautiful-dnd'

import { Dropdown } from 'components/dropdown'
import { Icon } from 'components/icon'
import { Link as A } from 'components/link'
import { Session } from 'utils/browser/session'
import { SessionTab } from 'utils/browser/session-tab'
import { SessionWindow } from 'utils/browser/session-window'
import { isDefined } from 'utils/helpers'

export type TabProps = {
  windowId: SessionWindow['id']
  sessionId: Session['id']
  provided: DraggableProvided
  isDragging: boolean
  tab: SessionTab
}

export const Tab: React.FC<TabProps> = ({ provided, tab, isDragging }) => {
  const { url, title, muted, pinned, discarded, attention, active, groupId } =
    tab

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> | undefined =
    tab.activeSession
      ? (ev) => {
          ev.preventDefault()
          if (!tab.active) {
            tab.focus()
          }
          return false
        }
      : undefined

  return (
    <div
      aria-disabled={tab.activeSession && tab.active}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={cn(
        'group appearance-none transition-color transition-opacity duration-100 flex flex-row p-3 rounded mb-2 border',
        isDragging ? 'border-gray-500 shadow-xl' : 'border-transparent shadow',
        'bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
      )}
    >
      <div className="space-y-2 w-full">
        <div className="flex items-start justify-between">
          <div>
            {title && <div>{title}</div>}
            <div className="truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg inline-block text-blue-500">
              {url}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <A
              href={tab.url}
              onClick={handleClick}
              target="_blank"
              rel="noopener noreferrer"
              variant="button"
              buttonVariant="none"
              className="bg-gray-100 transition-opacity duration-75 opacity-0 group-hover:opacity-100"
              iconProps={{ name: 'file-plus' }}
            />
            <Dropdown
              className="transition-opacity duration-75 opacity-0 group-hover:opacity-100"
              buttonVariant="none"
              actionGroups={[
                [
                  {
                    onClick: () => {
                      tab.togglePin()
                    },
                    text: pinned ? 'Unpin' : 'Pin',
                    iconProps: { name: 'thumbtack' },
                  },
                ],
                [
                  {
                    onClick: () => {
                      tab.remove()
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
          <div className="flex flex-wrap">
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
