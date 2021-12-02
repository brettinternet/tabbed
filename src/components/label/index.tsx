import cn, { Argument as ClassNames } from 'classnames'

type LabelProps = {
  className?: ClassNames
  as?: 'label' | 'legend'
}

export const Label: React.FC<LabelProps> = ({
  children,
  className,
  as: Tag = 'label',
}) => <Tag className={cn('block', className)}>{children}</Tag>
