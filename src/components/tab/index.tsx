import cn, { Argument as ClassNames } from 'classnames'

import { Dropdown } from 'components/dropdown'
import { Icon } from 'components/icon'
import { isDefined } from 'utils/helpers'
import { SessionData, SessionWindowData, SessionTabData } from 'utils/sessions'

import { useHandlers } from './handlers'
import { Img } from './img'

export type TabProps = {
  windowId: SessionWindowData['id']
  sessionId: SessionData['id']
  isDragging: boolean
  tab: SessionTabData
  className?: ClassNames
}

export const Tab: React.FC<TabProps> = ({
  sessionId,
  windowId,
  tab,
  isDragging,
  className,
}) => {
  const { handleOpenTab, handleRemoveTab, handleUpdateTab, handleDiscardTab } =
    useHandlers()

  const {
    id: tabId,
    url,
    favIconUrl,
    title,
    muted,
    pinned,
    discarded,
    attention,
    active,
    groupId,
  } = tab

  const handleOpen:
    | React.MouseEventHandler<HTMLButtonElement | HTMLDivElement>
    | undefined = tab.activeSession
    ? (ev) => {
        ev.preventDefault()
        handleOpenTab({ sessionId, tabs: [{ windowId, tabIds: [tabId] }] })
        return false
      }
    : undefined

  // TODO: animate presence (delete) https://www.framer.com/docs/animate-presence/
  return (
    <div
      aria-disabled={tab.activeSession && tab.active}
      className={cn(
        'group relative appearance-none transition-color transition-opacity duration-100 flex flex-row rounded',
        isDragging ? 'shadow-xl' : 'shadow',
        'bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
        className
      )}
    >
      <div
        onDoubleClick={handleOpen}
        className="flex flex-row p-3 w-full max-w-full"
      >
        {favIconUrl && (
          <Img
            src={favIconUrl}
            className="w-8 h-8 min-w-min overflow-hidden mr-3 rounded-full"
            alt={title || 'Site image'}
          />
        )}
        {/* width is full width - image width (w-8) - padding right (p-3) */}
        <div className="space-y-2 w-[calc(100%-2.75rem)]">
          {title && <div>{title}</div>}
          <div className="truncate max-w-full inline-block text-blue-500">
            {url}
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
                <Icon
                  title="muted"
                  name="sound-off"
                  className="mr-2"
                  size="sm"
                />
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
                  className="inline-block px-1 bg-yellow-900 mr-2"
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
      <div className="absolute h-full right-0 flex items-start space-x-2 p-3 transition-opacity duration-75 opacity-0 group-hover:opacity-100">
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
                text: 'Open',
                iconProps: { name: 'file-plus' },
              },
              {
                onClick: () => {
                  handleUpdateTab({
                    sessionId,
                    windowId,
                    tabId,
                    options: { pinned: !pinned },
                  })
                },
                text: pinned ? 'Unpin' : 'Pin',
                iconProps: { name: 'thumbtack' },
              },
            ],
            [
              {
                onClick: () => {
                  handleDiscardTab({ sessionId, windowId, tabIds: [tabId] })
                },
                text: 'Free memory',
                iconProps: { name: 'section-remove' },
                disabled: discarded,
              },
              {
                onClick: () => {
                  handleRemoveTab({
                    sessionId,
                    tabs: [{ windowId, tabIds: [tabId] }],
                  })
                },
                text: tab.activeSession ? 'Close' : 'Remove',
                iconProps: { name: 'bin' },
              },
            ],
          ]}
        />
      </div>
    </div>
  )
}
