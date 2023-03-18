import { Droppable } from '@hello-pangea/dnd'

import { Session } from 'utils/session'
import { useMedia } from 'utils/window'

import { ActiveDragKind, ActiveDragKindType, DroppableType } from './dnd-store'
import { EmptyWindow } from './empty-window'
import { WindowContainer } from './window-container'

type SessionContainerProps = {
  session: Session
  activeDragKind: ActiveDragKindType
}

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
          className="relative scroll overflow-auto md:flex md:flex-row md:align-center"
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
