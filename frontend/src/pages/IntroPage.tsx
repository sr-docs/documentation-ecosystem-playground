import StageMedia from '../components/MediaPlaceholder'
import '../styles/IntroPage.css'

interface IntroPageProps {
  onContinue: () => void
}

export default function IntroPage({ onContinue }: IntroPageProps) {
  return (
    <div className="intro-page">
      <div className="intro-content">
        <h1>Welcome to SR's Docs as Code Playground!</h1>
        <p>Docs are often overlooked during software development until it's too late. How do you address this issue? </p>
        <div className="intro-media">
          <StageMedia src="media/intro/intro.mp4" label="Introduction" />
        </div>
        <p>A possible answer is: Docs as Code!</p>
        <p>It is a methodology that treats technical documentation as software code, utilizing the same version control systems (like Git), plain text formats (such as Markdown), and CI/CD pipelines used for software development.</p>

        <p>
         Do you want to write, review, and ship documentation the way real engineering teams actually do it?
        </p>

        <button className="intro-button" type="button" onClick={onContinue}>
          Let's go!
        </button>
      </div>
    </div>
  )
}
