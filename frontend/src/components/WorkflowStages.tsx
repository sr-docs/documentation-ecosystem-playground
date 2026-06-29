import { stages } from '../data/stageContent'
import WorkflowStage from './WorkflowStage'
import '../styles/WorkflowStages.css'

interface WorkflowStagesProps {
  selectedStage: string | null
  onSelectStage: (stage: string) => void
}

export default function WorkflowStages({ selectedStage, onSelectStage }: WorkflowStagesProps) {
  return (
    <div className="workflow-stages">
      {stages.map((stage, index) => (
        <div className="workflow-stage-wrapper" key={stage.id}>
          <WorkflowStage
            stage={stage}
            isSelected={selectedStage === stage.id}
            onClick={() => onSelectStage(stage.id)}
          />
          {index < stages.length - 1 && <div className="workflow-arrow">→</div>}
        </div>
      ))}
    </div>
  )
}
