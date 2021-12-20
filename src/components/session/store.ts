import { useCallback, useEffect, useState } from 'react'
import {
  DraggableLocation,
  DropResult,
  OnBeforeCaptureResponder,
} from 'react-beautiful-dnd'

import { reorder, spliceSeparate, Valueof } from 'utils/helpers'
import {
  SessionsManagerData,
  SessionTabData,
  SessionWindowData,
} from 'utils/sessions'

import { useHandlers } from './handlers'

const shouldPin = (
  target: SessionWindowData['tabs'][number],
  previous: SessionWindowData['tabs'][number] | undefined,
  next: SessionWindowData['tabs'][number] | undefined
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

const reorderTabs = ({
  sessionId,
  windows: _windows,
  source,
  destination,
  moveTabs,
}: {
  sessionId: string
  windows: SessionWindowData[]
  source: DraggableLocation
  destination: DraggableLocation
  moveTabs: ReturnType<typeof useHandlers>['moveTabs']
}): SessionWindowData[] => {
  const windows = _windows.slice()

  const currentWindowIndex = windows.findIndex(
    (w) => w.id === source.droppableId
  )
  const nextWindowIndex = windows.findIndex(
    (w) => w.id === destination.droppableId
  )

  if (currentWindowIndex > -1) {
    let target: SessionTabData | undefined
    if (nextWindowIndex > -1) {
      const index =
        source.index > destination.index
          ? destination.index
          : destination.index + 1
      const nextTab: SessionWindowData['tabs'][number] | undefined =
        windows[nextWindowIndex].tabs[index]
      const previousTab: SessionWindowData['tabs'][number] | undefined =
        windows[nextWindowIndex].tabs[
          index - 1 - (source.droppableId !== destination.droppableId ? 1 : 0)
        ]

      if (source.droppableId === destination.droppableId) {
        // moving to same window list
        windows[currentWindowIndex].tabs = reorder(
          windows[nextWindowIndex].tabs,
          source.index,
          destination.index
        )
        target = windows[nextWindowIndex].tabs[destination.index]
        target.pinned = shouldPin(target, previousTab, nextTab)
      } else {
        // moving to different window list
        // remove from original window tab list & insert into next window tab list
        const [modifiedFrom, modifiedTo] = spliceSeparate(
          windows[currentWindowIndex].tabs,
          windows[nextWindowIndex].tabs,
          source.index,
          destination.index
        )
        windows[currentWindowIndex].tabs = modifiedFrom
        windows[nextWindowIndex].tabs = modifiedTo
        // console.log('windows: ', windows, nextWindowIndex, destination.index)

        target = windows[nextWindowIndex].tabs[destination.index]
        target.pinned = shouldPin(target, previousTab, nextTab)
      }
    } else {
      target = windows[currentWindowIndex].tabs[source.index]
    }

    void moveTabs({
      from: {
        sessionId,
        windowId: windows[currentWindowIndex].id,
        tabIds: [target.id],
      },
      to: {
        sessionId,
        windowId: windows[nextWindowIndex]?.id,
        index: destination.index,
        pinned: target.pinned,
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
  const [sessionsManager, setSessionsManager] = useState<SessionsManagerData>()
  const [activeDragKind, setActiveDragKind] =
    useState<ActiveDragKindType>(undefined)
  console.log('sessionsManager: ', sessionsManager)
  const { getSessionsManagerData, moveWindows, moveTabs } = useHandlers()

  useEffect(() => {
    const fetch = async () => {
      const startTime = performance.now()
      const manager = await getSessionsManagerData()
      const endTime = performance.now()
      console.log(
        `Call to load manager took ${endTime - startTime} milliseconds`
      )
      if (manager) {
        setSessionsManager(manager)
      }
    }

    void fetch()
  }, [getSessionsManagerData])

  const onBeforeCapture: OnBeforeCaptureResponder = useCallback(
    ({ draggableId }) => {
      setActiveDragKind(
        draggableId.includes('tab') ? ActiveDragKind.TAB : ActiveDragKind.WINDOW
      )
    },
    []
  )

  const onDragEnd = useCallback(
    (result: DropResult) => {
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
          setSessionsManager((sessionsManager) => {
            if (sessionsManager) {
              const sessionId = sessionsManager.current.id
              const win = sessionsManager.current.windows[source.index]
              void moveWindows({
                from: {
                  sessionId,
                  windowIds: [win.id],
                },
                to: {
                  sessionId,
                  index: destination.index,
                },
              })
              const reorderedWindows = reorder(
                sessionsManager.current.windows,
                source.index,
                destination.index
              )
              sessionsManager.current.windows = reorderedWindows
              return sessionsManager
            }
          })
          return
        }

        // reordering tab
        setSessionsManager((sessionsManager) => {
          if (sessionsManager) {
            const sessionId = sessionsManager.current.id
            const windows = sessionsManager.current.windows
            const reorderedWindowTabs = reorderTabs({
              sessionId,
              windows,
              source,
              destination,
              moveTabs,
            })
            sessionsManager.current.windows = reorderedWindowTabs
            return sessionsManager
          }
        })
      }

      setActiveDragKind(undefined)
    },
    [moveWindows, moveTabs]
  )

  return {
    onBeforeCapture,
    onDragEnd,
    activeDragKind,
    sessionsManager,
    setSessionsManager,
  }
}
