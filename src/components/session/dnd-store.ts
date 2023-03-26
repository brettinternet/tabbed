import { DropResult, OnBeforeCaptureResponder } from '@hello-pangea/dnd'
import { useCallback, useState } from 'react'

import { brandUuid, getBrandKind, UuidKind } from 'utils/generate'
import { Valueof } from 'utils/helpers'

import { useDndHandlers } from './handlers'
import { useSessionsManager } from './store'

/**
 * Dragging element type, or undefined when not dragged
 */
export const ActiveDragKind = {
  TAB: 'tab',
  WINDOW: 'window',
} as const

export type ActiveDragKindType = Valueof<typeof ActiveDragKind> | undefined

/**
 * For tabs, this is the window ID, otherwise for special areas these are defined
 */
export const DroppableId = {
  NEW_WINDOW: 'new-window',
  NEW_INCOGNITO_WINDOW: 'new-incognito-window',
} as const

/**
 * Defines type on the dnd droppable component
 * where dragged elements may be dropped
 */
export const DroppableType = {
  // Tabs are dropped over window droppable
  WINDOW: 'window',
  // Windows are dropped over this
  SESSION: 'session',
} as const

export const useSessions = () => {
  const [sessionsManager] = useSessionsManager()
  const { moveWindows, moveTabs } = useDndHandlers()
  const [activeDragKind, setActiveDragKind] =
    useState<ActiveDragKindType>(undefined)

  const onBeforeCapture: OnBeforeCaptureResponder = useCallback(
    ({ draggableId }) => {
      setActiveDragKind(
        draggableId.includes('tab') ? ActiveDragKind.TAB : ActiveDragKind.WINDOW
      )
    },
    []
  )

  /**
   * @note This must be synchronous and update optimistically
   * https://github.com/atlassian/react-beautiful-dnd/issues/873#issuecomment-435711992
   */
  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (sessionsManager) {
        const { source, destination } = result

        // Dropped somewhere and moved
        if (
          destination &&
          !(
            source.droppableId === destination.droppableId &&
            source.index === destination.index
          )
        ) {
          // reordering window
          if (result.type === DroppableType.SESSION) {
            const sessionId = sessionsManager.current.id
            const win = sessionsManager.current.windows[source.index]
            moveWindows({
              from: {
                sessionId,
                windowIds: [win.id],
              },
              to: {
                sessionId,
                index: destination.index,
              },
            })
          } else {
            // reordering tab
            // For now, TODO: support all session types
            const sessionId = sessionsManager.current.id
            const fromWindowId =
              getBrandKind(source.droppableId) === UuidKind.WINDOW
                ? brandUuid<'window'>(source.droppableId)
                : undefined
            const toWindowId =
              !Object.keys(DroppableId).includes(destination.droppableId) &&
              getBrandKind(destination.droppableId) === UuidKind.WINDOW
                ? brandUuid<'window'>(destination.droppableId)
                : undefined

            if (fromWindowId) {
              moveTabs({
                from: {
                  sessionId,
                  windowId: fromWindowId,
                  index: source.index,
                },
                to: {
                  sessionId,
                  windowId: toWindowId,
                  index: destination.index,
                  incognito:
                    destination.droppableId ===
                    DroppableId.NEW_INCOGNITO_WINDOW,
                },
              })
            }
          }
        }

        setActiveDragKind(undefined)
      }
    },
    [sessionsManager, moveWindows, moveTabs]
  )

  return {
    onBeforeCapture,
    onDragEnd,
    activeDragKind,
    sessionsManager,
  }
}
