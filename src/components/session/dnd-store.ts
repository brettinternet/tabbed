import {
  UniqueIdentifier,
  DragEndEvent,
  DragCancelEvent,
  DragOverEvent,
  DragStartEvent,
  DropAnimation,
  defaultDropAnimationSideEffects,
  Active,
  Over,
  CollisionDetection,
  closestCenter,
  closestCorners,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  DataRef,
} from '@dnd-kit/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'

import { getUuidContext, UuidContext } from 'utils/generate'
import { isDefined, Valueof } from 'utils/helpers'
import { SessionTab } from 'utils/session-tab'
import { SessionWindow } from 'utils/session-window'
import { SessionsManager } from 'utils/sessions-manager'

import { useDndHandlers } from './handlers'
import { useSessionsManager } from './store'

/**
 * We only use string IDs, not numbers
 */
const isLocalIdentifier = (id: UniqueIdentifier): id is string =>
  typeof id === 'string'

const separator = '|'
// TODO: support multiple sessions

export const getWindowTabId = (
  windowId: SessionWindow['id'],
  tabId: SessionTab['id']
): UniqueIdentifier => [windowId, tabId].join(separator)

export const findWindowTabIds = (
  target: Active | Over | { id: UniqueIdentifier; data: DataRef } | undefined,
  sessionsManager: SessionsManager | undefined
) => {
  // TODO: support all sessions
  const windows = sessionsManager?.current.windows
  const { id, data } = target || {}
  let windowId: SessionWindow['id'] | undefined
  let tabId: SessionTab['id'] | undefined
  if (id && isLocalIdentifier(id)) {
    switch (getUuidContext(id)) {
      case UuidContext.WINDOW:
        windowId = id
        break
      case UuidContext.TAB: {
        tabId = id
        const possibleWindowId = data?.current?.windowId
        if (
          possibleWindowId &&
          typeof possibleWindowId === 'string' &&
          getUuidContext(possibleWindowId) === UuidContext.WINDOW
        ) {
          windowId = possibleWindowId
        }
        break
      }
    }
  }
  const windowIndex = windowId
    ? windows?.findIndex((win) => win.id === windowId)
    : undefined
  if (windowId && isDefined(windowIndex) && windowIndex > -1 && tabId) {
    const tabIndex = windows?.[windowIndex].tabs.findIndex(
      (tab) => tab.id === tabId
    )
    if (isDefined(tabIndex) && tabIndex > -1) {
      return {
        windowId,
        windowIndex,
        tabId,
        tabIndex,
      }
    }
    return {
      windowId,
      windowIndex,
      tabId,
    }
  }
  return {
    windowId,
    windowIndex,
    tabId,
  }
}

export type ActiveDraggable = {
  windowId?: string
  windowIndex?: number
  tabId?: string
  tabIndex?: number
}

export const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
}

/**
 * Dragging element type, or undefined when not dragged
 */
export const SortableKind = {
  TAB: 'tab',
  WINDOW: 'window',
} as const

export type SortableKindType = Valueof<typeof SortableKind> | undefined

const parseSortableKind = (target: Active | Over): SortableKindType => {
  switch (target.data.current?.type) {
    case SortableKind.TAB:
      return SortableKind.TAB
    case SortableKind.WINDOW:
      return SortableKind.WINDOW
    default:
      return undefined
  }
}

/**
 * For tabs, this is the window ID, otherwise for special areas these are defined
 */
export const DroppableId = {
  NEW_WINDOW: 'new-window',
  NEW_INCOGNITO_WINDOW: 'new-incognito-window',
} as const

export const useSessions = () => {
  const [activeDraggable, setActiveDraggable] = useState<ActiveDraggable>({})
  const [sessionsManager, setSessionsManager] = useSessionsManager()
  const [clonedSessionsManager, setClonedSessionsManager] = useState<
    SessionsManager | undefined
  >(undefined)
  const { moveWindows, moveTabs } = useDndHandlers()
  const recentlyMovedToNewContainer = useRef(false)
  const lastOverId = useRef<UniqueIdentifier | null>(null)

  const onDragStart = ({ active }: DragStartEvent) => {
    const activeDraggable = findWindowTabIds(active, sessionsManager)
    setActiveDraggable(activeDraggable)
    setClonedSessionsManager(sessionsManager)
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (sessionsManager) {
      const overId = over?.id
      const windows = sessionsManager.current.windows
      // For now, TODO: support all session types
      const source = findWindowTabIds(active, sessionsManager)

      if (!isDefined(source.windowIndex)) {
        setActiveDraggable({})
        return
      }

      if (!overId) {
        setActiveDraggable({})
        return
      }

      const destination = findWindowTabIds(over, sessionsManager)

      if (
        parseSortableKind(active) === SortableKind.WINDOW &&
        isDefined(source.windowIndex) &&
        isDefined(destination.windowIndex)
      ) {
        // reordering window
        const sessionId = sessionsManager.current.id
        const win = sessionsManager.current.windows[source.windowIndex]
        moveWindows({
          source: {
            sessionId,
            windowIds: [win.id],
          },
          destination: {
            sessionId,
            index: destination.windowIndex,
          },
        })
      } else if (source.tabId && destination.tabId) {
        if (isDefined(destination.windowIndex)) {
          const overIndex = destination.tabIndex
          const overTabs = windows[destination.windowIndex].tabs
          if (!isDefined(overIndex)) {
            destination.tabIndex = overTabs.length + 1
          } else {
            const isBelowOverItem =
              over &&
              active.rect.current.translated &&
              active.rect.current.translated.top >
                over.rect.top + over.rect.height
            const modifier = isBelowOverItem ? 1 : 0
            destination.tabIndex =
              overIndex >= 0 ? overIndex + modifier : overTabs.length + 1
          }
        }

        // reordering tab
        void moveTabs({
          source,
          destination,
        })
      }

      setActiveDraggable({})
    }
  }

  const onDragOver = ({ active, over }: DragOverEvent) => {
    const overId = over?.id

    if (!overId) {
      return
    }
    const source = findWindowTabIds(active, sessionsManager)
    console.log('source: ', source)
    const destination = findWindowTabIds(over, sessionsManager)

    if (
      !isDefined(source.windowIndex) ||
      !isDefined(destination.windowIndex) ||
      !isDefined(source.tabIndex) ||
      !isDefined(destination.tabIndex)
    ) {
      return
    }

    // setSessionsManager((sessionsManager) => {
    //   if (
    //     sessionsManager &&
    //     isDefined(destination.windowIndex) &&
    //     source.windowIndex !== destination.windowIndex
    //   ) {
    //     const windows = sessionsManager.current.windows
    //     const overTabs = windows[destination.windowIndex].tabs
    //     const activeIndex = source.tabIndex
    //     const overIndex = destination.tabIndex

    //     if (!isDefined(overIndex)) {
    //       destination.tabIndex = overTabs.length + 1
    //     } else {
    //       const isBelowOverItem =
    //         over &&
    //         active.rect.current.translated &&
    //         active.rect.current.translated.top >
    //           over.rect.top + over.rect.height

    //       const modifier = isBelowOverItem ? 1 : 0

    //       destination.tabIndex =
    //         overIndex >= 0 ? overIndex + modifier : overTabs.length + 1
    //     }

    //     recentlyMovedToNewContainer.current = true

    //     // void moveTabs({
    //     //   source,
    //     //   destination,
    //     //   dryRun: true,
    //     // })

    //     sessionsManager.current.windows = {
    //       ...items,
    //       [activeContainer]: items[activeContainer].filter(
    //         (item) => item !== active.id
    //       ),
    //       [overContainer]: [
    //         ...items[overContainer].slice(0, newIndex),
    //         items[activeContainer][activeIndex],
    //         ...items[overContainer].slice(
    //           newIndex,
    //           items[overContainer].length
    //         ),
    //       ],
    //     }

    //     return sessionsManager
    //   }
    // })
  }

  const onDragCancel = (_event: DragCancelEvent) => {
    if (clonedSessionsManager) {
      // reset state from items dragged across windows
      setSessionsManager(clonedSessionsManager)
    }

    setActiveDraggable({})
    setClonedSessionsManager(undefined)
  }

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (sessionsManager) {
        const windows = sessionsManager.current.windows
        const source = {
          windowIndex: activeDraggable.windowIndex,
          tabIndex: activeDraggable.tabIndex,
        }
        // moving window
        if (isDefined(source.windowIndex) && !isDefined(source.tabIndex)) {
          return closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) =>
                container.data.current?.type === SortableKind.WINDOW
            ),
          })
        }

        // Find intersections with pointer or within rect
        const pointerIntersections = pointerWithin(args)
        const intersections =
          pointerIntersections.length > 0
            ? pointerIntersections
            : rectIntersection(args)
        let over = getFirstCollision(intersections)
        const destination = findWindowTabIds(
          over?.data?.droppableContainer,
          sessionsManager
        )

        if (over) {
          if (isDefined(destination.tabIndex)) {
            over = closestCenter(args)[0]
          } else if (isDefined(destination.windowIndex)) {
            const tabs = windows[destination.windowIndex].tabs

            // If matched window and contains tabs
            if (tabs.length > 0) {
              over = closestCorners({
                ...args,
                droppableContainers: args.droppableContainers.filter(
                  (container) =>
                    container.data.current?.type === SortableKind.WINDOW
                ),
              })[0]
            }
          }

          lastOverId.current = over.id

          return [{ id: over.id }]
        }

        // When a draggable item moves to a new container, the layout may shift
        // and the `overId` may become `null`. We manually set the cached `lastOverId`
        // to the id of the draggable item that was moved to the new container, otherwise
        // the previous `overId` will be returned which can cause items to incorrectly shift positions
        if (recentlyMovedToNewContainer.current) {
          // lastOverId.current = activeId
        }

        // If no droppable is matched, return the last match
        return lastOverId.current ? [{ id: lastOverId.current }] : []
      }

      return []
    },
    [activeDraggable, sessionsManager]
  )

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false
    })
  }, [sessionsManager?.current.windows])

  return {
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
    collisionDetectionStrategy,
    activeDraggable,
    sessionsManager,
  }
}
