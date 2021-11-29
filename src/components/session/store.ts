import { useEffect, useState } from 'react'
import { DraggableLocation, DropResult } from 'react-beautiful-dnd'

import { parseNum, reorder, spliceSeparate } from 'utils/helpers'
import { SessionsManagerData, SessionWindowData } from 'utils/sessions'

import { getSessionsManagerData } from './api'

const shouldPin = (
  target: SessionWindowData['tabs'][number],
  previous: SessionWindowData['tabs'][number] | undefined,
  next: SessionWindowData['tabs'][number] | undefined
) => {
  if (next?.pinned) {
    return true
  }

  if (previous && !previous.pinned) {
    return false
  }

  return target.pinned
}

const reorderTabs = (
  _windows: SessionWindowData[],
  source: DraggableLocation,
  destination: DraggableLocation
): SessionWindowData[] => {
  const windows = _windows.slice()

  const currentWindowIndex = windows.findIndex(
    (w) => w.id === parseNum(source.droppableId)
  )
  const nextWindowIndex = windows.findIndex(
    (w) => w.id === parseNum(destination.droppableId)
  )

  if (currentWindowIndex > -1 && nextWindowIndex > -1) {
    const index =
      source.index > destination.index
        ? destination.index
        : destination.index + 1
    const nextTab: SessionWindowData['tabs'][number] | undefined =
      windows[nextWindowIndex].tabs[index]
    const previousTab: SessionWindowData['tabs'][number] | undefined =
      windows[nextWindowIndex].tabs[index - 1]

    if (source.droppableId === destination.droppableId) {
      // moving to same window list
      windows[currentWindowIndex].tabs = reorder(
        windows[currentWindowIndex].tabs,
        source.index,
        destination.index,
        (target) => {
          target.pinned = shouldPin(target, previousTab, nextTab)
          return target
        }
      )
    } else {
      // moving to different window list
      // remove from original window tab list & insert into next window tab list
      const [modifiedFrom, modifiedTo] = spliceSeparate(
        windows[currentWindowIndex].tabs,
        windows[nextWindowIndex].tabs,
        source.index,
        destination.index,
        (target) => {
          target.windowId = windows[nextWindowIndex].id
          target.pinned = shouldPin(target, previousTab, nextTab)
          return target
        }
      )

      windows[currentWindowIndex].tabs = modifiedFrom
      windows[nextWindowIndex].tabs = modifiedTo
    }
  }

  return windows
}

export const useWindowsDrag = () => {
  const [sessionManager, setSessionManager] = useState<SessionsManagerData>()
  const [windows, setWindows] = useState<SessionWindowData[]>([])

  useEffect(() => {
    const fetch = async () => {
      const startTime = performance.now()
      const manager = await getSessionsManagerData()
      const endTime = performance.now()
      console.log(
        `Call to load manager took ${endTime - startTime} milliseconds`
      )
      if (manager) {
        console.log('manager: ', manager)
        setSessionManager(manager)
        setWindows(manager.current.windows)
      }
    }

    void fetch()
  }, [])

  if (sessionManager) {
    const onDragEnd = (result: DropResult) => {
      const { source, destination } = result

      // dropped nowhere
      if (!destination) {
        return
      }

      // did not move anywhere
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return
      }

      // reordering window
      if (result.type === 'SESSION') {
        const reorderedWindows = reorder(
          windows,
          source.index,
          destination.index
        )
        setWindows(reorderedWindows)
        return
      }

      const reorderedWindowTabs = reorderTabs(windows, source, destination)
      setWindows(reorderedWindowTabs)
    }

    return {
      onDragEnd,
      sessionManager,
      windows,
    }
  }

  return {
    onDragEnd: () => {},
    sessionManager,
    windows,
  }
}
