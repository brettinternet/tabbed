import { useEffect, useRef, useState } from 'react'

type SvgOptions = {
  onCompleted?: (
    name: string,
    SvgIcon: React.FC<React.SVGProps<SVGSVGElement>> | undefined
  ) => void
  onError?: (err: Error) => void
}

/**
 * https://stackoverflow.com/a/61472427
 */
export const useSvg = (name: string, options: SvgOptions = {}) => {
  const ImportedIconRef = useRef<React.FC<React.SVGProps<SVGSVGElement>>>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error>()

  const { onCompleted, onError } = options
  useEffect(() => {
    const importIcon = async (): Promise<void> => {
      try {
        ImportedIconRef.current = (
          await import(`../../../icons/${name}.svg`)
        ).ReactComponent
        onCompleted?.(name, ImportedIconRef.current)
      } catch (err) {
        onError?.(err as Error)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    void importIcon()
  }, [name, onCompleted, onError])

  return { error, loading, SvgIcon: ImportedIconRef.current }
}
