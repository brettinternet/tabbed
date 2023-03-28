import { Droppable } from '@hello-pangea/dnd'
import { AnimatePresence, motion } from 'framer-motion'

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
          <AnimatePresence>
            {session.windows.map((win, index) => (
              <motion.div
                key={`${session.id}-${win.id}`}
                initial={false}
                animate={{
                  width: 'auto',
                  opacity: 1,
                  transition: {
                    type: 'tween',
                    duration: 0.15,
                    ease: 'circOut',
                  },
                }}
                exit={{ width: 0, opacity: 0 }}
              >
                <WindowContainer
                  index={index}
                  sessionId={session.id}
                  window={win}
                  apiControllerRef={apiControllerRef}
                />
              </motion.div>
            ))}
          </AnimatePresence>
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
