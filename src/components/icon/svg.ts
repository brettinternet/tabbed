import { useEffect, useRef, useState } from 'react'

export const useSvg = (name: string) => {
  const svg = useRef<React.FC<React.SVGProps<SVGSVGElement>>>()
  const [isLoading, setLoading] = useState(true) // necessary to force rerender
  const [error, setError] = useState<Error>()

  useEffect(() => {
    const importIcon = async (): Promise<void> => {
      try {
        svg.current = (
          await import(`../../../icons/${name}.svg`)
        ).ReactComponent
      } catch (err) {
        setError(err as Error)
      }

      setLoading(false)
    }

    void importIcon()
  }, [name])

  return { error, isLoading, Svg: svg.current }
}
