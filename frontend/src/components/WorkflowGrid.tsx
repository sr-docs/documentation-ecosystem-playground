import '../styles/WorkflowGrid.css'

const workflows = [
  { id: 'plan', label: 'PLAN', title: 'Define Work' },
  { id: 'write', label: 'WRITE', title: 'Create Content' },
  { id: 'review', label: 'REVIEW', title: 'Validate Quality' },
  { id: 'publish', label: 'PUBLISH', title: 'Deploy Docs' },
  { id: 'observe', label: 'OBSERVE', title: 'Iterate' },
]

export default function WorkflowGrid() {
  return (
    <section className="workflow-grid">
      {workflows.map((workflow) => (
        <button
          key={workflow.id}
          className="workflow-item"
          type="button"
        >
          <div className="workflow-label">{workflow.label}</div>
          <div className="workflow-title">{workflow.title}</div>
        </button>
      ))}
    </section>
  )
}
