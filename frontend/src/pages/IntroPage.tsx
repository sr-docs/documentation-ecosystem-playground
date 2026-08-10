import StageMedia from '../components/MediaPlaceholder'
import '../styles/IntroPage.css'

interface IntroPageProps {
  onContinue: () => void
}

export default function IntroPage({ onContinue }: IntroPageProps) {
  return (
    <main className="intro-page" id="main-content">
      <div className="intro-content">
        <div className="intro-media">
          <StageMedia src="media/intro/intro.mp4" label="Introduction to the docs-as-code workflow" />
        </div>

        <h1>Great software needs documentation that keeps up</h1>

        <p>
          I build documentation workflows that ship with every release, accurate and up-to-date.
        </p>
        <p>
          In this interactive portfolio, explore a GitHub-based workflow where documentation moves like code: issues for planning, pull requests for drafts, reviews for feedback, and GitHub Actions for publishing.
        </p>
        
        <button 
          className="intro-button" 
          type="button" 
          onClick={onContinue}
          aria-label="Start exploring the workflow"
        >
          Explore the workflow
          <span className="intro-button-arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  )
}
