import cn from 'classnames'
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
} from 'react-beautiful-dnd'

import { Button } from 'components/button'
import { Dropdown } from 'components/dropdown'
import { Session } from 'utils/browser/session'
import { SessionWindow } from 'utils/browser/session-window'

import { TabsList } from './tabs-list'

type SessionWindowProps = {
  sessionId: Session['id']
  index: number
  window: SessionWindow
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

const getHeaderBackground = ({
  isDragging,
  focused,
}: {
  isDragging: boolean
  focused: boolean
}) => {
  if (isDragging) {
    return 'bg-blue-200'
  }

  if (focused) {
    return 'bg-green-100'
  }

  return 'hover:bg-blue-100'
}

export const WindowContainer: React.FC<SessionWindowProps> = ({
  sessionId,
  index,
  window: win,
}) => {
  const { incognito, focused, title, state } = win
  return (
    <Draggable draggableId={`${sessionId}-${win.id}`} index={index}>
      {(
        dragProvided: DraggableProvided,
        dragSnapshot: DraggableStateSnapshot
      ) => (
        <div
          className={cn(
            'transition duration-150',
            getContainerBackground({
              isDragging: dragSnapshot.isDragging,
              incognito,
            })
          )}
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          {...dragProvided.dragHandleProps}
        >
          <div
            className={cn(
              'flex justify-between items-center py-3 px-6 transition-colors duration-75',
              getHeaderBackground({
                isDragging: dragSnapshot.isDragging,
                focused,
              })
            )}
          >
            <div className="space-y-2">
              {title && <div>{title}</div>}
              <div className="text-gray-500 text-xs">{state}</div>
            </div>
            <div>
              <Dropdown
                actionGroups={[
                  [
                    {
                      onClick: () => {
                        win.open()
                      },
                      text: win.activeSession ? 'Focus' : 'Open',
                      iconProps: { name: 'file-plus' },
                      disabled: win.focused,
                    },
                  ],
                  [
                    {
                      onClick: () => {
                        win.remove()
                      },
                      text: win.activeSession ? 'Close' : 'Delete',
                      iconProps: { name: 'bin' },
                    },
                  ],
                ]}
              />
            </div>
          </div>

          <TabsList sessionId={sessionId} windowId={win.id} window={win} />
        </div>
      )}
    </Draggable>
  )
}
