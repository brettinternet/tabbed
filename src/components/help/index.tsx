import { Disclosure } from '@headlessui/react'
import cn from 'classnames'

import { Button } from 'components/button'
import { Icon, IconName } from 'components/icon'
import { Link } from 'components/link'
import { H2 } from 'components/markup/h2'
import { Shortcuts } from 'components/shortcuts'
import {
  bugReportUrl,
  featureRequestUrl,
  isChrome,
  newBugReportUrl,
} from 'utils/env'

import { openOptions } from './handlers'

type Faq = {
  q: React.ReactNode
  a: React.ReactNode
}

const faqs: Faq[] = [
  {
    q: 'Where can I submit feature requests?',
    a: (
      <Link href={featureRequestUrl} newWindow>
        Submit a feature request
      </Link>
    ),
  },
  {
    q: 'I found an issue. How can I report it?',
    a: (
      <>
        <Link href={newBugReportUrl} newWindow>
          Submit a ticket
        </Link>{' '}
        or{' '}
        <Link href={bugReportUrl} newWindow>
          view existing issues
        </Link>
      </>
    ),
  },
  {
    q: 'How can I view incognito/private windows?',
    a: (
      <>
        {isChrome ? (
          <>
            Enable access to incognito windows in the browser extension options.{' '}
            <Button variant="link" shape="none" onClick={openOptions}>
              Configure extension options
            </Button>
          </>
        ) : (
          "This feature may need to be enabled in the browser's extension settings."
        )}
      </>
    ),
  },
]

/**
 * TODO: deep linking to specific FAQs
 */
export const Help: React.FC = () => {
  return (
    <div className="space-y-9">
      <div className="space-y-4">
        <H2>FAQ</H2>
        <div className="w-full max-w-md p-2 mx-auto space-y-1">
          {faqs.map(({ q: question, a: answer }, index) => (
            <Disclosure key={index}>
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left rounded-lg transition-colors duration-100 text-gray-900 bg-gray-100 hover:bg-gray-200 dark:text-gray-100 dark:bg-gray-600 dark:hover:bg-gray-700">
                    <span>{question}</span>
                    <Icon
                      name={IconName.EXPAND}
                      className={cn(open && 'transform rotate-180')}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="p-3 text-sm text-gray-700 dark:text-gray-300">
                    {answer}
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <H2>Shortcuts</H2>
        <Shortcuts />
      </div>
    </div>
  )
}
