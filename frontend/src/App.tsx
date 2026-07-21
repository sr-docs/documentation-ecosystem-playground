import { useState } from 'react'
import HomePage from './pages/HomePage'

function App() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [tryingStage, setTryingStage] = useState<string | null>(null)
  const [cameFromReview, setCameFromReview] = useState(false)

  const handleSelectStage = (stage: string | null) => {
  setSelectedStage(stage)
  setTryingStage(null)
  setCameFromReview(false)
}

  const handleTryStage = (stage: string) => {
    setCameFromReview(false)
    setSelectedStage(stage)
    setTryingStage(stage)
  }

  const handleNavigateToStage = (stage: string, fromReviewFeedback?: boolean) => {
    setCameFromReview(!!fromReviewFeedback)
    setSelectedStage(stage)
    setTryingStage(stage)
  }

  return (
    <HomePage
      selectedStage={selectedStage}
      onSelectStage={handleSelectStage}
      tryingStage={tryingStage}
      onTryStage={handleTryStage}
      onNavigateToStage={handleNavigateToStage}
      cameFromReview={cameFromReview}
    />
  )
}

export default App
