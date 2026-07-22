import '../styles/WorkflowStage.css'
import type { StageContent } from '../data/stageContent'

interface WorkflowStageProps {
  stage: StageContent
  isSelected: boolean
  onClick: () => void
}

export default function WorkflowStage({ stage, isSelected, onClick }: WorkflowStageProps) {
  return (
    <button
      className={`workflow-stage ${isSelected ? 'selected' : ''} ${
        !stage.isAvailable ? 'unavailable' : ''
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="workflow-stage-label">{stage.label}</span>
      <span className="workflow-stage-primitive">{stage.outcomeLabel}</span>
    </button>
  )
}
