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
    task:
      'Create a documentation plan for the authentication API. Define what documentation is needed, who needs it, and success criteria.',
    keyDecisions: [
      'Identify the target audience (developers, integrators, internal teams)',
      'List required documentation types (quick start, API reference, examples)',
      'Define success metrics (adoption rate, support ticket reduction)',
      'Set timeline and dependencies',
    ],
  },

  WRITE: {
    title: 'Documentation Writing Scenario',
    scenario:
      'The plan is approved. Your team has decided to write a quick start guide, API reference, and three integration examples. You are assigned to write the quick start guide.',
    task:
      'Outline and draft a quick start guide that gets developers up and running quickly.',
  },

  REVIEW: {
    title: 'Documentation Review Scenario',
    scenario:
      'The quick start guide draft is submitted for review. A reviewer has suggested revisions before publication.',
    task:
      'Review the feedback, identify required changes, and determine how the documentation should evolve.',
  },

  PUBLISH: {
    title: 'Documentation Publishing Scenario',
    scenario:
      'The quick start guide is approved. You need to publish it to the documentation site.',
    task:
      'Plan the publication workflow and identify validation steps before release.',
  },

  OBSERVE: {
    title: 'Documentation Observation Scenario',
    scenario:
      'The documentation has been live for two weeks. Usage patterns and support requests are available.',
    task:
      'Analyze user behavior and identify opportunities for improvement.',
  },
}

export default function ExercisePage({
  stage,
  onBack,
}: ExercisePageProps) {
  const [workflowStarted, setWorkflowStarted] = useState(false)

  const [artifact, setArtifact] = useState({
    title: 'Authentication API Documentation',
    problem:
      'Users cannot successfully integrate with the authentication API because documentation does not exist.',
    audience: 'Developers integrating with the authentication API',
    success:
      'Developers can authenticate successfully and make their first API request without support.',
  })

  const content =
    scenarioContent[stage as keyof typeof scenarioContent]

  if (!content) {
    return <div>Invalid stage</div>
  }

  return (
    <div className="exercise-page">
      <div className="exercise-header">
        <button
          className="back-button"
          onClick={onBack}
          type="button"
        >
          ← Back
        </button>

        <h1>{content.title}</h1>
      </div>

      <div className="exercise-content">
        <section className="exercise-section">
          <h2>The Scenario</h2>

          <p className="scenario-text">
            {content.scenario}
          </p>
        </section>

        <section className="exercise-section">
          <h2>Your Task</h2>

          <p className="task-text">
            {content.task}
          </p>
        </section>

        {'keyDecisions' in content && (
          <section className="exercise-section">
            <h2>Key Decisions to Consider</h2>

            <ul className="decisions-list">
              {content.keyDecisions.map((decision, index) => (
                <li key={index}>{decision}</li>
              ))}
            </ul>
          </section>
        )}

        {stage === 'PLAN' && !workflowStarted && (
          <section className="exercise-section">
            <button
              className="begin-button"
              type="button"
              onClick={() => setWorkflowStarted(true)}
            >
              Start Workflow
            </button>
          </section>
        )}

        {stage === 'PLAN' && workflowStarted && (
          <section className="artifact-section">
            <div className="artifact-header">
              <h2>Documentation Planning Issue</h2>
            </div>

            <div className="artifact-card">
              <div className="artifact-field">
                <label>Title</label>

                <input
                  type="text"
                  value={artifact.title}
                  onChange={(e) =>
                    setArtifact({
                      ...artifact,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div className="artifact-field">
                <label>Problem</label>

                <textarea
                  rows={4}
                  value={artifact.problem}
                  onChange={(e) =>
                    setArtifact({
                      ...artifact,
                      problem: e.target.value,
                    })
                  }
                />
              </div>

              <div className="artifact-field">
                <label>Audience</label>

                <input
                  type="text"
                  value={artifact.audience}
                  onChange={(e) =>
                    setArtifact({
                      ...artifact,
                      audience: e.target.value,
                    })
                  }
                />
              </div>

              <div className="artifact-field">
                <label>Success Criteria</label>

                <textarea
                  rows={4}
                  value={artifact.success}
                  onChange={(e) =>
                    setArtifact({
                      ...artifact,
                      success: e.target.value,
                    })
                  }
                />
              </div>

              <button
                className="submit-button"
                type="button"
              >
                Create GitHub Issue
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
