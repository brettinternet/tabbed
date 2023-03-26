import cn from 'classnames'
import { forwardRef } from 'react'

import { Tab } from 'components/tab'
import { WindowHeader } from 'components/window'
import { Session } from 'utils/session'
import { SessionWindow } from 'utils/session-window'

export const windowColumnWidths =
  'w-full md:w-80 lg:w-96 md:min-w-[20rem] lg:min-w-[24rem]'

const getContainerBackground = ({
  isDraggingOver,
  isDragging,
  incognito,
}: {
  isDraggingOver: boolean
  isDragging: boolean
  incognito: boolean
}) => {
  if (isDraggingOver) {
    return 'bg-blue-100 dark:bg-green-900'
  }

  if (isDragging) {
    return 'bg-blue-100 dark:bg-blue-900'
  }

  if (incognito) {
    return 'bg-indigo-100 dark:bg-indigo-900'
  }

  return 'bg-gray-100 dark:bg-gray-900'
}

const getHeaderBackground = ({
  isDraggingOver,
  isDragging,
  incognito,
}: {
  isDraggingOver: boolean
  isDragging: boolean
  incognito: boolean
}) => {
  if (isDraggingOver) {
    return 'bg-blue-200 dark:bg-green-900'
  }

  if (isDragging) {
    return 'bg-blue-200 dark:bg-blue-900'
  }

  if (incognito) {
    return 'bg-indigo-200 dark:bg-indigo-900'
  }

  return 'bg-gray-100 dark:bg-gray-900'
}

export type WindowColumnProps = React.PropsWithChildren<{
  isDragging?: boolean
  isDraggingOver?: boolean
  sessionId: Session['id']
  window: SessionWindow
  rootProps?: React.HTMLProps<HTMLDivElement>
  style?: React.CSSProperties
}>

export const WindowColumn = forwardRef<HTMLDivElement, WindowColumnProps>(
  (
    {
      children,
      window: win,
      sessionId,
      rootProps,
      isDraggingOver = false,
      isDragging = false,
      style,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          'h-window-column transition-colors duration-150 pb-3 md:pb-0',
          windowColumnWidths,
          getContainerBackground({
            isDraggingOver,
            isDragging,
            incognito: win.incognito,
          }),
          isDragging && 'rounded shadow-lg'
        )}
        {...rootProps}
      >
        <WindowHeader
          sessionId={sessionId}
          window={win}
          className={cn(
            'md:h-window-header overflow-hidden',
            getHeaderBackground({
              isDraggingOver,
              isDragging,
              incognito: win.incognito,
            })
          )}
        />
        {children ||
          win.tabs.map((tab) => (
            <Tab
              key={tab.id}
              tab={tab}
              className="mb-2"
              sessionId={sessionId}
              windowId={win.id}
            />
          ))}
      </div>
    )
  }
)
