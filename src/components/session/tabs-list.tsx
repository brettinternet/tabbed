import {
  Droppable,
  Draggable,
  DroppableProvided,
  DroppableStateSnapshot,
  DraggableProvided,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd'
import { FocusScope } from '@react-aria/focus'
import cn, { Argument as ClassNames } from 'classnames'
import { motion } from 'framer-motion'
import { memo } from 'react'

import { Tab, getTabBackgroundColor } from 'components/tab'
import { Session } from 'utils/session'
import { SessionWindow } from 'utils/session-window'

import {
  ActiveDragKind,
  DroppableType,
  getWindowTabDraggableId,
  useActiveDragKind,
} from './dnd-store'
import { FocusDraggable } from './focus-draggable'

type InnerTabListProps = {
  windowId: SessionWindow['id']
  sessionId: Session['id']
  tabs: SessionWindow['tabs']
  isWindowDragging: boolean
  isWindowFocused: boolean
}

const InnerTabList: React.FC<InnerTabListProps> = ({
  tabs,
  sessionId,
  windowId,
  isWindowFocused,
}) => (
  <>
    {tabs.map((tab, index) => {
      const id = getWindowTabDraggableId(windowId, tab.id)
      return (
        <Draggable key={id} draggableId={id} index={index}>
          {(
            dragProvided: DraggableProvided,
            { isDragging, isDropAnimating }: DraggableStateSnapshot
          ) => (
            <FocusDraggable
              ref={dragProvided.innerRef}
              {...dragProvided.draggableProps}
              {...dragProvided.dragHandleProps}
              className={[
                'mb-2 rounded cursor-grab',
                getTabBackgroundColor(tab.active),
              ]}
              kind="tab"
              sessionId={sessionId}
              windowId={windowId}
              tabId={tab.id}
            >
              <motion.div
                layout={!(isDragging || isDropAnimating)}
                transition={{
                  type: 'spring',
                  duration: Math.max(0.1 * (Math.min(index, 20) / 2), 0.3),
                }}
                initial={false}
                animate={{
                  height: 'auto',
                  opacity: 1,
                  transition: {
                    type: 'tween',
                    duration: 0.15,
                    ease: 'circOut',
                  },
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                }}
              >
                <FocusScope>
                  <Tab
                    tab={tab}
                    sessionId={sessionId}
                    windowId={windowId}
                    isDragging={isDragging}
                    isWindowFocused={isWindowFocused}
                    index={index}
                    isLastTab={index === tabs.length - 1}
                  />
                </FocusScope>
              </motion.div>
            </FocusDraggable>
          )}
        </Draggable>
      )
    })}
  </>
)

const MemoizedInnerTabList = memo(InnerTabList)

/**
 * Colors when tab card is dragging
 */
const getWrapperBackground = (
  isDraggingOver: boolean,
  isDraggingFrom: boolean,
  incognito: boolean
) => {
  if (isDraggingOver) {
    return incognito
      ? 'bg-indigo-100 dark:bg-gray-700'
      : 'bg-blue-100 dark:bg-gray-700'
  }

  if (isDraggingFrom && !incognito) {
    return 'bg-gray-50 dark:bg-gray-900'
  }
}

type TabsListProps = {
  window: SessionWindow
  windowId: SessionWindow['id']
  sessionId: Session['id']
  className?: ClassNames
  isWindowDragging: boolean
}

/**
 * Modeled after https://github.com/hello-pangea/dnd/blob/00d2fd24ef9db1c62274d89da213b711efbacdde/stories/src/primatives/quote-list.tsx
 */
export const TabsList: React.FC<TabsListProps> = ({
  sessionId,
  windowId,
  window: win,
  className,
  isWindowDragging,
}) => {
  const [activeDragKind] = useActiveDragKind()
  const isDropDisabled =
    (activeDragKind === ActiveDragKind.INCOGNITO_TAB && !win.incognito) ||
    (activeDragKind === ActiveDragKind.TAB && win.incognito)
  return (
    <Droppable
      droppableId={`${windowId}`}
      type={DroppableType.WINDOW}
      direction="vertical"
      isDropDisabled={isDropDisabled}
    >
      {(
        dropProvided: DroppableProvided,
        dropSnapshot: DroppableStateSnapshot
      ) => (
        <div
          className={cn(
            'flex flex-col md:w-80 lg:w-96 transition-colors duration-150',
            className,
            getWrapperBackground(
              dropSnapshot.isDraggingOver,
              Boolean(dropSnapshot.draggingFromThisWith),
              win.incognito
            )
          )}
          {...dropProvided.droppableProps}
        >
          <div className="md:max-h-tab-list md:scroll overflow-y-auto overflow-x-hidden">
            <div ref={dropProvided.innerRef} className="p-2 md:min-h-tab-list">
              <MemoizedInnerTabList
                tabs={win.tabs}
                sessionId={sessionId}
                windowId={windowId}
                isWindowDragging={isWindowDragging}
                isWindowFocused={win.focused}
              />
              {dropProvided.placeholder}
            </div>
          </div>
        </div>
      )}
    </Droppable>
  )
}
