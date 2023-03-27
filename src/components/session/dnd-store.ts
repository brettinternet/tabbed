import { DropResult, OnBeforeCaptureResponder } from '@hello-pangea/dnd'
import { atom, SetStateAction, useAtom } from 'jotai'
import { useCallback, useState } from 'react'

import { brandUuid, getBrandKind, UuidKind } from 'utils/generate'
import { isDefined, Valueof } from 'utils/helpers'
import { SessionTab } from 'utils/session-tab'
import { SessionWindow } from 'utils/session-window'

import { useDndHandlers } from './handlers'
import { useSessionsManager } from './store'

/**
 * Dragging element type, or undefined when not dragged
 */
export const ActiveDragKind = {
  TAB: 'tab',
  INCOGNITO_TAB: 'incognito-tab',
  WINDOW: 'window',
  INCOGNITO_WINDOW: 'incognito-window',
} as const

export type ActiveDragKindType = Valueof<typeof ActiveDragKind> | undefined

const windowTabSeparator = '|'

export const getWindowTabDraggableId = (
  windowId: SessionWindow['id'],
  tabId: SessionTab['id']
) => `${windowId}${windowTabSeparator}${tabId}`

const parseDraggableIdWindowTab = (draggableId: string) => {
  let [windowIdStr, tabIdStr] = draggableId.split(windowTabSeparator)
  if (windowIdStr.startsWith(UuidKind.WINDOW)) {
    const windowId = brandUuid<'window'>(windowIdStr)
    if (tabIdStr && tabIdStr.startsWith(UuidKind.TAB)) {
      const tabId = brandUuid<'tab'>(tabIdStr)
      return {
        windowId,
        tabId,
      }
    }
    return {
      windowId,
    }
  }
  return {}
}

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

export const activeDragKindAtom = atom<ActiveDragKindType | undefined>(
  undefined
)

export const useActiveDragKind = () => useAtom(activeDragKindAtom)

export const useSessions = () => {
  const [sessionsManager] = useSessionsManager()
  const { moveWindows, moveTabs } = useDndHandlers()
  const [, setActiveDragKind] = useActiveDragKind()

  const onBeforeCapture: OnBeforeCaptureResponder = useCallback(
    ({ draggableId }) => {
      const windows = sessionsManager?.current.windows
      const { windowId, tabId } = parseDraggableIdWindowTab(draggableId)
      if (isDefined(windowId)) {
        const win = windows?.find((w) => w.id === windowId)
        if (win?.incognito) {
          setActiveDragKind(
            isDefined(tabId)
              ? ActiveDragKind.INCOGNITO_TAB
              : ActiveDragKind.INCOGNITO_WINDOW
          )
        } else {
          setActiveDragKind(
            isDefined(tabId) ? ActiveDragKind.TAB : ActiveDragKind.WINDOW
          )
        }
      }
    },
    [sessionsManager]
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
    sessionsManager,
  }
}
