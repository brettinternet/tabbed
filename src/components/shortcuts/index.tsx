import { Fragment } from 'react'

import { isMac } from 'components/app/store'
import { Kbd as Keyboard } from 'components/kbd'

import { Shortcut } from './store'

const Th: React.FC = ({ children }) => (
  <th className="font-normal px-2 py-1 bg-gray-100 dark:bg-gray-700 text-center">
    {children}
  </th>
)
const Td: React.FC = ({ children }) => (
  <td className="px-2 py-1 text-gray-600 dark:text-gray-300">{children}</td>
)
const Kbd: React.FC = ({ children }) => (
  <Keyboard className="bg-white dark:bg-gray-900 dark:border-gray-500 dark:text-gray-50">
    {children}
  </Keyboard>
)

export const Shortcuts: React.FC = () => (
  <div className="overflow-y-auto scroll space-y-6">
    {/* <p className="text-gray-600 dark:text-gray-300">
      This extension supports context menus. Try right clicking the extension
      icon, or right clicking over different elements on the page.
    </p> */}

    <table className="mx-auto table-auto">
      <tbody>
        <tr>
          <Th>
            {isMac ? <Kbd>Cmd</Kbd> : <Kbd>Ctrl</Kbd>} + <Kbd>Shift</Kbd> +{' '}
            <Kbd>S</Kbd>
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
