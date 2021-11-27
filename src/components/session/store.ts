import { useEffect, useState } from 'react'
import { DraggableLocation, DropResult } from 'react-beautiful-dnd'

import { SessionWindow } from 'utils/browser/session-window'
import { SessionsManager } from 'utils/browser/sessions'
import { parseNum, reorder, spliceSeparate } from 'utils/helpers'

const shouldPin = (
  target: SessionWindow['tabs'][number],
  previous: SessionWindow['tabs'][number] | undefined,
  next: SessionWindow['tabs'][number] | undefined
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
  _windows: SessionWindow[],
  source: DraggableLocation,
  destination: DraggableLocation
): SessionWindow[] => {
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
    const nextTab: SessionWindow['tabs'][number] | undefined =
      windows[nextWindowIndex].tabs[index]
    const previousTab: SessionWindow['tabs'][number] | undefined =
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
  const [sessionManager, setSessionManager] = useState<SessionsManager>()
  const [windows, setWindows] = useState<SessionWindow[]>([])

  useEffect(() => {
    const fetch = async () => {
      const startTime = performance.now()
      const manager = await SessionsManager.load()
      const endTime = performance.now()
      console.log(`Call to load took ${endTime - startTime} milliseconds`)

      const startTime1 = performance.now()
      console.log('manager: ', manager)
      const json = manager.toJSON()
      console.log('json: ', json)
      const newManager = SessionsManager.fromJSON(json)
      const endTime1 = performance.now()
      console.log('newManager: ', newManager)
      console.log(`Call to JSON took ${endTime1 - startTime1} milliseconds`)
      setSessionManager(newManager)
      setWindows(manager.current.windows)
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

    sessionManager.save()
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
