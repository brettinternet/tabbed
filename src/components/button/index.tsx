import cn, { Argument as ClassNames } from 'classnames'

import { Icon, IconProps } from 'components/icon'
import { Valueof } from 'utils/helpers'

const ButtonVariant = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  NONE: 'none',
} as const

type ButtonVariantType = Valueof<typeof ButtonVariant>

const getVariantClass = (variant: ButtonVariantType) => {
  switch (variant) {
    case ButtonVariant.PRIMARY:
      return 'bg-blue-600 text-white dark:bg-blue-300 dark:text-black'
    case ButtonVariant.SECONDARY:
      return 'bg-gray-200 text-black dark:bg-gray-700 dark:text-gray-100'
  }
}

type ButtonProps = {
  className?: ClassNames
  variant?: ButtonVariantType
  iconProps?: IconProps
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = ButtonVariant.PRIMARY,
  iconProps,
  ...props
}) => {
  return (
    <button
      className={cn(
        variant !== ButtonVariant.NONE && 'py-1 px-2 rounded-md',
        className,
        getVariantClass(variant)
      )}
      {...props}
    >
      {iconProps && <Icon {...iconProps} className={children && 'mr-2'} />}
      {children}
    </button>
  )
}
