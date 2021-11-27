import cn, { Argument as ClassNames } from 'classnames'

type LabelProps = {
  text?: string
  className?: ClassNames
  required?: boolean
}

export const Label: React.FC<LabelProps> = ({
  children,
  text,
  className,
  required,
}) => (
  <label className={cn('block', text && 'pb-2', className)}>
    {text}
    {required && (
      <span
        className="text-red-500 px-0.5"
        title="required"
        aria-label="required"
      >
        *
      </span>
    )}
    {children}
  </label>
)
