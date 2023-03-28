import { Fragment } from 'react'

import { isMac } from 'components/app/store'
import { Icon, IconName } from 'components/icon'
import { Kbd as Keyboard } from 'components/kbd'

import { Shortcut } from './store'

const Th: React.FC<React.PropsWithChildren> = ({ children }) => (
  <th className="flex items-center justify-center font-normal px-2 py-1 bg-gray-100 dark:bg-gray-700 text-center">
    {children}
  </th>
)
const Td: React.FC<React.PropsWithChildren> = ({ children }) => (
  <td className="px-2 py-1 text-gray-600 dark:text-gray-300">{children}</td>
)
const Kbd: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Keyboard className="bg-white dark:bg-gray-900 dark:border-gray-500 dark:text-gray-50 pt-1">
    {children}
  </Keyboard>
)

export const Shortcuts: React.FC = () => (
  <div className="space-y-6">
    {/* <p className="text-gray-600 dark:text-gray-300">
      This extension supports context menus. Try right clicking the extension
      icon, or right clicking over different elements on the page.
    </p> */}

    <table className="mx-auto table-auto">
      <tbody>
        <tr>
          <Th>
            {isMac ? (
              <Keyboard className="bg-white dark:bg-gray-900 dark:border-gray-500 dark:text-gray-50">
                <Icon
                  name={IconName.KEYBOARD_COMMAND}
                  ariaLabel="Command"
                  size="xs"
                  className="my-1"
                />
              </Keyboard>
            ) : (
              <Kbd>Ctrl</Kbd>
            )}{' '}
            + <Kbd>Shift</Kbd> + <Kbd>S</Kbd>
          </Th>
          <Td>Opens browser extension</Td>
        </tr>
        {Object.values(Shortcut).map(
          ({ display, description }, index) =>
            description && (
              <tr key={index}>
                <Th>
                  {display.split('+').map((key, innerIndex, arr) => (
                    <Fragment key={'key' + innerIndex}>
                      <Kbd>{key}</Kbd>
                      {innerIndex !== arr.length - 1 && ' + '}
                    </Fragment>
                  ))}
                </Th>
                <Td>{description}</Td>
              </tr>
            )
        )}
      </tbody>
    </table>
  </div>
)
