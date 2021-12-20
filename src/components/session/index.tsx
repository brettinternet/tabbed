import { DragDropContext } from 'react-beautiful-dnd'

import { useSettings, isPopup } from 'components/app/store'
import { defaultSettings } from 'utils/settings'

import { useListeners } from './handlers'
import { SessionContainer } from './session-container'
import { useSessions } from './store'

// Scrolling is handled within certain divs
// Without this, there's a minor UI bug where scroll bar appears with spacing on the right
if (isPopup) {
  document.body.classList.add('overflow-hidden')
}

/**
 * @docs DND callbacks
 * https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/responders.md
 */
export const SessionLayout = () => {
  const [settings] = useSettings()
  const {
    onBeforeCapture,
    onDragEnd,
    activeDragKind,
    sessionsManager,
    setSessionsManager,
  } = useSessions()
  useListeners(setSessionsManager)

  if (sessionsManager) {
    const session = sessionsManager.current
    return (
      <div
        style={{
          maxHeight: isPopup
            ? (settings || defaultSettings).popupDimensions.height - 50
            : undefined,
        }}
      >
        <DragDropContext
          onBeforeCapture={onBeforeCapture}
          onDragEnd={onDragEnd}
        >
          <SessionContainer session={session} activeDragKind={activeDragKind} />
        </DragDropContext>
      </div>
    )
  }

  return null
}
