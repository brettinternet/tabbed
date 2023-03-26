import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Tab, TabProps } from 'components/tab'

import { SortableKind } from './dnd-store'

export const SortableTab: React.FC<TabProps> = ({
  tab,
  className,
  sessionId,
  windowId,
  style,
}) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    isDragging,
    transform,
    transition,
  } = useSortable({
    id: tab.id,
    data: {
      type: SortableKind.TAB,
      windowId,
    },
  })

  return (
    <Tab
      ref={setNodeRef}
      className={className}
      tab={tab}
      sessionId={sessionId}
      windowId={windowId}
      isDragging={isDragging}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      rootProps={{
        ...listeners,
        ...attributes,
      }}
    />
  )
}
