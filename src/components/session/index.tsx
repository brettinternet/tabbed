import { DragDropContext } from '@hello-pangea/dnd'

import { isPopup } from 'components/app/store'
import { useAllowFocusRingListener } from 'components/focus'
import { useSettings } from 'components/settings/store'
import { useFocusShortcuts } from 'components/shortcuts/sessions'
import { defaultSettings } from 'utils/settings'

import { useDndSessions } from './dnd-store'
import { SessionContainer } from './session-container'

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
  useAllowFocusRingListener()
  useFocusShortcuts()
  const [settings] = useSettings()
  const { onBeforeCapture, onDragEnd, sessionsManager } = useDndSessions()

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
          enableDefaultSensors
          onBeforeCapture={onBeforeCapture}
          onDragEnd={onDragEnd}
        >
          <SessionContainer session={session} />
        </DragDropContext>
      </div>
    )
  }

  return null
}
