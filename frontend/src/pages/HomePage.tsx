import { useRef, useEffect } from 'react'
import WorkflowStages from '../components/WorkflowStages'
import ContextPanel from '../components/ContextPanel'
import ExerciseContent from './ExerciseContent'
import '../styles/HomePage.css'

interface HomePageProps {
  selectedStage: string | null
  onSelectStage: (stage: string | null) => void
  tryingStage: string | null
  onTryStage: (stage: string) => void
  onNavigateToStage: (stage: string, fromReviewFeedback?: boolean) => void
  cameFromReview: boolean
}

export default function HomePage({
  selectedStage,
  onSelectStage,
  tryingStage,
  onTryStage,
  onNavigateToStage,
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
        <h1>Documentation Ecosystem Playground</h1>
        <p>Write, review, and ship real documentation, the way engineering teams actually do it.</p>
        <p className="hero-note">
          This is real. Every issue, comment, and pull request you create here actually exists on GitHub.
        </p>
      </section>

      <section className="workflow">
        <WorkflowStages selectedStage={selectedStage} onSelectStage={onSelectStage} />
      </section>

      <section className="context">
        <ContextPanel selectedStage={selectedStage} onTryStage={onTryStage} />
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
