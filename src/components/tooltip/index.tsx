import { Placement } from '@popperjs/core'
import cn, { Argument as ClassNames } from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { usePopper } from 'react-popper'

import { isDefined } from 'utils/helpers'
import { Portal } from 'utils/portal'

type TooltipProps = React.PropsWithChildren<{
  className?: ClassNames
  offset?: number
  placement?: Placement
  portalEnabled?: boolean
  content: React.ReactNode
}>

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  className,
  offset = 10,
  placement = 'top',
  portalEnabled = true,
  content,
}) => {
  const [show, setShow] = useState<boolean>(false)
  const [trigger, setTrigger] = useState<HTMLElement | null>(null)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const { styles, attributes } = usePopper(trigger, container, {
    placement,
    modifiers: isDefined(offset)
      ? [{ name: 'offset', options: { offset: [0, offset] } }]
      : undefined,
  })

  const showTooltip = () => {
    setShow(true)
  }

  const hideTooltip = () => {
    setShow(false)
  }

  return (
    <>
      <AnimatePresence>
        {show && (
          <Portal enabled={portalEnabled}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                dur: 0.1,
                transition: {
                  delay: 0.7,
                },
              }}
              exit={{ opacity: 0 }}
              ref={setContainer}
              style={styles.popper}
              {...attributes.popper}
              className={cn(
                'z-menu bg-slate-700 text-gray-200 px-1 rounded',
                className
              )}
            >
              {content}
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
      <div
        ref={setTrigger}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </div>
    </>
  )
}
