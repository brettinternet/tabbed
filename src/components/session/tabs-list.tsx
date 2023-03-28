import {
  Droppable,
  Draggable,
  DroppableProvided,
  DroppableStateSnapshot,
  DraggableProvided,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd'
import cn, { Argument as ClassNames } from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import React, { memo } from 'react'

import { Tab } from 'components/tab'
import { Session } from 'utils/session'
import { SessionWindow } from 'utils/session-window'

import {
  ActiveDragKind,
  ApiControllerRef,
  DroppableType,
  getWindowTabDraggableId,
  useActiveDragKind,
} from './dnd-store'

type InnerTabListProps = {
  windowId: SessionWindow['id']
  sessionId: Session['id']
  tabs: SessionWindow['tabs']
  isWindowDragging: boolean
  isWindowFocused: boolean
  apiControllerRef: ApiControllerRef
  isDraggingTab: boolean
}

/**
 * Prevent presence exit animation while dragging
 * Note, doing so with `isDragging` in motion.div child below doesn't work
 */
const Wrapper: React.FC<React.PropsWithChildren<{ animate: boolean }>> = ({
  animate,
  children,
}) =>
  animate ? (
    <AnimatePresence initial={false}>{children}</AnimatePresence>
  ) : (
    <div>{children}</div>
  )

const InnerTabList: React.FC<InnerTabListProps> = ({
  tabs,
  sessionId,
  windowId,
  isWindowFocused,
  apiControllerRef,
  isDraggingTab,
}) => (
  <Wrapper animate={!isDraggingTab}>
    {tabs.map((tab, index) => {
      const id = getWindowTabDraggableId(windowId, tab.id)
      return (
        <Draggable key={id} draggableId={id} index={index}>
          {(
            dragProvided: DraggableProvided,
            dragSnapshot: DraggableStateSnapshot
          ) => (
            <div
              ref={dragProvided.innerRef}
              {...dragProvided.draggableProps}
              {...dragProvided.dragHandleProps}
              className="mb-2"
            >
              <motion.div
                layout={
                  !dragSnapshot.isDragging && !dragSnapshot.isDropAnimating
                }
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
                <Tab
                  tab={tab}
                  sessionId={sessionId}
                  windowId={windowId}
                  isDragging={dragSnapshot.isDragging}
                  isWindowFocused={isWindowFocused}
                  apiControllerRef={apiControllerRef}
                  index={index}
                  isLastTab={index === tabs.length - 1}
                />
              </motion.div>
            </div>
          )}
        </Draggable>
      )
    })}
  </Wrapper>
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
  apiControllerRef: ApiControllerRef
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
  apiControllerRef,
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
            'flex flex-col md:w-80 lg:w-96',
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
                apiControllerRef={apiControllerRef}
                isDraggingTab={
                  activeDragKind === ActiveDragKind.TAB ||
                  activeDragKind === ActiveDragKind.INCOGNITO_TAB
                }
              />
              {dropProvided.placeholder}
            </div>
          </div>
        </div>
      )}
    </Droppable>
  )
}
