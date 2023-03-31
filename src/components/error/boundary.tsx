import React, { ErrorInfo } from 'react'

import { Message, MessageVariant } from 'components/message'
import { log } from 'utils/logger'

type ErrorBoundaryState = {
  hasError: boolean
  errorMessage: string
}

type ErrorBoundaryProps = React.PropsWithChildren<{
  /**
   * Error message title (leave empty for no message)
   */
  defaultMessage?: React.ReactNode
  /**
   * Whether to show the message from the caught error
   */
  showErrorMessage?: boolean
  /**
   * onError function handler to be invoked in componentDidCatch
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /**
   * Force error state to show the defaultMessage
   */
  hasError?: boolean
}>

/**
 * @note https://reactjs.org/docs/hooks-faq.html#do-hooks-cover-all-use-cases-for-classes
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      errorMessage: '',
    }
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      errorMessage: error.message,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    log.error(error)
    const { onError } = this.props
    if (typeof onError === 'function') {
      try {
        onError.call(this, error, errorInfo)
      } catch (_ignoredError) {}
    }
  }

  render() {
    const {
      children,
      defaultMessage,
      showErrorMessage,
      hasError: forceHasError,
    } = this.props
    const { hasError, errorMessage } = this.state

    if (hasError || forceHasError) {
      return defaultMessage || (showErrorMessage && errorMessage) ? (
        <section className="p-1 space-y-3">
          <Message variant={MessageVariant.ERROR} className="space-y-2">
            <b>Error</b>
            {defaultMessage && <p>{defaultMessage}</p>}
            {showErrorMessage && errorMessage && <p>{errorMessage}</p>}
          </Message>
        </section>
      ) : null
    }

    return children
  }
}

export const withErrorBoundary = <T extends {}>(
  Component: React.ComponentType<T>,
  errorBoundaryProps?: ErrorBoundaryProps
): React.FC<T> => {
  const Wrapped = (props: T) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  /**
   * Format for display in DevTools
   * https://reactjs.org/docs/error-boundaries.html#component-stack-traces
   */
  const name = Component.displayName || Component.name
  Wrapped.displayName = name
    ? `WithErrorBoundary(${name})`
    : 'WithErrorBoundary'

  return Wrapped
}
