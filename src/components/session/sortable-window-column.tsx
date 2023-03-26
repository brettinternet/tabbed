import {
  useSortable,
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import cn from 'classnames'

import { SortableKind } from './dnd-store'
import { SortableTab } from './sortable-tab'
import { WindowColumn, WindowColumnProps } from './window-column'

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true })

export const SortableWindowColumn: React.FC<WindowColumnProps> = ({
  window: win,
  sessionId,
  style,
}) => {
  const {
    active,
    attributes,
    isDragging,
    listeners,
    over,
    setNodeRef,
    transition,
    transform,
  } = useSortable({
    id: win.id,
    data: {
      type: SortableKind.WINDOW,
      children: win.tabs,
    },
    animateLayoutChanges,
  })
  const isTabOverWindow =
    (over &&
      (over.id === win.id || over.data?.current?.windowId === win.id) &&
      active?.data.current?.type === SortableKind.TAB) ||
    false

  return (
    <WindowColumn
      ref={setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      window={win}
      sessionId={sessionId}
      isDragging={isDragging}
      isDraggingOver={isTabOverWindow}
      rootProps={{
        ...attributes,
        ...listeners,
      }}
    >
      <div className="p-2 md:h-tab-list md:overflow-y-auto md:scroll md:overflow-x-hidden transition">
        <SortableContext
          items={win.tabs}
          strategy={verticalListSortingStrategy}
        >
          {win.tabs.map((tab) => (
            <SortableTab
              key={win.id + tab.id}
              tab={tab}
              className="mb-2"
              sessionId={sessionId}
              windowId={win.id}
            />
          ))}
        </SortableContext>
      </div>
    </WindowColumn>
  )
}
