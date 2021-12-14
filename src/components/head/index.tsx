import { useEffect } from 'react'

import { isProd, buildTime, buildVersion } from 'utils/env'

const version = buildVersion || (!isProd && 'dev')

type HeadProps = {
  title: string
}

export const Head: React.FC<HeadProps> = ({ title }) => {
  useEffect(() => {
    document.title = title
    if (version) {
      document.documentElement.dataset.version = version
    }
    document.documentElement.dataset.time = buildTime
  }, [title])

  return null
}
