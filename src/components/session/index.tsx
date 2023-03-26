import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  PointerSensor,
  useSensors,
  useSensor,
  MeasuringStrategy,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  SortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import cn from 'classnames'
import { createPortal } from 'react-dom'

import { isPopup } from 'components/app/store'
import { useSettings } from 'components/settings/store'
import { Tab } from 'components/tab'
import { isDefined } from 'utils/helpers'
import { defaultSettings } from 'utils/settings'
import { useMedia } from 'utils/window'

import { useSessions, dropAnimation } from './dnd-store'
import { coordinateGetter } from './keyboard'
import { SortableWindowColumn } from './sortable-window-column'
import { WindowColumn } from './window-column'

// Scrolling is handled within certain divs
// Without this, there's a minor UI bug where scroll bar appears with spacing on the right
if (isPopup) {
  document.body.classList.add('overflow-hidden')
}

/**
 * @docs DND callbacks
 * https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/responders.md
 */
export const SessionLayout = () => {
  const [settings] = useSettings()
  const {
    activeDraggable,
    sessionsManager,
    collisionDetectionStrategy,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
  } = useSessions()
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  )
  const windowSortStrategy = useMedia<SortingStrategy>([
    verticalListSortingStrategy,
    verticalListSortingStrategy,
    verticalListSortingStrategy,
    verticalListSortingStrategy,
    horizontalListSortingStrategy,
  ])

  if (sessionsManager) {
    const session = sessionsManager.current
    const { windowIndex, tabIndex } = activeDraggable
    return (
      <div
        style={{
          maxHeight: isPopup
            ? (settings || defaultSettings).popupDimensions.height - 50
            : undefined,
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetectionStrategy}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always,
            },
          }}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        >
          <div
            className={cn(
              'scroll overflow-y-auto overflow-x-hidden md:overflow-y-hidden md:overflow-x-auto',
              'md:flex md:flex-row md:align-center'
            )}
          >
            <SortableContext
              items={session.windows}
              strategy={windowSortStrategy}
            >
              {session.windows.map((win) => (
                <SortableWindowColumn
                  key={win.id}
                  window={win}
                  sessionId={session.id}
                />
              ))}
            </SortableContext>
          </div>
          {createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
              {isDefined(windowIndex) &&
                (isDefined(tabIndex) ? (
                  <Tab
                    tab={session.windows[windowIndex].tabs[tabIndex]}
                    sessionId={session.id}
                    windowId={session.windows[windowIndex].id}
                    isDragging
                  />
                ) : (
                  <WindowColumn
                    window={session.windows[windowIndex]}
                    sessionId={session.id}
                    isDragging
                  />
                ))}
            </DragOverlay>,
            document.body
          )}
          {/* {activeId && (
            <EmptyWindow id={TRASH_ID} />
          )} */}
        </DndContext>
      </div>
    )
  }

  return null
}
