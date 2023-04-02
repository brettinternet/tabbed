import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd'
import classNames from 'classnames'
import cn from 'classnames'
import { motion } from 'framer-motion'

import { WindowHeader } from 'components/window'
import { Session } from 'utils/session'
import { SessionWindow } from 'utils/session-window'

import { handleFocusDraggable } from './dnd-handlers'
// import { handleFocusDraggable } from './dnd-handlers'
import { FocusDraggable } from './focus'
import { TabsList } from './tabs-list'

type ColorOptions = {
  isDragging: boolean
  incognito: boolean
}

const getContainerBackground = ({ isDragging, incognito }: ColorOptions) => {
  if (isDragging) {
    return 'bg-blue-100 dark:bg-blue-900'
  }

  if (incognito) {
    return 'bg-indigo-100 dark:bg-gray-800'
  }
}

const getHeaderBackground = ({ isDragging, incognito }: ColorOptions) => {
  if (isDragging) {
    return 'bg-blue-200 dark:bg-blue-900'
  }

  if (incognito) {
    return 'bg-indigo-100 dark:bg-purple-900'
  }
}

type SessionWindowProps = {
  sessionId: Session['id']
  window: SessionWindow
  index: number
  isLast: boolean
}

/**
 * TODO: Scroll snap support? https://github.com/atlassian/react-beautiful-dnd/issues/2298
 */
export const WindowContainer: React.FC<SessionWindowProps> = ({
  sessionId,
  window: win,
  index,
  isLast,
}) => (
  <Draggable draggableId={`${sessionId}-${win.id}`} index={index}>
    {(
      dragProvided: DraggableProvided,
      { isDragging, isDropAnimating }: DraggableStateSnapshot
    ) => (
      <FocusDraggable
        isDragging={isDragging}
        className={cn(
          'flex flex-col transition-colors duration-150',
          getContainerBackground({
            isDragging: isDragging,
            incognito: win.incognito,
          }),
          isDragging && 'rounded shadow-lg'
        )}
        ref={dragProvided.innerRef}
        {...dragProvided.draggableProps}
        {...dragProvided.dragHandleProps}
        onClick={handleFocusDraggable}
        kind="window"
      >
        <motion.div
          layout={!(isDragging || isDropAnimating)}
          transition={{
            type: 'spring',
            duration: 0.3,
          }}
          initial={{ width: 0, opacity: 0 }}
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
          <WindowHeader
            sessionId={sessionId}
            window={win}
            index={index}
            isLast={isLast}
            className={classNames(
              'md:h-window-header cursor-grab',
              'transition-colors duration-150',
              getHeaderBackground({ isDragging, incognito: win.incognito })
            )}
          />
          <TabsList
            sessionId={sessionId}
            windowId={win.id}
            window={win}
            isWindowDragging={isDragging}
            className="cursor-default"
          />
        </motion.div>
      </FocusDraggable>
    )}
  </Draggable>
)
