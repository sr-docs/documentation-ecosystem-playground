import WorkflowGrid from '../components/WorkflowGrid'
import ContextPanel from '../components/ContextPanel'
import '../styles/HomePage.css'

export default function HomePage() {
  return (
    <div className="homepage">
      <header className="title-area">
        <h1>Documentation Ecosystem Portfolio</h1>
        <p>Learn the design, automation, and operation of doc ecosystems</p>
      </header>

      <main className="content">
        <WorkflowGrid />
        <ContextPanel />
      </main>
    </div>
  )
}
