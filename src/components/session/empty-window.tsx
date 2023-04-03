import { Droppable } from '@hello-pangea/dnd'
import cn, { Argument as ClassNames } from 'classnames'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import browser from 'webextension-polyfill'

import { Button } from 'components/button'
import { Icon, IconName } from 'components/icon'
import { isAllowedIncognitoAccess } from 'utils/browser'

import { DroppableId, DroppableType } from './dnd-store'

type EmptyWindowProps = {
  isTabDragging: boolean
  className?: ClassNames
}

export const EmptyWindow: React.FC<EmptyWindowProps> = ({
  isTabDragging,
  className,
}) => {
  const [allowIncognito, setAllowIncognito] = useState(false)

  useEffect(() => {
    const checkIncognito = async () => {
      setAllowIncognito(await isAllowedIncognitoAccess())
    }

    checkIncognito()
  }, [])

  return (
    <div
      className={cn(
        'pb-3 md:pb-0 md:w-80 lg:w-96 bg-gray-100 dark:bg-gray-900',
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center md:h-window-header"
      >
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
      </motion.div>
      <div className="p-2 h-72 md:h-tab-list">
        <div className="relative h-full w-full">
          <Droppable
            droppableId={DroppableId.NEW_WINDOW}
            type={DroppableType.WINDOW}
            // disables invalid activeDragKind from parent
            isDropDisabled={!isTabDragging}
          >
            {(dropProvided) => (
              <div
                ref={dropProvided.innerRef}
                className={cn(
                  'w-full',
                  allowIncognito ? 'h-1/2 md:h-2/3' : 'h-full'
                )}
              >
                {dropProvided.placeholder}
              </div>
            )}
          </Droppable>
          {allowIncognito && (
            <Droppable
              droppableId={DroppableId.NEW_INCOGNITO_WINDOW}
              type={DroppableType.WINDOW}
              isDropDisabled={!isTabDragging}
            >
              {(dropProvided) => (
                <div
                  ref={dropProvided.innerRef}
                  className="w-full h-1/2 md:h-1/3"
                >
                  {dropProvided.placeholder}
                </div>
              )}
            </Droppable>
          )}
          {isTabDragging && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'absolute inset-0 flex flex-col h-full rounded-lg border-2 transition-colors duration-100',
                'border-dashed border-gray-400 cursor-copy'
              )}
            >
              <div
                className={cn(
                  'w-full flex items-center justify-center hover:bg-blue-100',
                  allowIncognito ? 'h-2/3' : 'h-full'
                )}
              >
                <p className="flex flex-wrap items-center text-gray-400 dark:text-gray-700 font-bold">
                  <Icon name={IconName.WINDOW} className="mr-2" /> New window
                </p>
              </div>
              {allowIncognito && (
                <div className="h-1/3 w-full flex items-center justify-center border-t-2 border-dashed border-gray-400 hover:bg-indigo-200">
                  <p className="flex flex-wrap items-center text-gray-400 dark:text-gray-700 font-bold">
                    <Icon name={IconName.INCOGNITO} className="mr-2" /> New
                    incognito window
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
