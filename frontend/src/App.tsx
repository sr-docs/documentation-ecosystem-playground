import { useState } from 'react'
import HomePage from './pages/HomePage'
import ExercisePage from './pages/ExercisePage'

function App() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [exerciseStage, setExerciseStage] = useState<string | null>(null)
  const [cameFromReview, setCameFromReview] = useState(false)

  const handleTryStage = (stage: string) => {
    setCameFromReview(false)
    setExerciseStage(stage)
  }

  const handleNavigateFromReview = (stage: string) => {
    setCameFromReview(stage === 'WRITE')
    setExerciseStage(stage)
  }

  const handleBackFromExercise = () => {
    setCameFromReview(false)
    setExerciseStage(null)
  }

  if (exerciseStage) {
    return (
      <ExercisePage
        stage={exerciseStage}
        onBack={handleBackFromExercise}
        onNavigateToStage={handleNavigateFromReview}
        cameFromReview={cameFromReview}
      />
    )
  }

  return <HomePage selectedStage={selectedStage} onSelectStage={setSelectedStage} onTryStage={handleTryStage} />
}

export default App
