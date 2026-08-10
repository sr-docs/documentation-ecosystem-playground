interface SkeletonProps {
  variant?: 'text' | 'heading' | 'block' | 'button'
  lines?: number
  className?: string
}

export function Skeleton({ variant = 'text', lines = 1, className = '' }: SkeletonProps) {
  if (variant === 'block') {
    return (
      <div 
        className={`skeleton skeleton-block ${className}`}
        aria-hidden="true"
        role="presentation"
      />
    )
  }

  if (variant === 'button') {
    return (
      <div 
        className={`skeleton ${className}`}
        style={{ height: '40px', width: '120px' }}
        aria-hidden="true"
        role="presentation"
      />
    )
  }

  if (variant === 'heading') {
    return (
      <div 
        className={`skeleton skeleton-heading ${className}`}
        aria-hidden="true"
        role="presentation"
      />
    )
  }

  return (
    <div aria-hidden="true" role="presentation" className={className}>
      {Array.from({ length: lines }, (_, i) => (
        <div 
          key={i} 
          className="skeleton skeleton-text"
          style={i === lines - 1 ? { width: '60%' } : undefined}
        />
      ))}
    </div>
  )
}

export function DraftSkeleton() {
  return (
    <div className="draft-skeleton" aria-label="Loading draft content" role="status">
      <Skeleton variant="heading" />
      <Skeleton variant="text" lines={3} />
      <Skeleton variant="heading" className="mt-4" />
      <Skeleton variant="text" lines={4} />
      <span className="sr-only">Loading the draft content...</span>
    </div>
  )
}

export function HistorySkeleton() {
  return (
    <div className="history-skeleton" aria-label="Loading history" role="status">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="history-item-skeleton">
          <Skeleton variant="text" />
          <Skeleton variant="text" lines={1} />
        </div>
      ))}
      <span className="sr-only">Loading publish history...</span>
    </div>
  )
}
