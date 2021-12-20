import cn, { Argument as ClassNames } from 'classnames'

import { Dropdown } from 'components/dropdown'
import { Icon, IconName } from 'components/icon'
import {
  isCurrentSessionTab,
  SessionData,
  SessionWindowData,
  SomeSessionTabData,
} from 'utils/sessions'

import { useHandlers } from './handlers'
import { Img } from './img'

// TODO: add missing indicatorrs
/* <div className="flex items-center flex-wrap">
    {muted && (
      <Icon
        title="muted"
        name={IconName.MUTE}
        className="mr-2"
        size="sm"
      />
    )}
    {discarded && (
      <Icon
        title="discarded"
        name={IconName.WINDOW_REMOVE}
        className="mr-2"
        size="sm"
      />
    )}
    {attention && (
      <Icon title="alert" name={IconName.ALERT} className="mr-2" size="sm" />
    )}
    {isDefined(groupId) && groupId > -1 && (
      <span
        title="group ID"
        className="inline-block px-1 bg-yellow-900 mr-2"
      >
        {groupId}
      </span>
    )}
  </div> */

export type TabProps = {
  windowId: SessionWindowData['id']
  sessionId: SessionData['id']
  isDragging: boolean
  tab: SomeSessionTabData
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
    // muted,
    pinned,
    discarded,
    // attention,
    active,
    // groupId,
  } = tab

  const handleOpen = () => {
    handleOpenTab({ sessionId, tabs: [{ windowId, tabIds: [tabId] }] })
  }

  // TODO: animate presence (delete) https://www.framer.com/docs/animate-presence/
  return (
    <div
      className={cn(
        'group relative overflow-hidden transition-color transition-opacity duration-100 flex flex-row rounded h-tab',
        isDragging ? 'shadow-xl' : 'shadow',
        active
          ? 'bg-green-50 dark:bg-green-900'
          : 'bg-white hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
        className
      )}
    >
      {pinned && (
        <div className="absolute rotate-45">
          <div className="absolute -left-1 -top-4 h-8 w-5 bg-orange-400 dark:bg-orange-600" />
          <Icon
            className="absolute -top-1.5 left-1 text-white dark:text-gray-800"
            title="pinned"
            name={IconName.PIN}
            size="xs"
          />
        </div>
      )}
      <div
        onDoubleClick={handleOpen}
        className="flex flex-row p-3 w-full max-w-full"
      >
        <Img
          src={favIconUrl}
          className="mr-3"
          alt={title || 'Site image'}
          url={url}
        />
        {/* width is full width - image width (w-8) - padding right (p-3) */}
        <div className="space-y-2 w-[calc(100%-2.75rem)]">
          {title && <div className="line-clamp-2">{title}</div>}
          <div className="truncate max-w-full inline-block text-blue-500">
            {url}
          </div>
        </div>
      </div>
      <div className="absolute h-full right-0 flex items-start space-x-2 p-3">
        <Dropdown
          dropdownOffset
          buttonProps={{
            className:
              'transition-opacity duration-75 opacity-0 group-hover:opacity-100 focus:opacity-100 bg-gray-200 border border-gray-400 dark:bg-gray-800 dark:border-gray-600',
          }}
          actionGroups={[
            [
              {
                onClick: handleOpen,
                text: 'Open',
                iconProps: { name: IconName.WINDOW_OPEN },
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
                iconProps: { name: IconName.PIN },
              },
            ],
            [
              {
                onClick: () => {
                  handleDiscardTab({ sessionId, windowId, tabIds: [tabId] })
                },
                text: 'Free memory',
                iconProps: { name: IconName.TAB_DISCARD },
                disabled: discarded,
              },
              {
                onClick: () => {
                  handleRemoveTab({
                    sessionId,
                    tabs: [{ windowId, tabIds: [tabId] }],
                  })
                },
                text: isCurrentSessionTab(tab) ? 'Close' : 'Remove',
                iconProps: {
                  name: isCurrentSessionTab(tab)
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
