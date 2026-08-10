import { useRef, useEffect, useCallback } from 'react'
import WorkflowStages from '../components/WorkflowStages'
import ExerciseContent from './ExerciseContent'
import { OnboardingTour } from '../components/OnboardingTour'
import { StickyBreadcrumb } from '../components/Breadcrumbs'
import { getStageContent } from '../data/stageContent'
import '../styles/HomePage.css'
import '../styles/OnboardingTour.css'
import '../styles/Breadcrumbs.css'

interface HomePageProps {
  tryingStage: string | null
  onTryStage: (stage: string) => void
  onNavigateToStage: (stage: string, fromReviewFeedback?: boolean) => void
  onGoHome: () => void
  cameFromReview: boolean
}

export default function HomePage({
  tryingStage,
  onTryStage,
  onNavigateToStage,
  onGoHome,
  cameFromReview,
}: HomePageProps) {
  const exerciseRef = useRef<HTMLDivElement>(null)
  const workflowRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (tryingStage && exerciseRef.current) {
      exerciseRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [tryingStage])

  const handleGoHome = () => {
    onGoHome()
  }

  const handleScrollToTop = useCallback(() => {
    if (workflowRef.current) {
      workflowRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  const currentStageLabel = tryingStage ? (getStageContent(tryingStage)?.label || tryingStage) : ''

  return (
    <main className="homepage" id="main-content">
      <OnboardingTour />

      {tryingStage && (
        <StickyBreadcrumb
          currentStage={currentStageLabel}
          onScrollToTop={handleScrollToTop}
          workflowRef={workflowRef}
        />
      )}

      <header className="hero">
        <button 
          className="home-title-button" 
          type="button" 
          onClick={handleGoHome}
          aria-label="Return to introduction"
        >
          <h1>SR's Docs as Code Playground</h1>
        </button>
        <p className="hero-note">
          Every issue, comment, and pull request you create here are visible on GitHub
        </p>
      </header>

      <nav className="workflow" ref={workflowRef} aria-label="Workflow stages">
        <WorkflowStages selectedStage={tryingStage} onSelectStage={onTryStage} />
      </nav>

      {tryingStage && (
        <section 
          ref={exerciseRef} 
          aria-label={`${tryingStage} stage exercise`}
          className="exercise-container"
        >
          <ExerciseContent
            stage={tryingStage}
            onNavigateToStage={onNavigateToStage}
            cameFromReview={cameFromReview}
          />
        </section>
      )}
    </main>
  )
}
