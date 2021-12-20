import cn, { Argument as ClassNames } from 'classnames'

import { ButtonProps, getClass } from 'components/button'
import { Icon, IconProps } from 'components/icon'
import { Valueof } from 'utils/helpers'

const Variant = {
  ANCHOR: 'anchor',
  BUTTON: 'button',
  NONE: 'none',
} as const

type VariantType = Valueof<typeof Variant>

type LinkProps = {
  href: string
  variant?: VariantType
  className?: ClassNames
  buttonVariant?: ButtonProps['variant']
  buttonShape?: ButtonProps['shape']
  text?: string
  iconProps?: IconProps
  newWindow?: boolean
} & React.AnchorHTMLAttributes<HTMLAnchorElement>

export const Link: React.FC<LinkProps> = ({
  children,
  text = children,
  href,
  className,
  buttonVariant = 'link',
  buttonShape = 'none',
  iconProps,
  newWindow,
  ...props
}) => (
  <a
    href={href}
    className={cn(
      className,
      getClass({ shape: buttonShape, variant: buttonVariant })
    )}
    {...(newWindow ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    {...props}
  >
    {iconProps && <Icon {...iconProps} className={text && 'mr-2'} />}
    {text}
  </a>
)
