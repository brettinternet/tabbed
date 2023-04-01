import { useEffect } from 'react'

const version = BUILD_VERSION || (!IS_PROD && 'dev')

type HeadProps = {
  title: string
}

export const Head: React.FC<HeadProps> = ({ title }) => {
  useEffect(() => {
    document.title = title
    if (version) {
      document.documentElement.dataset.version = version
    }
    document.documentElement.dataset.time = BUILD_TIME
  }, [title])

  return null
}
