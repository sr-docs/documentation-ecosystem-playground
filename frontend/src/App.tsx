import { useState } from 'react'
import HomePage from './pages/HomePage'

function App() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null)

  return <HomePage selectedStage={selectedStage} onSelectStage={setSelectedStage} />
}

export default App
