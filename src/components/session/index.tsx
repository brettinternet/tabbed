import cn from 'classnames'
import { useEffect } from 'react'
import {
  DragDropContext,
  Droppable,
  DroppableProvided,
} from 'react-beautiful-dnd'

import { useSettings, isPopup } from 'components/app/store'
import { useMedia } from 'utils/window'

import { startListeners } from './api'
import { DroppableType, useWindowsDrag } from './store'
import { WindowContainer } from './window-container'

// Scrolling is handled within certain divs
// Without this, there's a minor UI bug where scroll bar appears with spacing on the right
if (isPopup) {
  document.body.classList.add('overflow-hidden')
}

export const SessionLayout = () => {
  const [settings] = useSettings()
  const { onDragEnd, sessionsManager, setSessionsManager } = useWindowsDrag()
  const direction = useMedia<'vertical' | 'horizontal'>([
    'vertical',
    'vertical',
    'vertical',
    'vertical',
    'horizontal',
  ])

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
        className={cn('scroll overflow-auto')}
      >
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable
            droppableId="session"
            type={DroppableType.SESSION}
            direction={direction}
          >
            {(provided: DroppableProvided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="md:flex md:flex-row md:align-center"
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
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    )
  }

  return null
}
