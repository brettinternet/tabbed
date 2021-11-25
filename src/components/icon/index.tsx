import cn, { Argument as ClassNames } from 'classnames'
import { cloneElement, useEffect, useState } from 'react'

import { Valueof } from 'utils/helpers'

/**
 * Map friendly name
 */
export const Name = {
  COG: 'cog',
  X: 'x',
} as const

type NameType = Valueof<typeof Name>

export const Size = {
  SM: 'sm',
  MD: 'md',
} as const

type SizeType = Valueof<typeof Size>

const getSizeClass = (size: SizeType) => {
  switch (size) {
    case Size.SM:
      return 'h-2 w-2'
    case Size.MD:
      return 'h-4 w-4'
  }
}

export type IconProps = {
  name: NameType
  size?: SizeType
  type?: 'outline' | 'solid'
  className?: ClassNames
}

type IconElement = React.DetailedReactHTMLElement<
  React.HTMLProps<HTMLElement> & {
    title?: string
  },
  HTMLElement
>

export const Icon: React.FC<IconProps> = ({
  name,
  size = Size.MD,
  type = 'outline',
  className,
}) => {
  const [Icon, setIcon] = useState<IconElement>()

  useEffect(() => {
    ;(async () => {
      const iconImport = await import(`teenyicons/${type}/${name}.svg`)
      setIcon(iconImport.ReactComponent)
    })()
  }, [type, name])

  if (!Icon) {
    return null
  }

  return cloneElement(Icon, { className: cn(className, getSizeClass(size)) })
}
