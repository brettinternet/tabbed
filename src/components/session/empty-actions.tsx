import browser from 'webextension-polyfill'

import { Button } from 'components/button'

export const EmptyActions: React.FC = () => (
  <div className="hidden md:flex md:flex-col md:items-center md:justify-center pb-3 md:pb-0 md:w-80 md:min-w-[20rem] bg-gray-100 dark:bg-gray-900 snap-end">
    <div className="flex">
      <Button
        className="pl-4 pr-3 py-1 rounded-tl-full rounded-bl-full"
        variant="primary"
        shape="none"
        onClick={() => {
          browser.windows.create()
        }}
      >
        New window
      </Button>
      <Button
        className="ml-0.5 pr-4 pl-3 py-1 rounded-tr-full rounded-br-full"
        variant="primary"
        shape="none"
        onClick={() => {
          browser.windows.create({
            incognito: true,
          })
        }}
        iconProps={{ name: 'minus-circle', size: 'sm' }}
        aria-label="New incognito window"
      />
    </div>
  </div>
)
