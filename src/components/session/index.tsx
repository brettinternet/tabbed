import { useEffect } from 'react'
import {
  DragDropContext,
  Droppable,
  DroppableProvided,
} from 'react-beautiful-dnd'

import { useSettings, isPopup } from 'components/app/store'

import { startListeners } from './api'
import { useWindowsDrag } from './store'
import { WindowContainer } from './window-container'

// Scrolling is handled within certain divs
// Without this, there's a minor UI bug where scroll bar appears with spacing on the right
if (isPopup) {
  document.body.classList.add('overflow-hidden')
}

export const SessionLayout = () => {
  const [settings] = useSettings()
  const { onDragEnd, sessionsManager, setSessionsManager } = useWindowsDrag()

  useEffect(() => {
    startListeners(setSessionsManager)
  }, [setSessionsManager])

  if (sessionsManager) {
    const session = sessionsManager.current
    return (
      <div
        style={{
          maxHeight: isPopup ? settings.popupDimensions.height - 50 : undefined,
        }}
        className="scroll overflow-y-auto overflow-x-hidden"
      >
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="session" type="SESSION" direction="vertical">
            {(provided: DroppableProvided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {session.windows.map((win, index) => (
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
