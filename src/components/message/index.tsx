import cn, { Argument as ClassNames } from 'classnames'

import { Button } from 'components/button'
import { IconName } from 'components/icon'
import { Valueof } from 'utils/helpers'

export const MessageVariant = {
  INFO: 'info',
  SUCCESS: 'success',
  WARN: 'warn',
  ERROR: 'error',
  NONE: 'none',
} as const

export type MessageVariantType = Valueof<typeof MessageVariant>

const getVariantClass = (variant: MessageVariantType | undefined) => {
  switch (variant) {
    case MessageVariant.SUCCESS:
      return 'bg-white dark:bg-gray-700'
    case MessageVariant.INFO:
      return 'bg-blue-500 text-white dark:bg-gray-700'
    case MessageVariant.WARN:
      return 'bg-yellow-500 text-white dark:bg-yellow-600'
    case MessageVariant.ERROR:
      return 'bg-red-600 text-white dark:bg-red-400'
    default:
      return 'bg-white dark:bg-gray-700 border border-gray-300'
  }
}

type Tag<T = any> = T extends React.ElementType
  ? React.ComponentProps<T> & keyof JSX.IntrinsicElements
  : never

type MessageProps<T extends keyof JSX.IntrinsicElements = any> = {
  as?: Tag<T>
  title?: string
  body?: React.ReactNode
  variant?: MessageVariantType
  className?: ClassNames
  onDismiss?: React.MouseEventHandler
} & React.HTMLAttributes<HTMLElement> &
  React.ComponentProps<T> &
  React.PropsWithChildren

export const Message: React.FC<MessageProps> = ({
  as: Tag = 'div',
  title,
  children,
  body,
  variant,
  className,
  onDismiss,
  ...props
}) => (
  <Tag
    className={cn(
      'flex justify-between items-center m-4 p-3 min-h-11 shadow-md rounded',
      getVariantClass(variant),
      className
    )}
    {...props}
  >
    {children || (
      <p>
        {title && <b className="mr-1">{title}</b>}
        {body}
      </p>
    )}
    {onDismiss && (
      <Button
        variant="none"
        onClick={onDismiss}
        iconProps={{ name: IconName.CLOSE }}
      />
    )}
  </Tag>
)
