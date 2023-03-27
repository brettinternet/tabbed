import { Droppable } from '@hello-pangea/dnd'

import { Session } from 'utils/session'
import { useMedia } from 'utils/window'

import {
  ActiveDragKind,
  ApiControllerRef,
  DroppableType,
  useActiveDragKind,
} from './dnd-store'
import { EmptyWindow } from './empty-window'
import { WindowContainer } from './window-container'

type SessionContainerProps = {
  session: Session
  apiControllerRef: ApiControllerRef
}

/**
 * Modeled after https://github.com/hello-pangea/dnd/blob/00d2fd24ef9db1c62274d89da213b711efbacdde/stories/src/board/board.tsx
 */
export const SessionContainer: React.FC<SessionContainerProps> = ({
  session,
  apiControllerRef,
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
          {session.windows.map((win, index) => (
            <WindowContainer
              key={`${session.id}-${win.id}`}
              index={index}
              sessionId={session.id}
              window={win}
              apiControllerRef={apiControllerRef}
            />
          ))}
          {provided.placeholder}
          <EmptyWindow
            isTabDragging={
              activeDragKind === ActiveDragKind.TAB ||
              activeDragKind === ActiveDragKind.INCOGNITO_TAB
            }
          />
        </div>
      )}
    </Droppable>
  )
}
