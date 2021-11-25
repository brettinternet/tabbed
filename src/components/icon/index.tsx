import { cloneElement, useEffect, useState } from 'react'

/**
 * Map friendly name
 */
export enum IconName {
  SETTINGS = 'cog',
  CLOSE = 'x',
}

enum Size {
  'SM',
  'MD',
}

const getSizeClass = (size: Size) => {
  switch (size) {
    case Size.SM:
      return 'h-2 w-2'
    case Size.MD:
      return 'h-4 w-4'
  }
}

type IconProps = {
  name: string | IconName
  size?: Size
  type?: 'outline' | 'solid'
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
}) => {
  const [Icon, setIcon] = useState<IconElement>()
  console.log('Icon: ', Icon)

  useEffect(() => {
    ;(async () => {
      const iconImport = await import(`teenyicons/${type}/${name}.svg`)
      setIcon(iconImport.ReactComponent)
    })()
  }, [type, name])

  if (!Icon) {
    return null
  }

  return cloneElement(Icon, { className: getSizeClass(size) })
}
