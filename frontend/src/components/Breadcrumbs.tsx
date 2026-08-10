import { useState, useEffect } from 'react'
import '../styles/Breadcrumbs.css'

interface StickyBreadcrumbProps {
  currentStage: string
  onScrollToTop: () => void
  workflowRef: React.RefObject<HTMLElement>
}

export function StickyBreadcrumb({ currentStage, onScrollToTop, workflowRef }: StickyBreadcrumbProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (workflowRef.current) {
        const rect = workflowRef.current.getBoundingClientRect()
        const isWorkflowOutOfView = rect.bottom < 0
        setIsVisible(isWorkflowOutOfView)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [workflowRef])

  if (!isVisible) return null

  return (
    <nav className="breadcrumbs breadcrumbs-sticky" aria-label="Quick navigation">
      <ol className="breadcrumbs-list">
        <li className="breadcrumb-item">
          <button
            type="button"
            className="breadcrumb-link"
            onClick={onScrollToTop}
          >
            ↑ Top
          </button>
          <span className="breadcrumb-separator" aria-hidden="true">›</span>
        </li>
        <li className="breadcrumb-item">
          <span className="breadcrumb-current" aria-current="page">
            {currentStage}
          </span>
        </li>
      </ol>
    </nav>
  )
}

interface BreadcrumbItem {
  label: string
  onClick?: () => void
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb navigation">
      <ol className="breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          
          return (
            <li key={index} className="breadcrumb-item">
              {item.onClick && !isLast ? (
                <button
                  type="button"
                  className="breadcrumb-link"
                  onClick={item.onClick}
                >
                  {item.label}
                </button>
              ) : (
                <span
                  className={isLast ? 'breadcrumb-current' : 'breadcrumb-text'}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className="breadcrumb-separator" aria-hidden="true">
                  ›
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
