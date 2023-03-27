import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd'
import classNames from 'classnames'
import cn from 'classnames'

import { WindowHeader } from 'components/window'
import { Session } from 'utils/session'
import { SessionWindow } from 'utils/session-window'

import { TabsList } from './tabs-list'

type ColorOptions = {
  isDragging: boolean
  incognito: boolean
}

const getContainerBackground = ({ isDragging, incognito }: ColorOptions) => {
  if (isDragging) {
    return 'bg-blue-100 dark:bg-blue-900'
  }

  if (incognito) {
    return 'bg-indigo-100 dark:bg-gray-800'
  }

  return 'bg-gray-100 dark:bg-gray-900'
}

const getHeaderBackground = ({ isDragging, incognito }: ColorOptions) => {
  if (isDragging) {
    return 'bg-blue-200 dark:bg-blue-900'
  }

  if (incognito) {
    return 'bg-indigo-100 dark:bg-purple-900'
  }

  return 'bg-gray-100 dark:bg-gray-900'
}

type SessionWindowProps = {
  sessionId: Session['id']
  index: number
  window: SessionWindow
}

export const WindowContainer: React.FC<SessionWindowProps> = ({
  sessionId,
  index,
  window: win,
}) => (
  <Draggable draggableId={`${sessionId}-${win.id}`} index={index}>
    {(
      dragProvided: DraggableProvided,
      { isDragging }: DraggableStateSnapshot
    ) => (
      <div
        style={{ height: isDragging ? '40px' : undefined }}
        className={cn(
          // TODO: change based on scroll direction
          // !isDragging && (index === 0 ? 'snap-start' : 'snap-end'),
          'flex flex-col',
          // 'md:h-window-column md:pb-0 md:w-80 lg:w-96 md:min-w-[20rem] lg:min-w-[24rem]',
          'transition-colors duration-150',
          getContainerBackground({
            isDragging: isDragging,
            incognito: win.incognito,
          }),
          isDragging && 'rounded shadow-lg'
        )}
        ref={dragProvided.innerRef}
        {...dragProvided.draggableProps}
        {...dragProvided.dragHandleProps}
      >
        <WindowHeader
          sessionId={sessionId}
          window={win}
          className={classNames(
            'md:h-window-header overflow-hidden cursor-grab',
            'transition-colors duration-150',
            getHeaderBackground({ isDragging, incognito: win.incognito })
          )}
        />
        <TabsList
          sessionId={sessionId}
          windowId={win.id}
          window={win}
          isWindowDragging={isDragging}
          className="cursor-default"
        />
      </div>
    )}
  </Draggable>
)
