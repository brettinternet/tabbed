import { Droppable } from '@hello-pangea/dnd'
import cn from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import browser from 'webextension-polyfill'

import { Button } from 'components/button'
import { Icon, IconName } from 'components/icon'
import { isAllowedIncognitoAccess } from 'utils/browser'

import { DroppableId, DroppableType } from './dnd-store'

type EmptyWindowProps = {
  isTabDragging: boolean
}

export const EmptyWindow: React.FC<EmptyWindowProps> = ({ isTabDragging }) => {
  const [allowIncognito, setAllowIncognito] = useState(false)

  useEffect(() => {
    const checkIncognito = async () => {
      setAllowIncognito(await isAllowedIncognitoAccess())
    }

    checkIncognito()
  }, [])

  return (
    <div className="pb-3 md:pb-0 md:w-80 md:min-w-[20rem] bg-gray-100 dark:bg-gray-900 snap-end">
      <div className="flex items-center justify-center md:h-window-header">
        <Button
          className="h-6 pl-4 pr-3 py-1 rounded-tl-full rounded-bl-full"
          variant="primary"
          shape="none"
          onClick={() => {
            browser.windows.create()
          }}
        >
          New window
        </Button>
        <Button
          className="h-6 ml-0.5 pr-4 pl-3 py-1 rounded-tr-full rounded-br-full"
          variant="primary"
          shape="none"
          onClick={() => {
            browser.windows.create({
              incognito: true,
            })
          }}
          iconProps={{ name: IconName.INCOGNITO, size: 'sm' }}
          aria-label="New incognito window"
        />
      </div>
      <div className="h-tab-list w-full px-3 pb-3">
        {/* replace `isTabDragging` with local droppable snapshot? */}
        <AnimatePresence initial={false}>
          {isTabDragging && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.95,
                transition: {
                  duration: 0.15,
                },
              }}
              className={cn(
                'flex flex-col items-center justify-center h-full rounded-lg border-2 transition-colors duration-100',
                'border-dashed border-gray-400 cursor-copy'
              )}
            >
              <Droppable
                droppableId={DroppableId.NEW_WINDOW}
                type={DroppableType.WINDOW}
              >
                {(dropProvided) => (
                  <div
                    ref={dropProvided.innerRef}
                    className={cn(
                      'w-full flex items-center justify-center rounded-t-lg transition-colors duration-100 hover:bg-blue-100',
                      allowIncognito ? 'h-2/3' : 'h-full'
                    )}
                  >
                    <p className="flex flex-wrap items-center text-gray-400 dark:text-gray-700 font-bold">
                      <Icon name={IconName.WINDOW} className="mr-2" /> New
                      window
                    </p>
                  </div>
                )}
              </Droppable>
              {allowIncognito && (
                <Droppable
                  droppableId={DroppableId.NEW_INCOGNITO_WINDOW}
                  type={DroppableType.WINDOW}
                >
                  {(dropProvided) => (
                    <div
                      ref={dropProvided.innerRef}
                      className="w-full h-1/3 flex items-center justify-center rounded-b-lg transition-colors duration-100 hover:bg-indigo-200 border-t-2 border-dashed border-gray-400"
                    >
                      <p className="flex flex-wrap items-center text-gray-400 dark:text-gray-700 font-bold">
                        <Icon name={IconName.INCOGNITO} className="mr-2" /> New
                        incognito window
                      </p>
                    </div>
                  )}
                </Droppable>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
