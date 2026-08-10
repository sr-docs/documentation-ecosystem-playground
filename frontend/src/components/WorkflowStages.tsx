import { stages } from '../data/stageContent'
import WorkflowStage from './WorkflowStage'
import '../styles/WorkflowStages.css'

interface WorkflowStagesProps {
  selectedStage: string | null
  onSelectStage: (stage: string) => void
}

export default function WorkflowStages({ selectedStage, onSelectStage }: WorkflowStagesProps) {
  const selectedIndex = stages.findIndex(s => s.id === selectedStage)
  
  return (
    <div className="workflow-stages" role="tablist" aria-label="Documentation workflow stages">
      {stages.map((stage, index) => (
        <div className="workflow-stage-wrapper" key={stage.id} data-stage={stage.id}>
          <WorkflowStage
            stage={stage}
            isSelected={selectedStage === stage.id}
            onClick={() => onSelectStage(stage.id)}
          />
          {index < stages.length - 1 && (
            <div 
              className={`workflow-connector ${index < selectedIndex ? 'active' : ''}`}
              style={{ '--connector-index': index } as React.CSSProperties}
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  )
}
