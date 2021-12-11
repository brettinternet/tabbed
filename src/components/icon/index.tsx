import cn, { Argument as ClassNames } from 'classnames'

import { Valueof } from 'utils/helpers'

import { IconName } from './icons'
import { useSvg } from './svg'

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
  // TODO: add tooltip for title
  title?: string
  ariaLabel?: string
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = Size.MD,
  className,
  title,
  ariaLabel,
}) => {
  const { SvgIcon, error, loading } = useSvg(name)

  if (!SvgIcon || loading) {
    return null
  }

  if (error) {
    return (
      <div
        className={cn(
          getSizeClass(size),
          'rounded-full border border-gray-100'
        )}
      />
    )
  }

  return (
    <SvgIcon
      className={cn(className, getSizeClass(size))}
      aria-label={ariaLabel || title}
    />
  )
}
