import { Droppable } from '@hello-pangea/dnd'

import { Session } from 'utils/session'
import { useMedia } from 'utils/window'

import {
  ActiveDragKind,
  DroppableType,
  getSessionWindowDraggableId,
  useActiveDragKind,
} from './dnd-store'
import { EmptyWindow } from './empty-window'
import { WindowContainer } from './window-container'

type SessionContainerProps = {
  session: Session
}

/**
 * Modeled after https://github.com/hello-pangea/dnd/blob/00d2fd24ef9db1c62274d89da213b711efbacdde/stories/src/board/board.tsx
 */
export const SessionContainer: React.FC<SessionContainerProps> = ({
  session,
}) => {
  const [activeDragKind] = useActiveDragKind()
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
          // inline flex extends x-axis past body, modeled after board.tsx link above
          className="md:inline-flex"
        >
          {session.windows.map((win, index) => {
            const id = getSessionWindowDraggableId(session.id, win.id)
            return (
              <WindowContainer
                key={id}
                draggableId={id}
                sessionId={session.id}
                window={win}
                index={index}
                isLast={index === session.windows.length - 1}
              />
            )
          })}
          {provided.placeholder}
          <EmptyWindow
            isTabDragging={activeDragKind === ActiveDragKind.TAB}
            className={[direction === 'vertical' && 'mt-4']}
          />
        </div>
      )}
    </Droppable>
  )
}
