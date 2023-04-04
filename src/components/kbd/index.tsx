import cn, { Argument as ClassNames } from 'classnames'

type KbdProps = React.PropsWithChildren<{
  className?: ClassNames
}>

export const Kbd: React.FC<KbdProps> = ({ children, className }) => (
  <kbd
    className={cn(
      'text-xxs border rounded-md border-gray-200 dark:border-gray-600 shadow-sm inline-flex items-center justify-center h-4 px-1',
      typeof children === 'string' && 'pt-0.5',
      className
    )}
  >
    {children}
  </kbd>
)
