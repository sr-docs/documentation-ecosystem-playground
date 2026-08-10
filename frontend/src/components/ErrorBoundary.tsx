import { Component, type ReactNode, type ErrorInfo } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetKey?: string | number
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary component that catches JavaScript errors in child components.
 * Prevents the entire app from crashing when a single component fails.
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null })
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback 
          error={this.state.error} 
          onReset={this.handleReset} 
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error | null
  onReset: () => void
  title?: string
}

/**
 * Default fallback UI shown when an error is caught.
 * Can be used standalone or as a custom fallback for ErrorBoundary.
 */
export function ErrorFallback({ 
  error, 
  onReset, 
  title = 'Something went wrong' 
}: ErrorFallbackProps) {
  return (
    <div className="error-fallback" role="alert">
      <div className="error-fallback-content">
        <h2 className="error-fallback-title">{title}</h2>
        <p className="error-fallback-message">
          An unexpected error occurred. You can try again or refresh the page.
        </p>
        {error && (
          <details className="error-fallback-details">
            <summary>Error details</summary>
            <pre className="error-fallback-stack">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
        <div className="error-fallback-actions">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={onReset}
          >
            Try again
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => window.location.reload()}
          >
            Refresh page
          </button>
        </div>
      </div>
    </div>
  )
}

interface ExerciseErrorFallbackProps {
  stageName: string
  onReset: () => void
}

/**
 * Specialized error fallback for exercise components.
 * Offers stage-specific messaging and recovery options.
 */
export function ExerciseErrorFallback({ stageName, onReset }: ExerciseErrorFallbackProps) {
  return (
    <div className="error-fallback error-fallback-exercise" role="alert">
      <div className="error-fallback-content">
        <h2 className="error-fallback-title">
          {stageName} exercise encountered an error
        </h2>
        <p className="error-fallback-message">
          Something went wrong while loading this exercise. Your draft changes are saved locally and won't be lost.
        </p>
        <div className="error-fallback-actions">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={onReset}
          >
            Reload exercise
          </button>
        </div>
      </div>
    </div>
  )
}
