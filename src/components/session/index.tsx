import {
  DragDropContext,
  Droppable,
  DroppableProvided,
} from 'react-beautiful-dnd'

import { useSettings, isPopup } from 'components/app/store'

import { useWindowsDrag } from './store'
import { WindowContainer } from './window-container'

export const SessionLayout = () => {
  const [settings] = useSettings()
  const { onDragEnd, sessionManager, windows } = useWindowsDrag()

  if (sessionManager) {
    const session = sessionManager.current
    return (
      <div
        style={{
          maxHeight: isPopup ? settings.popupDimensions.height - 50 : undefined,
        }}
        className="overflow-y-auto overflow-x-hidden"
      >
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="session" type="SESSION" direction="vertical">
            {(provided: DroppableProvided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {windows.map((win, index) => (
                  <WindowContainer
                    key={`${session.id}-${win.id}`}
                    index={index}
                    sessionId={session.id}
                    window={win}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    )
  }

  return null
}
