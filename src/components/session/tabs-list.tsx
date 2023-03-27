import {
  Droppable,
  Draggable,
  DroppableProvided,
  DroppableStateSnapshot,
  DraggableProvided,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd'
import cn, { Argument as ClassNames } from 'classnames'
import React, { memo } from 'react'

import { Tab } from 'components/tab'
import { Session } from 'utils/session'
import { SessionWindow } from 'utils/session-window'

import {
  ActiveDragKind,
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
}

const InnerTabList: React.FC<InnerTabListProps> = ({
  tabs,
  sessionId,
  windowId,
  // isWindowDragging,
  isWindowFocused,
}) => (
  <>
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
                isWindowFocused={isWindowFocused}
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
              />
              {dropProvided.placeholder}
            </div>
          </div>
        </div>
      )}
    </Droppable>
  )
}
