import cn, { Argument as ClassNames } from 'classnames'
import { useState } from 'react'

/**
 * Derives initials from url domain
 */
const getInitials = (src: string) => {
  const urlObj = new URL(src)
  const domain = urlObj.hostname.split('.').slice(-2).join('.')
  return domain.charAt(0).toUpperCase() + domain.charAt(1)
}

type ImgProps = {
  src?: string
  className?: ClassNames
  alt: string
  /**
   * Used to derive the initials
   */
  url: string
} & React.ImgHTMLAttributes<HTMLImageElement>

export const Img: React.FC<ImgProps> = ({
  src,
  className,
  alt,
  url,
  ...props
}) => {
  const [isImageError, setImageError] = useState(false)

  const handleError: React.ReactEventHandler<HTMLImageElement> = () => {
    setImageError(true)
  }

  if (src && !isImageError) {
    return (
      <img
        onError={handleError}
        src={src}
        className={cn('w-8 h-8 min-w-min overflow-hidden', className)}
        alt={alt}
        {...props}
      />
    )
  }

  return (
    <div
      className={cn(
        'w-8 h-8 min-w-min overflow-hidden rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-700',
        className
      )}
    >
      <span className="block">{getInitials(url)}</span>
    </div>
  )
}
