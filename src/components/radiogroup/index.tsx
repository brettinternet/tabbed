import { RadioGroup as RG } from '@headlessui/react'
import cn, { Argument as ClassNames } from 'classnames'

import { Icon, IconName } from 'components/icon'
import { Label } from 'components/label'

export type RadioOption = {
  name: string
  value: unknown
  description?: React.ReactNode
  className?: ClassNames
}

type RadioGroupProps<T extends RadioOption = RadioOption> = {
  options: T[]
  value: string
  onChange: (option: T['value']) => void
  label?: string
  className?: ClassNames
  optionsListClassName?: ClassNames
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  label,
  className,
  optionsListClassName,
}) => (
  <div className={cn('w-full', className)}>
    <div className="w-full">
      <RG value={value} onChange={onChange} className="space-y-3">
        {label && <Label as="legend">{label}</Label>}
        <div className={cn(optionsListClassName || 'space-y-2')}>
          {options.map(({ name, value, description, className }) => (
            <RG.Option
              key={name}
              value={value}
              className={({ active, checked }) =>
                cn(
                  'relative rounded-lg px-5 py-4 cursor-pointer border flex transition-colors duration-100',
                  // active &&
                  // 'ring-2 ring-offset-2 ring-offset-blue-300 ring-white ring-opacity-60',
                  checked
                    ? 'bg-opacity-75 text-white bg-green-500 border-transparent'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-100 dark:border-gray-500',
                  className
                )
              }
            >
              {({ checked }) => (
                <div className="flex items-center justify-between w-full flex-row-reverse">
                  <div className="flex items-center ml-2">
                    <div className="text-sm">
                      <RG.Label
                        as="p"
                        className={cn(
                          'font-medium',
                          checked
                            ? 'text-white'
                            : 'text-gray-900 dark:text-gray-100'
                        )}
                      >
                        {name}
                      </RG.Label>
                      {description && (
                        <RG.Description
                          as="span"
                          className={cn(
                            'inline',
                            checked ? 'text-blue-100' : 'text-gray-500'
                          )}
                        >
                          {description}
                        </RG.Description>
                      )}
                    </div>
                  </div>
                  {checked ? (
                    <div className="flex-shrink-0 text-white bg-green-300 rounded-full p-1">
                      <Icon name={IconName.CHECK} size="sm" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-gray-300 dark:border-gray-500" />
                  )}
                </div>
              )}
            </RG.Option>
          ))}
        </div>
      </RG>
    </div>
  </div>
)
