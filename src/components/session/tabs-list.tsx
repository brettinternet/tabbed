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
import { SessionData, SessionWindowData } from 'utils/sessions'

import { DroppableType } from './store'

type InnerTabListProps = {
  windowId: SessionWindowData['id']
  sessionId: SessionData['id']
  tabs: SessionWindowData['tabs']
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
      const id = `${windowId}-${tab.id}`
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
  window: SessionWindowData
  windowId: SessionWindowData['id']
  sessionId: SessionData['id']
  className?: ClassNames
  isDragging: boolean
}

/**
 * Colors when tab card is dragging
 */
const getWrapperBackground = (
  isDraggingOver: boolean,
  isDraggingFrom: boolean
) => {
  if (isDraggingOver) {
    return 'bg-blue-200'
  }
  if (isDraggingFrom) {
    return 'bg-gray-200'
  }

  return
}

export const TabsList: React.FC<TabsListProps> = ({
  sessionId,
  windowId,
  window: win,
  className,
  isDragging,
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
        className={cn(
          className,
          getWrapperBackground(
            dropSnapshot.isDraggingOver,
            Boolean(dropSnapshot.draggingFromThisWith)
          )
        )}
        {...dropProvided.droppableProps}
      >
        <div ref={dropProvided.innerRef} className="p-2 relative min-h-full">
          <MemoizedInnerTabList
            tabs={win.tabs}
            sessionId={sessionId}
            windowId={windowId}
            isWindowDragging={isDragging}
          />
          {dropProvided.placeholder}
        </div>
      </div>
    )}
  </Droppable>
)
