import { useState } from 'react'
import IntroPage from './pages/IntroPage'
import HomePage from './pages/HomePage'

function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [tryingStage, setTryingStage] = useState<string | null>(null)
  const [cameFromReview, setCameFromReview] = useState(false)

  const handleTryStage = (stage: string) => {
    setCameFromReview(false)
    setTryingStage(stage)
  }

  const handleNavigateToStage = (stage: string, fromReviewFeedback?: boolean) => {
    setCameFromReview(!!fromReviewFeedback)
    setTryingStage(stage)
  }

  const handleGoHome = () => {
    setCameFromReview(false)
    setTryingStage(null)
  }

  if (showIntro) {
    return <IntroPage onContinue={() => setShowIntro(false)} />
  }

  return (
    <HomePage
      tryingStage={tryingStage}
      onTryStage={handleTryStage}
      onNavigateToStage={handleNavigateToStage}
      onGoHome={handleGoHome}
      cameFromReview={cameFromReview}
    />
  )
}

export default App
