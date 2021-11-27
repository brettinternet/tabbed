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

import { Session } from 'utils/browser/session'
import { SessionWindow } from 'utils/browser/session-window'

import { Tab, TabProps } from './tab'

type InnerTabListProps = {
  windowId: SessionWindow['id']
  sessionId: Session['id']
  tabs: SessionWindow['tabs']
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
            <Tab
              key={id}
              tab={tab}
              sessionId={sessionId}
              windowId={windowId}
              isDragging={dragSnapshot.isDragging}
              provided={dragProvided}
            />
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
    type="WINDOW"
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
        <div ref={dropProvided.innerRef} className="p-2">
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
