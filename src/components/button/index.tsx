import cn, { Argument as ClassNames } from 'classnames'

import { Icon, IconProps } from 'components/icon'
import { Valueof } from 'utils/helpers'

const Variant = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  TRANSPARENT: 'transparent',
  NONE: 'none',
} as const

type VariantType = Valueof<typeof Variant>

const Shape = {
  ROUNDED: 'rounded',
  ITEM: 'item',
  NONE: 'none',
} as const

type ShapeType = Valueof<typeof Shape>

const getVariantClass = (variant: VariantType) => {
  switch (variant) {
    case Variant.PRIMARY:
      return 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-300 dark:text-black'
    case Variant.SECONDARY:
      return 'bg-gray-200 text-black dark:bg-gray-700 dark:text-gray-100'
    case Variant.TRANSPARENT:
      return 'hover:bg-gray-100'
  }
}

const getShapeClass = (shape: ShapeType) => {
  switch (shape) {
    case Shape.ROUNDED:
      return 'p-2 rounded-full'
    case Shape.ITEM:
      return 'p-2 w-full'
  }
}

export const getClass = ({
  variant = Variant.PRIMARY,
  shape = Shape.ROUNDED,
}: {
  variant?: VariantType
  shape?: ShapeType
} = {}) => {
  return cn(
    'flex flex-row items-center transition-colors duration-100',
    getShapeClass(shape),
    getVariantClass(variant)
  )
}

export type ButtonProps = {
  className?: ClassNames
  variant?: VariantType
  iconProps?: IconProps
  text?: string
  shape?: ShapeType
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button: React.FC<ButtonProps> = ({
  children,
  text = children,
  className,
  variant,
  shape,
  iconProps,
  ...props
}) => (
  <button className={cn(getClass({ variant, shape }), className)} {...props}>
    {iconProps && <Icon {...iconProps} className={text && 'mr-2'} />}
    {text}
  </button>
)
