import '../styles/ContextPanel.css'

const stageContent = {
  PLAN: {
    whatHappens: [
      'A documentation need is identified.',
      'Scope is defined.',
      'Success criteria are established.',
    ],
    githubImplementation: 'Issue',
    artifacts: [
      'Problem statement',
      'Scope definition',
      'Acceptance criteria',
    ],
  },
  WRITE: {
    whatHappens: [
      'Content is drafted.',
      'Information is organized.',
      'Documentation takes shape.',
    ],
    githubImplementation: 'Branch + Commits',
    artifacts: [
      'Draft documentation',
      'Structured content',
    ],
  },
  REVIEW: {
    whatHappens: [
      'Content is evaluated.',
      'Feedback is provided.',
      'Quality is improved.',
    ],
    githubImplementation: 'Pull Request',
    artifacts: [
      'Review comments',
      'Approval decisions',
    ],
  },
  PUBLISH: {
    whatHappens: [
      'Documentation is built.',
      'Changes are deployed.',
      'Content becomes available.',
    ],
    githubImplementation: 'GitHub Actions',
    artifacts: [
      'Successful build',
      'Deployment result',
    ],
  },
  OBSERVE: {
    whatHappens: [
      'Documentation performance is evaluated.',
      'Improvements are identified.',
      'Future work is planned.',
    ],
    githubImplementation: 'Issues and Iteration',
    artifacts: [
      'Improvement opportunities',
      'Follow-up work',
    ],
  },
}

interface ContextPanelProps {
  selectedStage: string | null
  onTryStage: (stage: string) => void
}

export default function ContextPanel({ selectedStage, onTryStage }: ContextPanelProps) {
  const content = selectedStage ? stageContent[selectedStage as keyof typeof stageContent] : null

  return (
    <div className="context-panel">
      {!selectedStage ? (
        <div className="context-empty">Select a stage to explore.</div>
      ) : (
        content && (
          <div className="context-content">
            <h2>{selectedStage}</h2>

            <div className="context-section">
              <h3>What happens</h3>
              <ul>
                {content.whatHappens.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="context-section">
              <h3>GitHub implementation</h3>
              <p>{content.githubImplementation}</p>
            </div>

            <div className="context-section">
              <h3>Artifacts</h3>
              <ul>
                {content.artifacts.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <button className="try-button" type="button" onClick={() => onTryStage(selectedStage)}>
              Try This Stage
            </button>
          </div>
        )
      )}
    </div>
  )
}
