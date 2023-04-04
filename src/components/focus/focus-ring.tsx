import {
  FocusRing as TemplateFocusRing,
  FocusRingProps as TemplateFocusRingProps,
  useFocusRing as useTemplateFocusRing,
} from '@react-aria/focus'

import { focusRingClass, focusRingClassInset } from './constants'
import { useAllowFocusRing } from './store'

type CustomFocusRingProps = {
  inset?: boolean
  disabled?: boolean
}

type FocusRingProps = TemplateFocusRingProps & CustomFocusRingProps

export const FocusRing: React.FC<FocusRingProps> = ({
  children,
  inset,
  disabled,
  ...props
}) => {
  const [allow] = useAllowFocusRing()
  return (
    <TemplateFocusRing
      focusClass="outline-none"
      focusRingClass={
        allow && !disabled
          ? inset
            ? focusRingClassInset
            : focusRingClass
          : undefined
      }
      {...props}
    >
      {children}
    </TemplateFocusRing>
  )
}

export const useFocusRing = ({
  inset,
  disabled,
}: CustomFocusRingProps = {}) => {
  const { isFocusVisible, focusProps } = useTemplateFocusRing()
  const [isAllowFocusRing, setAllowFocusRing] = useAllowFocusRing()
  return {
    isFocusVisible: isFocusVisible && isAllowFocusRing,
    setAllowFocusRing,
    focusProps: {
      className:
        isFocusVisible && !disabled
          ? inset
            ? focusRingClassInset
            : focusRingClass
          : undefined,
      ...focusProps,
    },
  }
}
