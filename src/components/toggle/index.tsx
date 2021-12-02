import { Switch } from '@headlessui/react'
import cn from 'classnames'

import { Label } from 'components/label'

type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => (
  <Label className="flex items-center space-x-2">
    <Switch
      checked={checked}
      onChange={onChange}
      className={cn(
        checked ? 'bg-green-400' : 'bg-gray-200',
        'relative flex items-center h-6 rounded-full w-11'
      )}
    >
      <span className="sr-only">Enable notifications</span>
      <span
        className={cn(
          checked ? 'translate-x-6' : 'translate-x-1',
          'inline-block w-4 h-4 bg-white rounded-full transform transition ease-in-out duration-200'
        )}
      />
    </Switch>
    <div>{label}</div>
  </Label>
)
