import { useEffect, useRef } from 'react'

export type StatusType = 'loading' | 'success' | 'error' | 'info'

interface StatusMessageProps {
  type: StatusType
  message: string
  className?: string
  children?: React.ReactNode
}

export function StatusMessage({ type, message, className = '', children }: StatusMessageProps) {
  const messageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (type === 'success' || type === 'error') {
      messageRef.current?.focus()
    }
  }, [message, type])

  return (
    <div
      ref={messageRef}
      className={`status-message status-${type} ${className}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      tabIndex={-1}
    >
      {message && <p>{message}</p>}
      {children}
    </div>
  )
}

interface LoadingStatusProps {
  message: string
}

export function LoadingStatus({ message }: LoadingStatusProps) {
  return (
    <p className="status-message status-loading" role="status" aria-live="polite">
      <span className="sr-only">Loading: </span>
      {message}
    </p>
  )
}

interface ErrorStatusProps {
  message: string
  onRetry?: () => void
}

export function ErrorStatus({ message, onRetry }: ErrorStatusProps) {
  return (
    <div className="status-message status-error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          className="retry-button"
          onClick={onRetry}
          aria-label="Try again"
        >
          Try again
        </button>
      )}
    </div>
  )
}

interface SuccessStatusProps {
  message: string
  linkUrl?: string
  linkText?: string
  children?: React.ReactNode
}

export function SuccessStatus({ message, linkUrl, linkText, children }: SuccessStatusProps) {
  return (
    <div className="status-message status-success" role="status" aria-live="polite">
      <p>
        {message}{' '}
        {linkUrl && (
          <a href={linkUrl} target="_blank" rel="noreferrer">
            {linkText || 'View on GitHub'}
          </a>
        )}
      </p>
      {children}
    </div>
  )
}
