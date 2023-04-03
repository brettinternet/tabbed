import { Fragment } from 'react'

import { isMac } from 'components/app/store'
import { Icon, IconName } from 'components/icon'
import { Kbd as Keyboard } from 'components/kbd'

import { Shortcut as GlobalShortcuts, ShortcutsMap } from './global'
import { Shortcuts as SessionShortcuts } from './sessions'

const Section: React.FC<React.PropsWithChildren> = ({ children }) => (
  <section className="">{children}</section>
)

const H1: React.FC<React.PropsWithChildren> = ({ children }) => (
  <h1 className="text-lg my-2">{children}</h1>
)

const Table: React.FC<React.PropsWithChildren> = ({ children }) => (
  <table className="mx-auto table-auto w-full bg-gray-50 dark:bg-gray-800 rounded">
    {children}
  </table>
)

const Th: React.FC<React.PropsWithChildren> = ({ children }) => (
  <th className="px-2 py-1 text-gray-800 dark:text-gray-300 text-left font-medium">
    {children}
  </th>
)

const Td: React.FC<React.PropsWithChildren> = ({ children }) => (
  <td className="flex items-center justify-end font-normal px-2 py-1">
    {children}
  </td>
)

const Kbd: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Keyboard className="bg-white dark:bg-gray-900 dark:border-gray-500 dark:text-gray-50">
    {children}
  </Keyboard>
)

const renderShortcuts = (shortcuts: ShortcutsMap) =>
  Object.values(shortcuts).map(
    ({ display, description }, index) =>
      description && (
        <tr key={index}>
          <Th>{description}</Th>
          <Td>
            {display.split('+').map((key, innerIndex, arr) => (
              <Fragment key={'key' + innerIndex}>
                <Kbd>{key}</Kbd>
                {innerIndex !== arr.length - 1 && ' + '}
              </Fragment>
            ))}
          </Td>
        </tr>
      )
  )

export const Shortcuts: React.FC = () => (
  <div className="space-y-6">
    {/* <p className="text-gray-600 dark:text-gray-300">
      This extension supports context menus. Try right clicking the extension
      icon, or right clicking over different elements on the page.
    </p> */}

    <Section>
      <H1>Browser</H1>
      <Table>
        <tbody>
          <tr>
            <Th>Opens browser extension</Th>
            <Td>
              {isMac ? (
                <Kbd>
                  <Icon
                    name={IconName.KEYBOARD_COMMAND}
                    ariaLabel="Command"
                    size="xs"
                  />
                </Kbd>
              ) : (
                <Kbd>Ctrl</Kbd>
              )}{' '}
              + <Kbd>Shift</Kbd> + <Kbd>S</Kbd>
            </Td>
          </tr>
        </tbody>
      </Table>
    </Section>

    <Section>
      <H1>Extension</H1>
      <Table>
        <tbody>{renderShortcuts(GlobalShortcuts)}</tbody>
      </Table>
    </Section>

    <Section>
      <H1>Sessions</H1>
      <Table>
        <tbody>
          <tr>
            <Th>Arrow keys to select windows or tabs</Th>
            <Td>
              <Kbd>←</Kbd>
              <Kbd>↑</Kbd>
              <Kbd>→</Kbd>
              <Kbd>↓</Kbd>
            </Td>
          </tr>
          <tr>
            <Th>Pick up or drop to move an item</Th>
            <Td>
              <Kbd>Space</Kbd>
            </Td>
          </tr>
          <tr>
            <Th>Focus on window or tab action buttons</Th>
            <Td>
              <Kbd>Tab</Kbd>
            </Td>
          </tr>
          {renderShortcuts(SessionShortcuts)}
        </tbody>
      </Table>
    </Section>
  </div>
)
