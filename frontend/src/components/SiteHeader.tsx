import { PORTFOLIO_URL } from '../constants'
import { useTheme } from '../hooks'
import '../styles/SiteChrome.css'

const portfolio = (path: string) => new URL(path, PORTFOLIO_URL).href

function MoonIcon() {
  return (
    <svg className="icon-moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12.3 3.07a.75.75 0 0 1 .82.95 7.5 7.5 0 1 0 6.86 6.86.75.75 0 0 1 .95.82A9 9 0 1 1 12.3 3.07Z"
      />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg className="icon-sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0-5.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 12 2.25Zm0 16.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75ZM4.22 4.22a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 1 1-1.06 1.06L4.22 5.28a.75.75 0 0 1 0-1.06Zm13.44 13.44a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 1 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06ZM2.25 12a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 2.25 12Zm16.5 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM5.28 18.72a.75.75 0 0 1 0-1.06l1.06-1.06a.75.75 0 1 1 1.06 1.06L6.34 18.72a.75.75 0 0 1-1.06 0Zm13.44-13.44a.75.75 0 0 1 0-1.06l1.06-1.06a.75.75 0 0 1 1.06 1.06L19.78 5.28a.75.75 0 0 1-1.06 0Z"
      />
    </svg>
  )
}

export function SiteHeader() {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <header className="site-header" aria-label="Sabita Rao's Portfolio">
      <div className="header-start">
        <a className="brand" href={portfolio('index.html')}>
          Sabita Rao&apos;s <span>Portfolio</span>
        </a>
        <nav className="nav nav--primary" aria-label="Primary">
          <a href={portfolio('index.html')}>Home</a>
          <a href={portfolio('projects/index.html')} aria-current="page">
            Projects
          </a>
          <a href={portfolio('blog/index.html')}>Blog</a>
        </nav>
      </div>
      <div className="header-tools">
        <nav className="nav nav--meta" aria-label="About and social">
          <a href={portfolio('about.html')}>About</a>
          <a
            href="https://linkedin.com/in/sabitarao"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/sr-docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={label}
          aria-pressed={isDark}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          <MoonIcon />
          <SunIcon />
        </button>
      </div>
    </header>
  )
}
