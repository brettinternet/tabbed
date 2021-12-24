import { useCallback, useState } from 'react'
import {
  DraggableLocation,
  DropResult,
  OnBeforeCaptureResponder,
} from 'react-beautiful-dnd'

import { BrandedUuid, brandUuid } from 'utils/generate'
import { isDefined, reorder, spliceSeparate, Valueof } from 'utils/helpers'
import { SessionTab } from 'utils/session-tab'
import { SessionWindow } from 'utils/session-window'

import { useDndHandlers } from './handlers'
import { useSessionsManager } from './store'

const shouldPin = (
  target: SessionWindow['tabs'][number],
  previous: SessionWindow['tabs'][number] | undefined,
  next: SessionWindow['tabs'][number] | undefined
) => {
  if (
    next?.pinned ||
    (target.pinned && previous?.pinned) ||
    (target.pinned && !previous)
  ) {
    return true
  }

  return false
}

const reorderTabs = async ({
  sessionId,
  windows: _windows,
  source,
  destination,
  moveTabs,
}: {
  sessionId: BrandedUuid<'session'>
  windows: SessionWindow[]
  source: DraggableLocation
  destination: DraggableLocation
  moveTabs: ReturnType<typeof useDndHandlers>['moveTabs']
}): Promise<SessionWindow[]> => {
  const windows = _windows.slice()

  const currentWindowIndex = windows.findIndex(
    (w) => w.id === brandUuid<'window'>(source.droppableId)
  )
  const nextWindowIndex = windows.findIndex(
    (w) => w.id === brandUuid<'window'>(destination.droppableId)
  )

  if (currentWindowIndex > -1) {
    let target: SessionTab | undefined
    if (nextWindowIndex > -1) {
      const index =
        source.index > destination.index
          ? destination.index
          : destination.index + 1
      const nextTab: SessionWindow['tabs'][number] | undefined =
        windows[nextWindowIndex].tabs[index]
      const previousTab: SessionWindow['tabs'][number] | undefined =
        windows[nextWindowIndex].tabs[
          index - 1 - (source.droppableId !== destination.droppableId ? 1 : 0)
        ]

      if (source.droppableId === destination.droppableId) {
        // moving to same window list
        // windows[currentWindowIndex].tabs = reorder(
        //   windows[nextWindowIndex].tabs,
        //   source.index,
        //   destination.index
        // )
        // target = windows[nextWindowIndex].tabs[destination.index]
        target = windows[currentWindowIndex].tabs[source.index]
        target.pinned = shouldPin(target, previousTab, nextTab)
      } else {
        // moving to different window list
        // remove from original window tab list & insert into next window tab list
        // const [modifiedFrom, modifiedTo] = spliceSeparate(
        //   windows[currentWindowIndex].tabs,
        //   windows[nextWindowIndex].tabs,
        //   source.index,
        //   destination.index
        // )
        // windows[currentWindowIndex].tabs = modifiedFrom
        // windows[nextWindowIndex].tabs = modifiedTo
        // console.log('windows: ', windows, nextWindowIndex, destination.index)

        // target = windows[nextWindowIndex].tabs[destination.index]
        target = windows[currentWindowIndex].tabs[source.index]
        target.pinned = shouldPin(target, previousTab, nextTab)
      }
    } else {
      target = windows[currentWindowIndex].tabs[source.index]
    }

    const windowId: BrandedUuid<'window'> | undefined =
      windows[nextWindowIndex]?.id

    await moveTabs({
      from: {
        sessionId,
        windowId: windows[currentWindowIndex].id,
        tabIds: [target.id],
      },
      to: isDefined(windowId)
        ? {
            sessionId,
            index: destination.index,
            pinned: target.pinned,
            windowId,
          }
        : {
            sessionId,
            pinned: target.pinned,
            incognito:
              destination.droppableId === DroppableId.NEW_INCOGNITO_WINDOW,
          },
    })
  }

  return windows
}

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
 * Defines type on react-beautiful-dnd droppable component
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

  const onDragEnd = useCallback(
    async (result: DropResult) => {
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
            await moveWindows({
              from: {
                sessionId,
                windowIds: [win.id],
              },
              to: {
                sessionId,
                index: destination.index,
              },
            })
            // const reorderedWindows = reorder(
            //   sessionsManager.current.windows,
            //   source.index,
            //   destination.index
            // )
            // sessionsManager.current.windows = reorderedWindows
          } else {
            // reordering tab
            const sessionId = sessionsManager.current.id
            const windows = sessionsManager.current.windows
            await reorderTabs({
              sessionId,
              windows,
              source,
              destination,
              moveTabs,
            })
          }
        }

        setActiveDragKind(undefined)
      }
    },
    [moveWindows, moveTabs]
  )

  return {
    onBeforeCapture,
    onDragEnd,
    activeDragKind,
    sessionsManager,
  }
}
