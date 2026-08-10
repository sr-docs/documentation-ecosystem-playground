import { PORTFOLIO_URL } from '../constants'
import '../styles/SiteChrome.css'

const portfolio = (path: string) => new URL(path, PORTFOLIO_URL).href

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        <a href={portfolio('index.html')}>Home</a>
        {' · '}
        <a href={portfolio('projects/index.html')}>All projects</a>
        {' · '}
        <a href="https://github.com/sr-docs">GitHub</a>
      </p>
    </footer>
  )
}
