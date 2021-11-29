import cn from 'classnames'
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
} from 'react-beautiful-dnd'

import { Dropdown } from 'components/dropdown'
import { Icon } from 'components/icon'
import { SessionData, SessionWindowData } from 'utils/sessions'

import { TabsList } from './tabs-list'

const WindowHeader: React.FC<{ window: SessionWindowData }> = ({
  window: { focused, title, state, activeSession },
}) => {
  const handleOpen: React.MouseEventHandler<
    HTMLDivElement | HTMLButtonElement
  > = () => {
    if (!focused) {
      // win.open()
    }
  }
  return (
    <div
      onDoubleClick={handleOpen}
      className="flex justify-between items-center py-3 px-6 transition-colors duration-75 hover:bg-gray-200"
    >
      <div className="space-y-2">
        {title && <div>{title}</div>}
        <div className="flex items-center flex-wrap">
          <div className="text-gray-500 text-xs mr-2">{state}</div>
          {focused && (
            <Icon title="active" name="file-tick" className="mr-2" size="sm" />
          )}
        </div>
      </div>
      <div>
        <Dropdown
          buttonVariant="none"
          actionGroups={[
            [
              {
                onClick: handleOpen,
                text: activeSession ? 'Focus' : 'Open',
                iconProps: { name: 'file-plus' },
                disabled: focused,
              },
            ],
            [
              {
                onClick: () => {
                  // win.remove()
                },
                text: activeSession ? 'Close' : 'Delete',
                iconProps: { name: 'bin' },
              },
            ],
          ]}
        />
      </div>
    </div>
  )
}

type SessionWindowProps = {
  sessionId: SessionData['id']
  index: number
  window: SessionWindowData
}

const getContainerBackground = ({
  isDragging,
  incognito,
}: {
  isDragging: boolean
  incognito: boolean
}) => {
  if (isDragging) {
    return 'bg-blue-200'
  }

  if (incognito) {
    return 'bg-indigo-100'
  }

  return 'bg-gray-100'
}

export const WindowContainer: React.FC<SessionWindowProps> = ({
  sessionId,
  index,
  window: win,
}) => (
  <Draggable draggableId={`${sessionId}-${win.id}`} index={index}>
    {(
      dragProvided: DraggableProvided,
      dragSnapshot: DraggableStateSnapshot
    ) => (
      <div
        className={cn(
          'transition-colors duration-150 pb-3',
          getContainerBackground({
            isDragging: dragSnapshot.isDragging,
            incognito: win.incognito,
          }),
          dragSnapshot.isDragging && 'rounded shadow-lg'
        )}
        ref={dragProvided.innerRef}
        {...dragProvided.draggableProps}
        {...dragProvided.dragHandleProps}
      >
        <WindowHeader window={win} />
        <TabsList sessionId={sessionId} windowId={win.id} window={win} />
      </div>
    )}
  </Draggable>
)
