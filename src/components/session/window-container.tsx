import cn from 'classnames'
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
} from 'react-beautiful-dnd'

import { WindowHeader } from 'components/window'
import { SessionData, SessionWindowData } from 'utils/sessions'

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
    return 'bg-blue-200'
  }

  if (incognito) {
    return 'bg-indigo-100'
  }

  return 'bg-gray-100'
}

export const WindowContainer: React.FC<SessionWindowProps> = ({
  sessionId,
  index,
  window: win,
}) => (
  <Draggable draggableId={`${sessionId}-${win.id}`} index={index}>
    {(
      dragProvided: DraggableProvided,
      dragSnapshot: DraggableStateSnapshot
    ) => (
      <div
        className={cn(
          'transition-colors duration-150 pb-3',
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
        <WindowHeader sessionId={sessionId} window={win} />
        <TabsList sessionId={sessionId} windowId={win.id} window={win} />
      </div>
    )}
  </Draggable>
)
