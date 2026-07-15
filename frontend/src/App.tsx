import { useState } from 'react'
import HomePage from './pages/HomePage'
import ExercisePage from './pages/ExercisePage'

function App() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [exerciseStage, setExerciseStage] = useState<string | null>(null)

  const handleTryStage = (stage: string) => {
    setExerciseStage(stage)
  }

  const handleBackFromExercise = () => {
    setExerciseStage(null)
  }

  if (exerciseStage) {
    return (
      <ExercisePage
        stage={exerciseStage}
        onBack={handleBackFromExercise}
        onNavigateToStage={handleTryStage}
      />
    )
  }

  return <HomePage selectedStage={selectedStage} onSelectStage={setSelectedStage} onTryStage={handleTryStage} />
}

export default App
