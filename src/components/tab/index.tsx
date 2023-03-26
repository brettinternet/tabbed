import cn, { Argument as ClassNames } from 'classnames'
import { forwardRef } from 'react'

import { Dropdown } from 'components/dropdown'
import { Icon, IconName } from 'components/icon'
import { useTabHandlers } from 'components/session/handlers'
import { Session } from 'utils/session'
import {
  isCurrentSessionTab,
  CurrentSessionTab,
  SavedSessionTab,
} from 'utils/session-tab'
import { SessionWindow } from 'utils/session-window'

import { Img } from './img'

export type TabProps = {
  windowId: SessionWindow['id']
  sessionId: Session['id']
  isDragging?: boolean
  tab: CurrentSessionTab | SavedSessionTab
  className?: ClassNames
  rootProps?: React.HTMLProps<HTMLDivElement>
  style?: React.CSSProperties
}

export const Tab = forwardRef<HTMLDivElement, TabProps>(
  (
    {
      sessionId,
      windowId,
      tab,
      isDragging = false,
      className,
      rootProps,
      style,
    },
    ref
  ) => {
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
    const { openTabs, updateTab, removeTabs } = useTabHandlers()

    const handleOpen = () => {
      openTabs({ sessionId, tabs: [{ windowId, tabIds: [tabId] }] })
    }

    // TODO: animate presence (delete) https://www.framer.com/docs/animate-presence/
    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          'group relative overflow-hidden transition-color transition-opacity duration-100 flex flex-row select-none rounded h-tab',
          isDragging ? 'shadow-xl' : 'shadow',
          active
            ? 'bg-green-50 dark:bg-green-900'
            : 'bg-white hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
          className
        )}
        {...rootProps}
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
          className="flex flex-row w-full max-w-full p-3"
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
                    updateTab({
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
                    updateTab({
                      sessionId,
                      windowId,
                      tabId,
                      options: { discarded: !discarded },
                    })
                  },
                  text: 'Free memory',
                  iconProps: { name: IconName.TAB_DISCARD },
                  disabled: discarded,
                },
                {
                  onClick: () => {
                    removeTabs({
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
)
