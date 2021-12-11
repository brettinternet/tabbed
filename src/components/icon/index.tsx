import cn, { Argument as ClassNames } from 'classnames'
import { cloneElement, useEffect, useState } from 'react'

import { Valueof } from 'utils/helpers'

/**
 * Map friendly name
 */
export const Name = {
  COG: 'cog', // options
  X: 'x', // close
  MORE_VERTICAL: 'more-vertical', // button dropdown
  SOUND_OFF: 'sound-off', // tab muted
  THUMBTACK: 'thumbtack', // tab pinned
  FILE_NO_ACCESS: 'file-no-access', // tab discarded
  ALARM: 'alarm', // tab attention
  FILE_TICK: 'file-tick', // tab active
  BIN: 'bin', // delete/trash
  DRAG_VERTICAL: 'drag-vertical', // drag indicator
  RIGHT_CIRCLE: 'right-circle', // go or open
  FILE_PLUS: 'file-plus', // open window
  FILE_MINUS: 'file-minus', // minimized window
  FILE: 'file', // generic window
  SAVE: 'save', // save
  SECTION_REMOVE: 'section-remove', // discard tab - free memory
  SEARCH: 'search',
  TICK: 'tick', // checkmark
  KEYBOARD: 'keyboard', // shortcuts
  ADJUST_VERTICAL_ALT: 'adjust-vertical-alt', // settings
  MINUS_CIRCLE: 'minus-circle', // incognito/private browsing
} as const

type NameType = Valueof<typeof Name>

export const Size = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
} as const

type SizeType = Valueof<typeof Size>

const getSizeClass = (size: SizeType) => {
  switch (size) {
    case Size.SM:
      return 'h-3 w-3'
    case Size.MD:
      return 'h-4 w-4'
    case Size.LG:
      return 'h-5 w-5'
  }
}

export type IconProps = {
  name: NameType
  size?: SizeType
  type?: 'outline' | 'solid'
  className?: ClassNames
  title?: string
  ariaLabel?: string
}

type IconElement = React.DetailedReactHTMLElement<
  React.HTMLAttributes<HTMLElement> & {
    title?: string
  },
  HTMLElement
>

export const Icon: React.FC<IconProps> = ({
  name,
  size = Size.MD,
  type = 'outline',
  className,
  title,
  ariaLabel,
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

  return cloneElement(Icon, {
    className: cn(className, getSizeClass(size)),
    title,
    'aria-label': ariaLabel || title,
  })
}
