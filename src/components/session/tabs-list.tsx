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
}

const InnerTabList: React.FC<InnerTabListProps> = ({
  tabs,
  sessionId,
  windowId,
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
              className="mb-2"
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
          'max-h-full',
          className,
          getWrapperBackground(
            dropSnapshot.isDraggingOver,
            Boolean(dropSnapshot.draggingFromThisWith)
          )
        )}
        {...dropProvided.droppableProps}
      >
        <div ref={dropProvided.innerRef} className="p-2 h-full">
          <MemoizedInnerTabList
            tabs={win.tabs}
            sessionId={sessionId}
            windowId={windowId}
          />
          {dropProvided.placeholder}
        </div>
      </div>
    )}
  </Droppable>
)
