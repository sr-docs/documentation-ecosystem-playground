import { useState } from 'react'
import '../styles/ExercisePage.css'

interface ExercisePageProps {
stage: string
onBack: () => void
}

const scenarioContent = {
PLAN: {
title: 'Documentation Planning Scenario',
scenario:
'Your team has built a new API for user authentication. The API is ready for release, but there is no documentation. Your product manager asks: "When can users start using this?" You realize documentation is the blocker.',
task: 'Create a documentation plan for the authentication API.',
},
WRITE: {
title: 'Documentation Writing Scenario',
scenario:
'The plan is approved. Your team has decided to write a quick start guide, API reference, and three integration examples. You are assigned to write the quick start guide.',
task: 'Draft the first documentation artifact.',
},
REVIEW: {
title: 'Documentation Review Scenario',
scenario:
'The quick start guide draft is submitted for review. Feedback has been provided and changes are required.',
task: 'Review and respond to feedback.',
},
PUBLISH: {
title: 'Documentation Publishing Scenario',
scenario:
'The quick start guide is approved and ready for release.',
task: 'Prepare the documentation for publication.',
},
OBSERVE: {
title: 'Documentation Observation Scenario',
scenario:
'The documentation has been live for two weeks. User behavior and feedback are available.',
task: 'Evaluate effectiveness and identify improvements.',
},
}

export default function ExercisePage({
stage,
onBack,
}: ExercisePageProps) {
const [workflowStarted, setWorkflowStarted] = useState(false)
const [artifactSubmitted, setArtifactSubmitted] = useState(false)

const content =
scenarioContent[stage as keyof typeof scenarioContent]

if (!content) {
return <div>Invalid stage</div>
}

return ( <div className="exercise-page"> <div className="exercise-header"> <button
       className="back-button"
       onClick={onBack}
       type="button"
     >
← Back </button>

```
    <h1>{content.title}</h1>
  </div>

  <div className="exercise-content">
    <section className="exercise-section">
      <h2>The Scenario</h2>

      <p className="scenario-text">
        {content.scenario}
      </p>
    </section>

    {!workflowStarted && stage === 'PLAN' && (
      <section className="exercise-section">
        <h2>Workflow Outcome</h2>

        <p className="task-text">
          Planning produces a documentation issue that
          defines the problem, audience, and success
          criteria.
        </p>

        <button
          className="begin-button"
          type="button"
          onClick={() => setWorkflowStarted(true)}
        >
          Start Workflow
        </button>
      </section>
    )}

    {workflowStarted && stage === 'PLAN' && (
      <section className="artifact-section">
        <div className="artifact-header">
          <h2>Documentation Planning Issue</h2>

          <span className="artifact-badge">
            Generated Artifact
          </span>
        </div>

        <div className="artifact-card">
          <div className="artifact-field">
            <label>Title</label>

            <input
              type="text"
              defaultValue="Create authentication API documentation"
            />
          </div>

          <div className="artifact-field">
            <label>Problem</label>

            <textarea
              rows={4}
              defaultValue="Users cannot successfully integrate with the authentication API because no documentation currently exists."
            />
          </div>

          <div className="artifact-field">
            <label>Audience</label>

            <input
              type="text"
              defaultValue="Developers integrating with the authentication API"
            />
          </div>

          <div className="artifact-field">
            <label>Success Criteria</label>

            <textarea
              rows={4}
              defaultValue="Developers can authenticate successfully and complete their first API request without support."
            />
          </div>

          {!artifactSubmitted ? (
            <button
              className="submit-button"
              type="button"
              onClick={() => setArtifactSubmitted(true)}
            >
              Submit Artifact
            </button>
          ) : (
            <div className="artifact-success">
              Artifact submitted.
              <br />
              In a real documentation ecosystem, this issue
              would now enter the workflow.
            </div>
          )}
        </div>
      </section>
    )}
  </div>
</div>
```

)
}
