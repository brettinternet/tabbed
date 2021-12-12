import { Droppable, DroppableProvided } from 'react-beautiful-dnd'

import { SessionData } from 'utils/sessions'
import { useMedia } from 'utils/window'

import { EmptyActions } from './empty-actions'
import { DroppableType } from './store'
import { WindowContainer } from './window-container'

type SessionContainerProps = {
  session: SessionData
}

export const SessionContainer: React.FC<SessionContainerProps> = ({
  session,
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
      droppableId="session"
      type={DroppableType.SESSION}
      direction={direction}
    >
      {(provided: DroppableProvided) => (
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
          {session.windows.length < 3 && <EmptyActions />}
        </div>
      )}
    </Droppable>
  )
}
