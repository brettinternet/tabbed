import cn, { Argument as ClassNames } from 'classnames'

import { Button } from 'components/button'
import { Dropdown } from 'components/dropdown'
import { Icon, IconName } from 'components/icon'
import { Active } from 'components/indicators'
import { Shortcut } from 'components/session/shortcut'
import { useTabHandlers } from 'components/session/tab-handlers'
import { isExtensionUrl } from 'utils/browser'
import { useClipboard } from 'utils/clipboard'
import { stopPropagation } from 'utils/helpers'
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
  tab: CurrentSessionTab | SavedSessionTab
  className?: ClassNames
  isDragging: boolean
  isWindowFocused?: boolean
  index: number
  isLastTab: boolean
}

export const Tab: React.FC<TabProps> = ({
  sessionId,
  windowId,
  tab,
  isDragging,
  className,
  isWindowFocused,
  // index,
  // isLastTab,
}) => {
  const {
    id: tabId,
    url,
    favIconUrl,
    title,
    muted,
    audible,
    pinned,
    discarded,
    attention,
    active,
    // groupId,
  } = tab
  const isCurrentSession = isCurrentSessionTab(tab)
  const { openTabs, updateTab, removeTabs } = useTabHandlers()
  const { onCopy } = useClipboard(url)

  const handleCopyUrl: React.MouseEventHandler<HTMLElement> = (event) => {
    event.stopPropagation()
    onCopy()
  }

  const handleOpen: React.MouseEventHandler<HTMLElement> = (event) => {
    event.stopPropagation()
    openTabs({ sessionId, tabs: [{ windowId, tabIds: [tabId] }] })
  }

  const handlePinToggle: React.MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    event.stopPropagation()
    updateTab({
      sessionId,
      windowId,
      tabId,
      options: { pinned: !pinned },
    })
  }

  const handleMuteToggle: React.MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    event.stopPropagation()
    updateTab({
      sessionId,
      windowId,
      tabId,
      options: { muted: !muted },
    })
  }

  const handleRemove: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation()
    removeTabs({
      sessionId,
      tabs: [{ windowId, tabIds: [tabId] }],
    })
  }

  // const tabOrder = index + 1

  return (
    <div
      className={cn(
        'relative overflow-hidden group rounded border border-gray-100 dark:border-gray-700 transition-color duration-100',
        isDragging ? 'shadow-xl' : 'shadow',
        active
          ? 'bg-green-50 dark:bg-teal-900'
          : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700',
        className
      )}
    >
      <div
        className={cn('h-tab relative p-3 flex flex-col justify-between')}
        onDoubleClick={handleOpen}
      >
        {isWindowFocused && active && (
          <div className="absolute left-0 top-0">
            <Active aria-label="Tab is focused" title="Focused" />
          </div>
        )}
        <div className="flex flex-row w-full max-w-full">
          <Img
            src={favIconUrl}
            className="mr-2"
            alt={title || 'Site image'}
            url={url}
          />
          {/* width is full width - image width (w-8) - padding right (p-3) */}
          <div className="w-[calc(100%-2.75rem)]">
            {title && (
              <div className="line-clamp-2 leading-3 font-semibold text-gray-700 dark:text-gray-400 mb-1">
                {title}
              </div>
            )}
            <div className="truncate max-w-full leading-3 inline-block text-blue-500 text-xxs font-light">
              {url}
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-start items-center overflow-hidden w-full max-w-full space-x-2">
          {(audible || muted) && (
            <Button
              iconProps={{
                name: muted ? IconName.MUTE : IconName.AUDIBLE,
                size: 'xs',
              }}
              variant="card-action"
              shape="outline"
              onClick={handleMuteToggle}
              onDoubleClick={stopPropagation}
              aria-label={muted ? 'Mute tab' : 'Unmute tab'}
              title={muted ? 'Mute tab' : 'Unmute tab'}
            />
          )}
          {attention && (
            <Icon
              name={IconName.ALERT}
              title="Tab has notification"
              aria-label="Tab has notification"
              size="xs"
              className="text-red-500"
            />
          )}
          {/* TODO: tab shortcuts */}
          {/* {tabOrder < 9 ? (
            <Shortcut
              value={tabOrder}
              onClick={handleOpen}
              ariaLabel="focus tab"
              modifier={{ mac: 'command', other: 'control' }}
            />
          ) : (
            isLastTab && (
              <Shortcut
                value={9}
                onClick={handleOpen}
                ariaLabel="focus tab"
                modifier={{ mac: 'command', other: 'control' }}
              />
            )
          )} */}
          {isExtensionUrl(url) && (
            <Shortcut
              value={'+Shift+S'}
              onClick={handleOpen}
              ariaLabel="focus tab"
              modifier={{ mac: 'command', other: 'control' }}
            />
          )}
          <Button
            iconProps={{ name: IconName.PIN, size: 'xs' }}
            className={cn(
              'transition-opacity duration-100',
              pinned
                ? 'text-orange-600 hover:bg-gray-100 dark:border-gray-600'
                : 'opacity-0 group-hover:opacity-100'
            )}
            variant={pinned ? 'none' : 'card-action'}
            shape="outline"
            onClick={handlePinToggle}
            onDoubleClick={stopPropagation}
            aria-label={pinned ? 'Unpin tab' : 'Pin tab'}
            title={pinned ? 'Unpin tab' : 'Pin tab'}
          />
        </div>
      </div>
      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-100 h-full right-0 bottom-0 top-0 flex flex-col items-center justify-between p-3">
        <Button
          iconProps={{ name: IconName.CLOSE, size: 'xs' }}
          variant="card-action"
          className={cn(
            'rounded-full text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-50',
            active
              ? 'bg-green-50 dark:bg-teal-900'
              : 'bg-gray-50 dark:bg-gray-700'
          )}
          onClick={handleRemove}
          onDoubleClick={stopPropagation}
          aria-label={isCurrentSession ? 'Close' : 'Remove'}
          title={isCurrentSession ? 'Close' : 'Remove'}
        />

        <Dropdown
          buttonProps={{
            className: cn(
              'rounded-full text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-50',
              active
                ? 'bg-green-50 dark:bg-teal-900'
                : 'bg-gray-50 dark:bg-gray-700'
            ),
          }}
          iconProps={{
            size: 'sm',
          }}
          actionGroups={[
            [
              {
                onClick: handleOpen,
                text: 'Open',
                iconProps: { name: IconName.WINDOW_OPEN },
              },
              {
                onClick: handlePinToggle,
                text: pinned ? 'Unpin' : 'Pin',
                iconProps: { name: IconName.PIN },
              },
              {
                onClick: handleMuteToggle,
                text: muted ? 'Unmute' : 'Mute',
                iconProps: { name: IconName.MUTE },
              },
              {
                onClick: handleCopyUrl,
                text: 'Copy URL',
                iconProps: { name: IconName.COPY_TO_CLIPBOARD },
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
                onClick: handleRemove,
                text: isCurrentSession ? 'Close' : 'Remove',
                iconProps: {
                  name: isCurrentSession
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
