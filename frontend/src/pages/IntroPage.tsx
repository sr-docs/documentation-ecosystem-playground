import StageMedia from '../components/MediaPlaceholder'
import '../styles/IntroPage.css'

interface IntroPageProps {
  onContinue: () => void
}

export default function IntroPage({ onContinue }: IntroPageProps) {
  return (
    <div className="intro-page">
      <div className="intro-content">
        <h1>Documentation Ecosystem Playground</h1>
        <p>Write, review, and ship real documentation, the way engineering teams actually do it.</p>

        <div className="intro-media">
          <StageMedia src="media/intro/intro.mp4" label="Introduction" />
        </div>

        <p className="intro-note">
          This is real. Every issue, comment, and pull request you create here actually exists on GitHub.
        </p>

        <button className="intro-button" type="button" onClick={onContinue}>
          Let's go
        </button>
      </div>
    </div>
  )
}
