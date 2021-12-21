import cn from 'classnames'
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
} from 'react-beautiful-dnd'

import { WindowHeader } from 'components/window'
import { SessionData, SessionWindowData } from 'utils/sessions/types'

import { TabsList } from './tabs-list'

type SessionWindowProps = {
  sessionId: SessionData['id']
  index: number
  window: SessionWindowData
}

const getContainerBackground = ({
  isDragging,
  incognito,
}: {
  isDragging: boolean
  incognito: boolean
}) => {
  if (isDragging) {
    return 'bg-blue-200 dark:bg-blue-900'
  }

  if (incognito) {
    return 'bg-indigo-100 dark:bg-indigo-900'
  }

  return 'bg-gray-100 dark:bg-gray-900'
}

export const WindowContainer: React.FC<SessionWindowProps> = ({
  sessionId,
  index,
  window: win,
}) => (
  <Draggable draggableId={`window-${sessionId}-${win.id}`} index={index}>
    {(
      dragProvided: DraggableProvided,
      dragSnapshot: DraggableStateSnapshot
    ) => (
      <div
        style={{ height: dragSnapshot.isDragging ? '40px' : undefined }}
        className={cn(
          // TODO: change based on scroll direction
          // !dragSnapshot.isDragging && (index === 0 ? 'snap-start' : 'snap-end'),
          'transition-colors duration-150 pb-3 md:pb-0 md:w-80 lg:w-96 md:min-w-[20rem] lg:min-w-[24rem]',
          getContainerBackground({
            isDragging: dragSnapshot.isDragging,
            incognito: win.incognito,
          }),
          dragSnapshot.isDragging && 'rounded shadow-lg'
        )}
        ref={dragProvided.innerRef}
        {...dragProvided.draggableProps}
        {...dragProvided.dragHandleProps}
      >
        <WindowHeader
          sessionId={sessionId}
          window={win}
          className="md:h-window-header overflow-hidden"
        />
        <TabsList
          sessionId={sessionId}
          windowId={win.id}
          window={win}
          className="md:h-tab-list md:overflow-y-scroll md:scroll md:overflow-x-hidden"
          isWindowDragging={dragSnapshot.isDragging}
        />
      </div>
    )}
  </Draggable>
)
