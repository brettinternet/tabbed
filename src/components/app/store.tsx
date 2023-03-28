import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'
import browser, { Runtime } from 'webextension-polyfill'

import { Button } from 'components/button'
import { useToasts } from 'components/toast/store'
import { popupUrl, tabUrl, popoutUrl, sidebarUrl } from 'utils/env'
import { log } from 'utils/logger'

const logContext = 'app/store'

// Feature flags
export const isPopup =
  window.location.href.includes(popupUrl) || !window.location.href.includes('?')
export const isTab = window.location.href.includes(tabUrl)
export const isPopout = window.location.href.includes(popoutUrl)
export const isSidebar = window.location.href.includes(sidebarUrl)
export const isSidebarSupported = !!browser.sidebarAction
export const isMac = window.navigator.userAgent.toLowerCase().includes('mac')

const backgroundPortAtom = atom<Runtime.Port | undefined>(undefined)
const portErrorToastIdAtom = atom<string | undefined>(undefined)

export const usePort = () => {
  return useAtom(backgroundPortAtom)
}

export const useBackground = () => {
  const [toastId, setToastId] = useAtom(portErrorToastIdAtom)
  const [port] = usePort()
  const { add: addToast, remove: removeToast } = useToasts()
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
    return
  }

  return port
}

type AppDetails = {
  os: browser.Runtime.PlatformOs
}

const appDetailsAtom = atom<AppDetails | undefined>(undefined)

export const useSetAppDetails = () => {
  const [details, setDetails] = useAtom(appDetailsAtom)

  useEffect(() => {
    const getDetails = async () => {
      const { os } = await browser.runtime.getPlatformInfo()
      const details = {
        os,
      }
      setDetails(details)
    }

    void getDetails()
  }, [setDetails])

  return [details, setDetails]
}

export const useAppDetails = () => useAtom(appDetailsAtom)
