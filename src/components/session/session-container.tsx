import { Droppable } from 'react-beautiful-dnd'

import { SessionData } from 'utils/sessions/types'
import { useMedia } from 'utils/window'

import { EmptyWindow } from './empty-window'
import { ActiveDragKind, ActiveDragKindType, DroppableType } from './store'
import { WindowContainer } from './window-container'

type SessionContainerProps = {
  session: SessionData
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
      droppableId={session.id}
      type={DroppableType.SESSION}
      direction={direction}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="scroll overflow-auto md:flex md:flex-row md:align-center"
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
