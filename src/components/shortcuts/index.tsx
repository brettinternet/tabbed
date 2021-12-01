import { Kbd as Keyboard } from 'components/kbd'

import { Shortcut } from './store'

const Th: React.FC = ({ children }) => (
  <th className="font-normal px-2 py-1 bg-gray-100 text-center">{children}</th>
)
const Td: React.FC = ({ children }) => (
  <td className="px-2 py-1 text-gray-600 dark:text-gray-300">{children}</td>
)
const Kbd: React.FC = ({ children }) => (
  <Keyboard className="bg-white dark:bg-gray-700 dark:border-gray-500 dark:text-gray-50">
    {children}
  </Keyboard>
)

export const Shortcuts: React.FC = () => (
  <div className="overflow-y-auto scroll">
    <p className="mb-3 text-gray-600 dark:text-gray-300">
      This extension supports context menus. Try right clicking the extension
      icon, or right clicking over different elements on the page.
    </p>

    <table className="mx-auto table-auto">
      <tbody>
        <tr>
          <Th>
            <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>S</Kbd>
          </Th>
          <Td>Opens browser extension</Td>
        </tr>
        {Object.values(Shortcut).map(
          ({ display, description }, index) =>
            description && (
              <tr key={index}>
                <Th>
                  {display.split('+').map((key) => (
                    <Kbd key={key}>{key}</Kbd>
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
