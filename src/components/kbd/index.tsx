import cn, { Argument as ClassNames } from 'classnames'

type KbdProps = React.PropsWithChildren<{
  className?: ClassNames
}>

export const Kbd: React.FC<KbdProps> = ({ children, className }) => (
  <kbd
    className={cn(
      'text-xxs border rounded-md border-gray-200 shadow-sm inline-flex items-center justify-center px-1',
      // hard to center text vertically with inline elements...
      typeof children === 'string' && 'pt-1',
      className
    )}
  >
    {children}
  </kbd>
)
