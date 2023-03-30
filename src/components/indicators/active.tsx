import { ForwardRefComponent, HTMLMotionProps, motion } from 'framer-motion'

import { Icon, IconName, IconProps } from 'components/icon'

type ActiveProps = { title?: string; iconProps?: IconProps } & Partial<
  ForwardRefComponent<HTMLDivElement, HTMLMotionProps<'div'>>
>

export const Active: React.FC<ActiveProps> = ({
  title,
  iconProps,
  ...props
}) => (
  <motion.div
    transition={{
      repeat: Infinity,
      duration: 1.5,
    }}
    animate={{ scale: [1.1, 1.5, 1.1] }}
    {...props}
  >
    <Icon
      title={title}
      name={IconName.INDICATOR}
      className="text-blue-400 dark:text-lime-400"
      {...iconProps}
    />
  </motion.div>
)
