import StageMedia from '../components/MediaPlaceholder'
import '../styles/IntroPage.css'

interface IntroPageProps {
  onContinue: () => void
}

export default function IntroPage({ onContinue }: IntroPageProps) {
  return (
    <main className="intro-page" id="main-content">
      <div className="intro-content">
        <h1>Great software needs documentation that keeps up</h1>

        <div className="intro-media">
          <StageMedia
            src="media/intro/intro.mp4"
            label="Docs as Code lifecycle: Plan, Write, Review, Publish, and Observe"
          />
        </div>

        <p>
          Walk through my version of the docs-as-code workflow in this interactive,
          GitHub-integrated project.
        </p>

        <button
          className="intro-button"
          type="button"
          onClick={onContinue}
          aria-label="Start exploring the workflow"
        >
          Explore the workflow
          <span className="intro-button-arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    </main>
  )
}
