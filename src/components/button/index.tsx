import cn, { Argument as ClassNames } from 'classnames'
import { forwardRef } from 'react'

import { Icon, IconProps } from 'components/icon'
import { Valueof } from 'utils/helpers'

const Variant = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  TRANSPARENT: 'transparent',
  LINK: 'link',
  CARD_ACTION: 'card-action',
  ITEM: 'item',
  NONE: 'none',
} as const

type VariantValue = Valueof<typeof Variant>

const Shape = {
  ROUNDED: 'rounded',
  ICON: 'icon',
  ITEM: 'item',
  OUTLINE: 'outline',
  NONE: 'none',
} as const

type ShapeValue = Valueof<typeof Shape>

const getVariantClass = (variant: VariantValue) => {
  switch (variant) {
    case Variant.PRIMARY:
      return 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-300 dark:text-black'
    case Variant.SECONDARY:
      return 'bg-gray-200 text-black dark:bg-gray-700 dark:text-gray-100'
    case Variant.TRANSPARENT:
      return 'hover:bg-gray-100 dark:hover:bg-gray-700 disabled:text-gray-600'
    case Variant.LINK:
      return 'text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-500'
    case Variant.CARD_ACTION:
      return 'text-gray-500 border-gray-300 hover:text-gray-500 hover:border-gray-400 dark:text-gray-400 dark:hover:text-gray-300 dark:border-gray-500 dark:hover:border-gray-500'
    case Variant.ITEM:
      return 'text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
  }
}

const getShapeClass = (shape: ShapeValue) => {
  switch (shape) {
    case Shape.ROUNDED:
      return 'px-4 py-1 rounded-full'
    case Shape.ICON:
      return 'p-1 rounded-full'
    case Shape.ITEM:
      return 'p-1 w-full rounded'
    case Shape.OUTLINE:
      return 'p-1 border rounded'
  }
}

export const getClass = ({
  variant = Variant.PRIMARY,
  shape = Shape.ROUNDED,
  inline = variant === Variant.LINK,
}: {
  variant?: VariantValue
  shape?: ShapeValue
  inline?: boolean
} = {}) =>
  cn(
    'appearance-none flex-row items-center transition-colors duration-100',
    inline ? 'inline-flex' : 'flex',
    getShapeClass(shape),
    getVariantClass(variant)
  )

export type ButtonProps = {
  className?: ClassNames
  variant?: VariantValue
  iconProps?: IconProps
  text?: string
  shape?: ShapeValue
  inline?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      text = children,
      className,
      variant,
      shape,
      inline,
      iconProps,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      className={cn(
        getClass({
          variant,
          shape: shape || (iconProps ? Shape.ICON : shape),
          inline,
        }),
        className
      )}
      {...props}
    >
      {iconProps && (
        <Icon
          {...iconProps}
          className={cn(text && 'mr-2', iconProps.className)}
        />
      )}
      {text}
    </button>
  )
)
