import { lazy, Suspense, useCallback } from 'react'
import { getStageContent } from '../data/stageContent'
import { useLocalStorage } from '../hooks'
import { STORAGE_KEYS, STAGES } from '../constants'
import StageMedia from '../components/MediaPlaceholder'
import { ErrorBoundary, ExerciseErrorFallback } from '../components/ErrorBoundary'
import '../styles/ExercisePage.css'

// Lazy load exercise components for better initial load performance
const PlanExercise = lazy(() => 
  import('../components/exercises/PlanExercise').then(m => ({ default: m.PlanExercise }))
)
const WriteExercise = lazy(() => 
  import('../components/exercises/WriteExercise').then(m => ({ default: m.WriteExercise }))
)
const ReviewExercise = lazy(() => 
  import('../components/exercises/ReviewExercise').then(m => ({ default: m.ReviewExercise }))
)
const PublishExercise = lazy(() => 
  import('../components/exercises/PublishExercise').then(m => ({ default: m.PublishExercise }))
)
const ObserveExercise = lazy(() => 
  import('../components/exercises/ObserveExercise').then(m => ({ default: m.ObserveExercise }))
)

interface ExerciseContentProps {
  stage: string
  onNavigateToStage: (stage: string, fromReviewFeedback?: boolean) => void
  cameFromReview: boolean
  onStageComplete?: (stageId: string) => void
}

function ExerciseLoadingFallback() {
  return (
    <div className="lazy-loading-fallback" role="status" aria-label="Loading exercise">
      <div className="lazy-loading-spinner" aria-hidden="true" />
      <p className="lazy-loading-text">Loading exercise...</p>
    </div>
  )
}

export default function ExerciseContent({
  stage,
  onNavigateToStage,
  cameFromReview,
  onStageComplete,
}: ExerciseContentProps) {
  const content = getStageContent(stage)
  
  const [selectedTrackId, setSelectedTrackId] = useLocalStorage(
    STORAGE_KEYS.TRACK_SELECTION,
    'quickstart'
  )

  // Force re-mount of error boundary when stage changes
  const handleErrorReset = useCallback(() => {
    window.location.reload()
  }, [])

  if (!content) {
    return null
  }

  const handleStageComplete = () => {
    onStageComplete?.(stage)
  }

  const renderExercise = () => {
    switch (stage) {
      case STAGES.PLAN:
        return (
          <PlanExercise 
            onNavigateToStage={onNavigateToStage} 
            onStageComplete={handleStageComplete}
          />
        )

      case STAGES.WRITE:
        return (
          <WriteExercise
            onNavigateToStage={onNavigateToStage}
            cameFromReview={cameFromReview}
            selectedTrackId={selectedTrackId}
            onSelectTrack={setSelectedTrackId}
            onStageComplete={handleStageComplete}
          />
        )

      case STAGES.REVIEW:
        return (
          <ReviewExercise
            onNavigateToStage={onNavigateToStage}
            selectedTrackId={selectedTrackId}
            onSelectTrack={setSelectedTrackId}
            onStageComplete={handleStageComplete}
          />
        )

      case STAGES.PUBLISH:
        return (
          <PublishExercise
            onNavigateToStage={onNavigateToStage}
            selectedTrackId={selectedTrackId}
            onSelectTrack={setSelectedTrackId}
            onStageComplete={handleStageComplete}
          />
        )

      case STAGES.OBSERVE:
        return (
          <ObserveExercise 
            onNavigateToStage={onNavigateToStage}
            onStageComplete={handleStageComplete}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="exercise-content-wrapper">
      {content.exercise.keyDecisions && (
        <section className="exercise-section" aria-labelledby="task-heading">
          <h2 id="task-heading">Your task</h2>
          <p className="scenario-text">{content.exercise.scenario}</p>
          <ul className="decisions-list" role="list">
            {content.exercise.keyDecisions.map((decision, index) => (
              <li key={index}>{decision}</li>
            ))}
          </ul>
        </section>
      )}

      <StageMedia src={content.videoSrc} label={`${content.label} stage overview`} />

      <ErrorBoundary
        resetKey={stage}
        fallback={
          <ExerciseErrorFallback 
            stageName={content.label} 
            onReset={handleErrorReset} 
          />
        }
      >
        <Suspense fallback={<ExerciseLoadingFallback />}>
          {renderExercise()}
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
