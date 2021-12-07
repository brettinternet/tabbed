import cn, { Argument as ClassNames } from 'classnames'
import { useState } from 'react'

type ImgProps = {
  src?: string
  className?: ClassNames
} & React.ImgHTMLAttributes<HTMLImageElement>

export const Img: React.FC<ImgProps> = ({ src, className, ...props }) => {
  const [isImageError, setImageError] = useState(false)

  const handleError: React.ReactEventHandler<HTMLImageElement> = () => {
    setImageError(true)
  }

  if (src && !isImageError) {
    return (
      <img
        onError={handleError}
        src={src}
        className={cn(className)}
        {...props}
      />
    )
  }

  return null
}
