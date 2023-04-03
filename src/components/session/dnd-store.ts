import {
  DropResult,
  OnBeforeCaptureResponder,
  SensorAPI,
  DraggableProvidedDraggableProps,
} from '@hello-pangea/dnd'
import { atom, useAtom } from 'jotai'
import { useCallback, useRef } from 'react'

import { ifHTMLElement } from 'utils/dom'
import { brandUuid, getBrandKind, UuidKind } from 'utils/generate'
import { isDefined, Valueof } from 'utils/helpers'
import { SessionTab } from 'utils/session-tab'
import { SessionWindow } from 'utils/session-window'

import { useDndHandlers } from './dnd-handlers'
import { useSessionsManager } from './store'

type DataDraggable = Pick<
  DraggableProvidedDraggableProps,
  'data-rfd-draggable-id'
>

export const draggableDataAttrName: keyof DataDraggable =
  'data-rfd-draggable-id'

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

export type ApiControllerRef = React.MutableRefObject<SensorAPI | undefined>

/**
 * @usage for programmatic changes to the table
 * Modeled after https://github.com/hello-pangea/dnd/blob/00d2fd24ef9db1c62274d89da213b711efbacdde/stories/src/programmatic/with-controls.tsx#L239-L243
 */
export const useApiController = () => {
  const apiControllerRef = useRef<SensorAPI>()

  const apiControllerSensor = (api: SensorAPI) => {
    apiControllerRef.current = api
  }

  return {
    apiControllerSensor,
    apiControllerRef,
  }
}

export const useDndSessions = () => {
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
    [sessionsManager, setActiveDragKind]
  )

  /**
   * @note This must be synchronous and update optimistically
   * https://github.com/atlassian/react-beautiful-dnd/issues/873#issuecomment-435711992
   */
  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (sessionsManager) {
        const { source, destination } = result

        if (
          // Dropped somewhere and moved
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
            // focus moved window
            ifHTMLElement(
              document.querySelector(`[${draggableDataAttrName}="${win.id}"]`)
            )?.focus()
          } else {
            // reordering tab
            // TODO: support all session types
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
              }).then((target) => {
                // focus moved tab
                if (target) {
                  ifHTMLElement(
                    document.querySelector(
                      `[${draggableDataAttrName}="${getWindowTabDraggableId(
                        target.windowId,
                        target.tabId
                      )}"]`
                    )
                  )?.focus()
                }
              })
            }
          }
        }

        setActiveDragKind(undefined)
      }
    },
    [sessionsManager, moveWindows, moveTabs, setActiveDragKind]
  )

  return {
    onBeforeCapture,
    onDragEnd,
    sessionsManager,
  }
}
