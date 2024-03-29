import { atom, useAtom } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'
import browser, { Runtime } from 'webextension-polyfill'

import { Button } from 'components/button'
import { useToasts } from 'components/toast/store'
import { popupUrl, tabUrl, popoutUrl, sidebarUrl } from 'utils/env'
import { log, logStartup } from 'utils/logger'

const logContext = 'app/store'

// Feature flags
export const isPopup =
  window.location.href.includes(popupUrl) || !window.location.href.includes('?')
export const isTab = window.location.href.includes(tabUrl)
export const isPopout = window.location.href.includes(popoutUrl)
export const isSidebar = window.location.href.includes(sidebarUrl)
export const isSidebarSupported = !!browser.sidebarAction
export const isMac = window.navigator.userAgent.toLowerCase().includes('mac')

export const useLogStartup = () => {
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      void logStartup()
      mounted.current = true
    }
  }, [])
}

const backgroundPortAtom = atom<Runtime.Port | undefined>(undefined)
const portErrorToastIdAtom = atom<string | undefined>(undefined)

export const usePort = () => {
  const [port, setPort] = useAtom(backgroundPortAtom)
  const portRef = useRef<Runtime.Port | null>(null)

  const setter = useCallback(
    (newBackgroundPort: Runtime.Port) => {
      const handleDisconnect = () => {
        setPort(undefined)
        portRef.current = null
      }
      if (port) {
        port.onDisconnect.removeListener(handleDisconnect)
        port.disconnect()
      }
      newBackgroundPort.onDisconnect.addListener(handleDisconnect)
      setPort(newBackgroundPort)
    },
    [port, setPort]
  )

  return [port, setter, portRef] as const
}

export const useBackground = () => {
  const [toastId, setToastId] = useAtom(portErrorToastIdAtom)
  const [port] = usePort()
  const { add: addToast, remove: removeToast } = useToasts()
  useEffect(() => {
    if (!port) {
      log.error(
        logContext,
        'Failed to send or receive message. Missing background port.'
      )
      if (!toastId) {
        const id = addToast({
          variant: 'error',
          message:
            'There was an error trying to connect to the app. Please refresh the extension.',
        })
        setToastId(id)
      }
    }

    if (port?.error) {
      log.error(logContext, port.error)
      if (toastId) {
        removeToast(toastId)
      }
      const id = addToast({
        variant: 'error',
        autoDismiss: false,
        message: (
          <>
            There was an error trying to connect to the app. Please{' '}
            <Button
              className="text-white underline"
              inline
              variant="none"
              shape="none"
              onClick={() => {
                browser.runtime.reload()
              }}
            >
              click to reload the extension
            </Button>
          </>
        ),
      })
      setToastId(id)
    }
  }, [port, toastId, addToast, removeToast, setToastId])

  return port
}
