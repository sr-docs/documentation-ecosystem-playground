import WorkflowStage from './WorkflowStage'
import '../styles/WorkflowStages.css'

const stages = ['PLAN', 'WRITE', 'REVIEW', 'PUBLISH', 'OBSERVE']

interface WorkflowStagesProps {
  selectedStage: string | null
  onSelectStage: (stage: string) => void
}

export default function WorkflowStages({ selectedStage, onSelectStage }: WorkflowStagesProps) {
  return (
    <div className="workflow-stages">
      {stages.map((stage, index) => (
        <div key={stage}>
          <WorkflowStage
            name={stage}
            isSelected={selectedStage === stage}
            onClick={() => onSelectStage(stage)}
          />
          {index < stages.length - 1 && <div className="workflow-arrow">↓</div>}
        </div>
      ))}
    </div>
  )
}
