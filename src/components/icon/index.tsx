import MaterialIcon from '@mdi/react'
import cn, { Argument as ClassNames } from 'classnames'

import { Valueof } from 'utils/helpers'

import { IconName } from './icons'

export { IconName }

type IconNameType = Valueof<typeof IconName>

export const Size = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
} as const

type SizeType = Valueof<typeof Size>

const getSizeClass = (size: SizeType) => {
  switch (size) {
    case Size.XS:
      return 'h-3 w-3'
    case Size.SM:
      return 'h-4 w-4'
    case Size.MD:
      return 'h-5 w-5'
    case Size.LG:
      return 'h-6 w-6'
  }
}

export type IconProps = {
  name: IconNameType
  size?: SizeType
  className?: ClassNames
  title?: string
  ariaLabel?: string
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = Size.MD,
  className,
  title,
  ariaLabel,
}) => (
  <MaterialIcon
    path={name}
    title={title}
    className={cn(className, getSizeClass(size))}
    aria-label={ariaLabel || title}
  />
)
