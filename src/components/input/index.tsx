import cn, { Argument as ClassNames } from 'classnames'
import { forwardRef } from 'react'

import { Label } from 'components/label'

type InputProps = {
  label?: string
  className?: ClassNames
} & React.InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, required, className, ...props }, ref) => {
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
      <Label text={label} required={required}>
        <input
          ref={ref}
          className={cn(
            'rounded-lg border border-gray-800 px-2 py-1 dark:bg-gray-900 dark:border-gray-500 dark:text-white',
            className
          )}
          onKeyDown={handleKeyDown}
          required={required}
          {...props}
        />
      </Label>
    )
  }
)
