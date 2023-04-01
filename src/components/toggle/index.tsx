import { Switch } from '@headlessui/react'
import cn from 'classnames'

import { Label } from 'components/label'

type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  'aria-describedby'?: string
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  'aria-describedby': ariaDescribedby,
}) => (
  <Label
    className="flex items-center space-x-2"
    aria-describedby={ariaDescribedby}
  >
    <Switch
      checked={checked}
      onChange={onChange}
      className={cn(
        checked
          ? 'bg-green-400 dark:bg-green-600'
          : 'bg-gray-200 dark:bg-gray-700',
        'relative flex items-center h-6 rounded-full w-11'
      )}
    >
      <span className="sr-only">{label}</span>
      <span
        className={cn(
          checked ? 'translate-x-6' : 'translate-x-1',
          'inline-block w-4 h-4 bg-white dark:bg-gray-300 rounded-full transform transition ease-in-out duration-200'
        )}
      />
    </Switch>
    <div>{label}</div>
  </Label>
)
