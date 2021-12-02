import cn, { Argument as ClassNames } from 'classnames'
import { forwardRef } from 'react'

import { Label } from 'components/label'
import { Valueof } from 'utils/helpers'

const Shape = {
  ROUNDED: 'rounded',
  NONE: 'none',
} as const

type ShapeType = Valueof<typeof Shape>

type InputProps = {
  label?: string
  className?: ClassNames
  shape?: ShapeType
} & React.InputHTMLAttributes<HTMLInputElement>

const getShapeClass = (shape?: ShapeType) => {
  switch (shape) {
    case Shape.ROUNDED:
      return 'rounded-lg px-2 py-1'
  }
}

export const getClass = (shape: ShapeType = Shape.ROUNDED) =>
  cn(
    'border border-gray-800 dark:bg-gray-900 dark:border-gray-500 dark:text-white',
    getShapeClass(shape)
  )

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, required, className, shape, ...props }, ref) => {
    /**
     * Filter escape key to prevent closing popup, and blur the input instead
     */
    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
      ev
    ) => {
      if (ev.key === 'Escape') {
        ev.preventDefault()
        ev.currentTarget.blur()
      }
    }

    return (
      <Label className="space-y-2">
        {label && <div>{label}</div>}
        <input
          ref={ref}
          className={cn(getClass(shape), className)}
          onKeyDown={handleKeyDown}
          required={required}
          {...props}
        />
      </Label>
    )
  }
)
