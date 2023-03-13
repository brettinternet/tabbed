import cn, { Argument as ClassNames } from 'classnames'

type KbdProps = React.PropsWithChildren<{
  className?: ClassNames
}>

export const Kbd: React.FC<KbdProps> = ({ children, className }) => (
  <kbd
    className={cn(
      className,
      'text-xxs border rounded-md border-gray-200 shadow-sm inline-block px-1'
    )}
  >
    {children}
  </kbd>
)
