import StageMedia from '../components/MediaPlaceholder'
import '../styles/IntroPage.css'

interface IntroPageProps {
  onContinue: () => void
}

export default function IntroPage({ onContinue }: IntroPageProps) {
  return (
    <div className="intro-page">
      <div className="intro-content">
        <h1>Great software deserves great documentation!</h1>
        <div className="intro-media">
          <StageMedia src="media/intro/intro.mp4" label="Introduction" />
        </div>
        <p>Documentation works best when it is part of the development workflow, not an afterthought.</p>
        <p>Docs as Code helps teams write, review, and ship documentation alongside software.</p>
<p>Explore the workflow firsthand in this interactive portfolio.</p>
        <button className="intro-button" type="button" onClick={onContinue}>
          Let's go!
        </button>
      </div>
    </div>
  )
}
