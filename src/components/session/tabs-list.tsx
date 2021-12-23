import cn, { Argument as ClassNames } from 'classnames'
import React, { memo } from 'react'
import {
  Droppable,
  Draggable,
  DroppableProvided,
  DroppableStateSnapshot,
  DraggableProvided,
  DraggableStateSnapshot,
} from 'react-beautiful-dnd'

import { Tab } from 'components/tab'
import { Session } from 'utils/session'
import { SessionWindow } from 'utils/session-window'

import { DroppableType } from './dnd-store'

type InnerTabListProps = {
  windowId: SessionWindow['id']
  sessionId: Session['id']
  tabs: SessionWindow['tabs']
  isWindowDragging: boolean
}

const InnerTabList: React.FC<InnerTabListProps> = ({
  tabs,
  sessionId,
  windowId,
  // isWindowDragging,
}) => (
  <>
    {tabs.map((tab, index) => {
      const id = `tab-${windowId}-${tab.id}`
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
              className={cn(
                'mb-2'
                // index != 0 &&
                //   isWindowDragging &&
                //   `absolute transition-all duration-200 top-[${index * 2}px]`
              )}
            >
              <Tab
                key={id}
                tab={tab}
                sessionId={sessionId}
                windowId={windowId}
                isDragging={dragSnapshot.isDragging}
              />
            </div>
          )}
        </Draggable>
      )
    })}
  </>
)

const MemoizedInnerTabList = memo(InnerTabList)

type TabsListProps = {
  window: SessionWindow
  windowId: SessionWindow['id']
  sessionId: Session['id']
  className?: ClassNames
  isWindowDragging: boolean
}

/**
 * Colors when tab card is dragging
 */
const getWrapperBackground = (
  isDraggingOver: boolean,
  isDraggingFrom: boolean
) => {
  if (isDraggingOver) {
    return 'bg-blue-200 dark:bg-green-900'
  }
  if (isDraggingFrom) {
    return 'bg-gray-200 dark:bg-gray-800'
  }
}

export const TabsList: React.FC<TabsListProps> = ({
  sessionId,
  windowId,
  window: win,
  className,
  isWindowDragging,
}) => (
  <Droppable
    droppableId={`${windowId}`}
    type={DroppableType.WINDOW}
    ignoreContainerClipping={false}
    isDropDisabled={false}
  >
    {(
      dropProvided: DroppableProvided,
      dropSnapshot: DroppableStateSnapshot
    ) => (
      <div
        ref={dropProvided.innerRef}
        className={cn(
          'relative p-2',
          className,
          getWrapperBackground(
            dropSnapshot.isDraggingOver,
            Boolean(dropSnapshot.draggingFromThisWith)
          )
        )}
        {...dropProvided.droppableProps}
      >
        <MemoizedInnerTabList
          tabs={win.tabs}
          sessionId={sessionId}
          windowId={windowId}
          isWindowDragging={isWindowDragging}
        />
        {dropProvided.placeholder}
      </div>
    )}
  </Droppable>
)
