import cn, { Argument as ClassNames } from 'classnames'

import { Icon, IconName } from 'components/icon'
import { Active } from 'components/indicators'
import { FocusButton, FocusDropdown } from 'components/session/focus-button'
import { Shortcut } from 'components/session/shortcut'
import { useTabHandlers } from 'components/session/tab-handlers'
import { isExtensionUrl } from 'utils/browser'
import { useClipboard } from 'utils/clipboard'
import { stopPropagation } from 'utils/dom'
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

/**
 * Don't add color transition here, causes glitch with tab moving
 */
export const getTabBackgroundColor = (active?: boolean) =>
  active
    ? 'bg-green-50 dark:bg-cyan-950'
    : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700'

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
        'relative overflow-hidden group rounded border border-gray-100 dark:border-gray-700',
        isDragging ? 'shadow-xl' : 'shadow',
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
              <div className="line-clamp-2 leading-3 font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {title}
              </div>
            )}
            <div className="truncate max-w-full leading-3 inline-block text-blue-500 dark:text-blue-300 text-xxs font-light">
              {url}
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-start items-center w-full max-w-full space-x-2">
          {(audible || muted) && (
            <FocusButton
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
          {isExtensionUrl(url) && (
            <Shortcut
              value="S"
              onClick={handleOpen}
              ariaLabel="focus tab"
              modifiers={[
                { mac: 'command', other: 'control' },
                { other: 'shift' },
              ]}
            />
          )}
          <FocusButton
            iconProps={{ name: IconName.PIN, size: 'xs' }}
            className={cn(
              'transition-opacity duration-100',
              pinned
                ? 'text-orange-600 dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600'
                : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
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
      <div className="absolute h-full right-0 bottom-0 top-0 flex flex-col items-center justify-between p-3">
        <FocusButton
          iconProps={{ name: IconName.CLOSE, size: 'xs' }}
          variant="card-action"
          className={cn(
            'rounded-full text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-50',
            'opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-100',
            active
              ? 'bg-green-50 dark:bg-teal-900'
              : 'bg-gray-50 dark:bg-gray-700'
          )}
          onClick={handleRemove}
          onDoubleClick={stopPropagation}
          aria-label={isCurrentSession ? 'Close' : 'Remove'}
          title={isCurrentSession ? 'Close' : 'Remove'}
        />

        <FocusDropdown
          buttonProps={{
            className: cn(
              'rounded-full text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-50',
              'opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-100',
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
