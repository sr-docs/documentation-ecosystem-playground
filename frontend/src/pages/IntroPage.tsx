import StageMedia from '../components/MediaPlaceholder'
import '../styles/IntroPage.css'

interface IntroPageProps {
  onContinue: () => void
}

export default function IntroPage({ onContinue }: IntroPageProps) {
  return (
    <div className="intro-page">
      <div className="intro-content">
        <h1>Great software needs documentation that keeps up</h1>
        <div className="intro-media">
          <StageMedia src="media/intro/intro.mp4" label="Introduction" />
        </div>
        <p>I partner with engineering teams to build documentation into the workflow, so releases don't wait on docs.</p>
<p>In this interactive portfolio, explore my GitHub-based workflow where documentation moves through the same process as code: issues for planning, pull requests for changes, reviews for feedback, approvals for release, and Github Actions for publishing.</p>
        <button className="intro-button" type="button" onClick={onContinue}>
          Let's go!
        </button>
      </div>
    </div>
  )
}
