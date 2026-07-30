import { useRef, useEffect } from 'react'
import WorkflowStages from '../components/WorkflowStages'
import ExerciseContent from './ExerciseContent'
import '../styles/HomePage.css'

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

  useEffect(() => {
    if (tryingStage && exerciseRef.current) {
      exerciseRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [tryingStage])

  return (
    <div className="homepage">
      <section className="hero">
        <button className="home-title-button" type="button" onClick={onGoHome}>
          <h1>SR's Documentation Ecosystem Playground</h1>
        </button>
        <p className="hero-note">
          Every issue, comment, and pull request you create here actually exists on GitHub!
        </p>
      </section>

      <section className="workflow">
        <WorkflowStages selectedStage={tryingStage} onSelectStage={onTryStage} />
      </section>

      {tryingStage && (
        <div ref={exerciseRef}>
          <ExerciseContent
            stage={tryingStage}
            onNavigateToStage={onNavigateToStage}
            cameFromReview={cameFromReview}
          />
        </div>
      )}
    </div>
  )
}
