import WorkflowStages from '../components/WorkflowStages'
import ContextPanel from '../components/ContextPanel'
import '../styles/HomePage.css'

interface HomePageProps {
  selectedStage: string | null
  onSelectStage: (stage: string | null) => void
  onTryStage: (stage: string) => void
}

export default function HomePage({ selectedStage, onSelectStage, onTryStage }: HomePageProps) {
  return (
    <div className="homepage">
      <section className="hero">
        <h1>Documentation Ecosystem Playground</h1>
        <p>Explore how documentation moves through a modern system.</p>
      </section>

      <section className="workflow">
        <WorkflowStages selectedStage={selectedStage} onSelectStage={onSelectStage} />
      </section>

      <section className="context">
        <ContextPanel selectedStage={selectedStage} onTryStage={onTryStage} />
      </section>
    </div>
  )
}
