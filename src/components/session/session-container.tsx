import { Droppable } from '@hello-pangea/dnd'
import cn from 'classnames'

import { Session } from 'utils/session'
import { useMedia } from 'utils/window'

import { ActiveDragKind, ActiveDragKindType, DroppableType } from './dnd-store'
import { EmptyWindow } from './empty-window'
import { WindowContainer } from './window-container'

type SessionContainerProps = {
  session: Session
  activeDragKind: ActiveDragKindType
}

/**
 * Modeled after https://github.com/hello-pangea/dnd/blob/00d2fd24ef9db1c62274d89da213b711efbacdde/stories/src/board/board.tsx
 */
export const SessionContainer: React.FC<SessionContainerProps> = ({
  session,
  activeDragKind,
}) => {
  const direction = useMedia<'vertical' | 'horizontal'>([
    'vertical',
    'vertical',
    'vertical',
    'vertical',
    'horizontal',
  ])
  return (
    <Droppable
      droppableId={`${session.id}`}
      type={DroppableType.SESSION}
      direction={direction}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={cn(
            'flex',
            direction === 'vertical' ? 'flex-col' : 'flex-row'
          )}
        >
          {session.windows.map((win, index) => (
            <WindowContainer
              key={`${session.id}-${win.id}`}
              index={index}
              sessionId={session.id}
              window={win}
            />
          ))}
          {provided.placeholder}
          <EmptyWindow isTabDragging={activeDragKind === ActiveDragKind.TAB} />
        </div>
      )}
    </Droppable>
  )
}
