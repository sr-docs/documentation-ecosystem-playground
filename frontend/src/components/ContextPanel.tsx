import { stages } from '../data/stageContent'
import '../styles/ContextPanel.css'

interface ContextPanelProps {
  selectedStage: string | null
  onTryStage: (stage: string) => void
}

export default function ContextPanel({ selectedStage, onTryStage }: ContextPanelProps) {
  const content = selectedStage ? stages.find((stage) => stage.id === selectedStage) : null

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
              <p className="implementation-value">{content.githubImplementation}</p>
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
              {content.isAvailable ? 'Try This Stage' : 'Preview This Stage'}
            </button>
          </div>
        )
      )}
    </div>
  )
}
