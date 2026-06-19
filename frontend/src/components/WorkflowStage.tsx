import '../styles/WorkflowStage.css'

interface WorkflowStageProps {
  name: string
  isSelected: boolean
  onClick: () => void
}

export default function WorkflowStage({ name, isSelected, onClick }: WorkflowStageProps) {
  return (
    <button
      className={`workflow-stage ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      type="button"
    >
      {name}
    </button>
  )
}
