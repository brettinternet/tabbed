import cn, { Argument as ClassNames } from 'classnames'
import { useState } from 'react'

type ImgProps = {
  src: string
  className?: ClassNames
  alt: string
} & React.ImgHTMLAttributes<HTMLImageElement>

export const Img: React.FC<ImgProps> = ({ src, className, alt, ...props }) => {
  const [isImageError, setImageError] = useState(false)

  const handleError: React.ReactEventHandler<HTMLImageElement> = () => {
    setImageError(true)
  }

  if (!isImageError) {
    return (
      <img
        onError={handleError}
        src={src}
        className={cn(className)}
        alt={alt}
        {...props}
      />
    )
  }

  return null
}
