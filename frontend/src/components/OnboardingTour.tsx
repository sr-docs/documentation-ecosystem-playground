import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLocalStorage } from '../hooks'
import { STORAGE_KEYS } from '../constants'

const VIEWPORT_PADDING = 16
const TOOLTIP_MAX_WIDTH = 420

interface TourStep {
  id: string
  title: string
  description: string
  targetSelector?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Docs-as-Code Playground',
    description: 'This interactive portfolio shows how documentation moves through the same workflow as code. Let me show you around.',
  },
  {
    id: 'plan',
    title: 'PLAN: Define the Ask',
    description: 'Every documentation project starts with a plan. Define what you\'re writing, who it\'s for, and how you\'ll measure success.',
    targetSelector: '[data-stage="PLAN"]',
    position: 'bottom',
  },
  {
    id: 'write',
    title: 'WRITE: Draft It',
    description: 'Create your documentation draft. You\'ll find real bugs to fix in the sample drafts provided.',
    targetSelector: '[data-stage="WRITE"]',
    position: 'bottom',
  },
  {
    id: 'review',
    title: 'REVIEW: Check It',
    description: 'Review drafts against reference material. Leave comments and approve or request changes.',
    targetSelector: '[data-stage="REVIEW"]',
    position: 'bottom',
  },
  {
    id: 'publish',
    title: 'PUBLISH: Ship It',
    description: 'Run automated checks and publish your documentation. See what passes and what needs fixing.',
    targetSelector: '[data-stage="PUBLISH"]',
    position: 'bottom',
  },
  {
    id: 'observe',
    title: 'OBSERVE: Learn From It',
    description: 'Review the publish history, identify patterns, and file issues for future improvements.',
    targetSelector: '[data-stage="OBSERVE"]',
    position: 'bottom',
  },
  {
    id: 'github',
    title: 'Real GitHub Integration',
    description: 'Issues, comments, and pull requests you create here actually exist on GitHub. Click any stage to try it out!',
  },
]

interface OnboardingTourProps {
  onComplete?: () => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

/** Position tooltip by top-left corner (no translate centering). */
function getTooltipPosition(
  targetRect: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number
): { top: number; left: number; width: number } {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const width = Math.min(tooltipWidth, vw - VIEWPORT_PADDING * 2)

  const preferredLeft = targetRect.left + targetRect.width / 2 - width / 2
  const left = clamp(preferredLeft, VIEWPORT_PADDING, vw - width - VIEWPORT_PADDING)

  const spaceBelow = vh - targetRect.bottom - VIEWPORT_PADDING
  const spaceAbove = targetRect.top - VIEWPORT_PADDING
  let top: number

  if (spaceBelow >= tooltipHeight + 16 || spaceBelow >= spaceAbove) {
    top = targetRect.bottom + 16
    top = clamp(top, VIEWPORT_PADDING, Math.max(VIEWPORT_PADDING, vh - tooltipHeight - VIEWPORT_PADDING))
  } else {
    top = targetRect.top - tooltipHeight - 16
    top = clamp(top, VIEWPORT_PADDING, Math.max(VIEWPORT_PADDING, vh - tooltipHeight - VIEWPORT_PADDING))
  }

  return { top, left, width }
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [hasSeenTour, setHasSeenTour] = useLocalStorage(
    STORAGE_KEYS.TRACK_SELECTION + '-tour-seen',
    false
  )
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [tooltipSize, setTooltipSize] = useState({ width: TOOLTIP_MAX_WIDTH, height: 232 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsOpen(true), 500)
      return () => clearTimeout(timer)
    }
  }, [hasSeenTour])

  const updateTargetRect = useCallback(() => {
    if (!isOpen) return

    const step = TOUR_STEPS[currentStep]
    if (step.targetSelector) {
      const target = document.querySelector(step.targetSelector)
      if (target) {
        setTargetRect(target.getBoundingClientRect())
      } else {
        setTargetRect(null)
      }
    } else {
      setTargetRect(null)
    }
  }, [currentStep, isOpen])

  useEffect(() => {
    if (!isOpen) return

    const step = TOUR_STEPS[currentStep]
    if (step.targetSelector) {
      const target = document.querySelector(step.targetSelector)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        const timer = window.setTimeout(updateTargetRect, 350)
        updateTargetRect()
        return () => window.clearTimeout(timer)
      }
    }
    setTargetRect(null)
  }, [currentStep, isOpen, updateTargetRect])

  useEffect(() => {
    if (!isOpen) return

    window.addEventListener('resize', updateTargetRect)
    window.addEventListener('scroll', updateTargetRect, true)
    return () => {
      window.removeEventListener('resize', updateTargetRect)
      window.removeEventListener('scroll', updateTargetRect, true)
    }
  }, [isOpen, updateTargetRect])

  useLayoutEffect(() => {
    if (!isOpen || !tooltipRef.current) return

    // Measure untransformed box; ignore translate from any leftover CSS
    const node = tooltipRef.current
    const width = Math.min(
      Math.max(node.offsetWidth, 1),
      window.innerWidth - VIEWPORT_PADDING * 2
    )
    const height = Math.max(node.offsetHeight, 1)
    setTooltipSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height }
    )
  }, [isOpen, currentStep, targetRect])

  const handleComplete = useCallback(() => {
    setIsOpen(false)
    setHasSeenTour(true)
    onComplete?.()
  }, [setHasSeenTour, onComplete])

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((step) => step + 1)
    } else {
      handleComplete()
    }
  }, [currentStep, handleComplete])

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1)
    }
  }, [currentStep])

  const handleSkip = useCallback(() => {
    setIsOpen(false)
    setHasSeenTour(true)
    onComplete?.()
  }, [setHasSeenTour, onComplete])

  const handleRestart = useCallback(() => {
    setCurrentStep(0)
    setIsOpen(true)
  }, [])

  if (!isOpen) {
    return (
      <button
        type="button"
        className="tour-restart-button"
        onClick={handleRestart}
        aria-label="Restart tour"
        title="Take the tour"
      >
        ?
      </button>
    )
  }

  const step = TOUR_STEPS[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === TOUR_STEPS.length - 1
  const isPositioned = Boolean(targetRect)

  const positioned = targetRect
    ? getTooltipPosition(targetRect, tooltipSize.width, tooltipSize.height)
    : null

  const tourUi = (
    <>
      <div className="tour-overlay" onClick={handleSkip} aria-hidden="true" />

      {targetRect && (
        <div
          className="tour-spotlight"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
          aria-hidden="true"
        />
      )}

      <div
        ref={tooltipRef}
        className={`tour-tooltip ${isPositioned ? 'tour-tooltip-positioned' : 'tour-tooltip-centered'}`}
        style={
          isPositioned && positioned
            ? {
                top: positioned.top,
                left: positioned.left,
                width: positioned.width,
                maxWidth: `min(${TOOLTIP_MAX_WIDTH}px, calc(100vw - ${VIEWPORT_PADDING * 2}px))`,
                transform: 'none',
              }
            : undefined
        }
        role="dialog"
        aria-labelledby="tour-title"
        aria-describedby="tour-description"
      >
        <div className="tour-progress">
          Step {currentStep + 1} of {TOUR_STEPS.length}
        </div>

        <h3 id="tour-title" className="tour-title">{step.title}</h3>
        <p id="tour-description" className="tour-description">{step.description}</p>

        <div className="tour-actions">
          <button
            type="button"
            className="tour-button tour-button-skip"
            onClick={handleSkip}
          >
            Skip tour
          </button>

          <div className="tour-nav">
            {!isFirstStep && (
              <button
                type="button"
                className="tour-button tour-button-secondary"
                onClick={handlePrevious}
              >
                Back
              </button>
            )}
            <button
              type="button"
              className="tour-button tour-button-primary"
              onClick={handleNext}
            >
              {isLastStep ? 'Get started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return createPortal(tourUi, document.body)
}
