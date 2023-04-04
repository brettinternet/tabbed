import {
  FocusRing as TemplateFocusRing,
  FocusRingProps as TemplateFocusRingProps,
  useFocusRing as useTemplateFocusRing,
} from '@react-aria/focus'

import { focusRingClass, focusRingClassInset } from './constants'
import { useAllowFocusRing } from './store'

type FocusRingProps = TemplateFocusRingProps & {
  inset?: boolean
}

export const FocusRing: React.FC<FocusRingProps> = ({
  children,
  inset,
  ...props
}) => {
  const [show] = useAllowFocusRing()
  return (
    <TemplateFocusRing
      focusClass="outline-none"
      focusRingClass={
        show ? (inset ? focusRingClassInset : focusRingClass) : undefined
      }
      {...props}
    >
      {children}
    </TemplateFocusRing>
  )
}

export const useFocusRing = (inset?: boolean) => {
  const { isFocusVisible, focusProps } = useTemplateFocusRing()
  const [isAllowFocusRing, setAllowFocusRing] = useAllowFocusRing()
  return {
    isFocusVisible: isFocusVisible && isAllowFocusRing,
    setAllowFocusRing,
    focusProps: {
      className: isFocusVisible
        ? inset
          ? focusRingClassInset
          : focusRingClass
        : undefined,
      ...focusProps,
    },
  }
}
