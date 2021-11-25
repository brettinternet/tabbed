import { useEffect } from 'react'

type HeadProps = {
  title: string
}

export const Head: React.FC<HeadProps> = ({ title }) => {
  useEffect(() => {
    document.title = title
  }, [title])

  return null
}
