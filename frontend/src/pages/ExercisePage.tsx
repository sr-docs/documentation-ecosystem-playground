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

// --- GitHub wiring ---
// Replace these three values with your own before this works.
const WORKER_URL = 'https://doc-playground-proxy.sabitarao2025.workers.dev/'
const GITHUB_OWNER = 'sr-docs'
const GITHUB_REPO = 'documentation-ecosystem-playground'

interface PlanInputs {
  title: string
  problem: string
  audience: string
  documentationNeeded: string
  successCriteria: string
}

async function dispatchPlanWorkflow(inputs: PlanInputs): Promise<{ url: string; number: number }> {
  const requestId = crypto.randomUUID()

  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowFile: 'create-plan-issue.yml',
      ref: 'main',
      inputs: { ...inputs, requestId },
    }),
  })

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.error || `Dispatch failed: ${res.status}`)
  }

  return findCreatedIssue(GITHUB_OWNER, GITHUB_REPO, requestId)
}

async function findCreatedIssue(
  owner: string,
  repo: string,
  requestId: string,
  { timeoutMs = 30000, intervalMs = 2000 } = {}
): Promise<{ url: string; number: number }> {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?labels=playground,status:plan&state=all&sort=created&direction=desc&per_page=10`
    )

    if (res.ok) {
      const issues = await res.json()
      const match = issues.find((issue: { body?: string }) =>
        issue.body?.includes(`request-id: ${requestId}`)
      )
      if (match) {
        return { url: match.html_url, number: match.number }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new Error('Timed out waiting for the issue to appear.')
}
// --- end GitHub wiring ---

export default function ExercisePage({ stage, onBack }: ExercisePageProps) {
  const [workflowStarted, setWorkflowStarted] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [issueUrl, setIssueUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [artifact, setArtifact] = useState({
    title: 'Authentication API Documentation',
    problem:
      'Users cannot successfully integrate with the authentication API because documentation does not exist.',
    audience: 'Developers integrating with the authentication API',
    documentationNeeded:
      'Quick start guide, API reference, and three integration examples',
    success:
      'Developers can authenticate successfully and make their first API request without support.',
  })

  const content =
    scenarioContent[stage as keyof typeof scenarioContent]

  if (!content) {
    return <div>Invalid stage</div>
  }

  async function handleCreateIssue() {
    setSubmitStatus('loading')
    setErrorMessage(null)

    try {
      const result = await dispatchPlanWorkflow({
        title: artifact.title,
        problem: artifact.problem,
        audience: artifact.audience,
        documentationNeeded: artifact.documentationNeeded,
        successCriteria: artifact.success,
      })
      setIssueUrl(result.url)
      setSubmitStatus('success')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong.')
      setSubmitStatus('error')
    }
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
                <label>Documentation Needed</label>

                <textarea
                  rows={3}
                  value={artifact.documentationNeeded}
                  onChange={(e) =>
                    setArtifact({
                      ...artifact,
                      documentationNeeded: e.target.value,
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
                onClick={handleCreateIssue}
                disabled={submitStatus === 'loading'}
              >
                {submitStatus === 'loading' ? 'Creating issue...' : 'Create GitHub Issue'}
              </button>

              {submitStatus === 'success' && issueUrl && (
                <p style={{ color: 'green', marginTop: '12px' }}>
                  Issue created.{' '}
                  <a href={issueUrl} target="_blank" rel="noreferrer">
                    View it on GitHub
                  </a>
                </p>
              )}

              {submitStatus === 'error' && errorMessage && (
                <p style={{ color: 'red', marginTop: '12px' }}>
                  {errorMessage}
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
