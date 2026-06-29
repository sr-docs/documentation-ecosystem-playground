import { useState } from 'react'
import { getStageContent } from '../data/stageContent'
import '../styles/ExercisePage.css'

interface ExercisePageProps {
  stage: string
  onBack: () => void
}

// --- GitHub wiring ---
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

async function dispatchPlanWorkflow(
  inputs: PlanInputs,
  onStatusUpdate: (message: string) => void
): Promise<{ url: string; number: number }> {
  const requestId = crypto.randomUUID()

  onStatusUpdate('Sending request to GitHub...')

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

  onStatusUpdate('Workflow triggered. Waiting for the GitHub Action to create the issue...')

  return findCreatedIssue(GITHUB_OWNER, GITHUB_REPO, requestId, onStatusUpdate)
}

async function findCreatedIssue(
  owner: string,
  repo: string,
  requestId: string,
  onStatusUpdate: (message: string) => void,
  { timeoutMs = 30000, intervalMs = 2000 } = {}
): Promise<{ url: string; number: number }> {
  const deadline = Date.now() + timeoutMs
  let attempt = 0

  while (Date.now() < deadline) {
    attempt += 1
    onStatusUpdate(`Checking GitHub for the new issue... (attempt ${attempt})`)

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?labels=playground,status:plan&state=all&sort=created&direction=desc&per_page=10&_=${Date.now()}`,
      { cache: 'no-store' }
    )

    if (res.ok) {
      const issues = await res.json()
      const match = issues.find((issue: { body?: string }) =>
        issue.body?.includes(`request-id: ${requestId}`)
      )
      if (match) {
        onStatusUpdate('Issue found.')
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
  const [statusMessage, setStatusMessage] = useState<string>('')

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

  const content = getStageContent(stage)

  if (!content) {
    return <div>Invalid stage</div>
  }

  async function handleCreateIssue() {
    setSubmitStatus('loading')
    setErrorMessage(null)
    setStatusMessage('')

    try {
      const result = await dispatchPlanWorkflow(
        {
          title: artifact.title,
          problem: artifact.problem,
          audience: artifact.audience,
          documentationNeeded: artifact.documentationNeeded,
          successCriteria: artifact.success,
        },
        setStatusMessage
      )
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
        <button className="back-button" onClick={onBack} type="button">
          ← Back
        </button>

        <h1>{content.exercise.title}</h1>
      </div>

      <div className="exercise-content">
        <section className="exercise-section">
          <h2>The Scenario</h2>
          <p className="scenario-text">{content.exercise.scenario}</p>
        </section>

        <section className="exercise-section">
          <h2>Your Task</h2>
          <p className="task-text">{content.exercise.task}</p>
        </section>

        {content.exercise.keyDecisions && (
          <section className="exercise-section">
            <h2>Key Decisions to Consider</h2>
            <ul className="decisions-list">
              {content.exercise.keyDecisions.map((decision, index) => (
                <li key={index}>{decision}</li>
              ))}
            </ul>
          </section>
        )}

        {!content.isAvailable && (
          <section className="exercise-section">
            <h2>Coming Soon</h2>
            <p>
              This stage's hands-on exercise is still being built. Check back soon, or go back
              and try the PLAN stage, which is fully wired up to GitHub right now.
            </p>
          </section>
        )}

        {content.isAvailable && !workflowStarted && (
          <section className="exercise-section">
            <button className="begin-button" type="button" onClick={() => setWorkflowStarted(true)}>
              Start Workflow
            </button>
          </section>
        )}

        {content.isAvailable && workflowStarted && (
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
                  onChange={(e) => setArtifact({ ...artifact, title: e.target.value })}
                />
              </div>

              <div className="artifact-field">
                <label>Problem</label>
                <textarea
                  rows={4}
                  value={artifact.problem}
                  onChange={(e) => setArtifact({ ...artifact, problem: e.target.value })}
                />
              </div>

              <div className="artifact-field">
                <label>Audience</label>
                <input
                  type="text"
                  value={artifact.audience}
                  onChange={(e) => setArtifact({ ...artifact, audience: e.target.value })}
                />
              </div>

              <div className="artifact-field">
                <label>Documentation Needed</label>
                <textarea
                  rows={3}
                  value={artifact.documentationNeeded}
                  onChange={(e) =>
                    setArtifact({ ...artifact, documentationNeeded: e.target.value })
                  }
                />
              </div>

              <div className="artifact-field">
                <label>Success Criteria</label>
                <textarea
                  rows={4}
                  value={artifact.success}
                  onChange={(e) => setArtifact({ ...artifact, success: e.target.value })}
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

              {submitStatus === 'loading' && statusMessage && (
                <p className="status-message status-loading">{statusMessage}</p>
              )}

              {submitStatus === 'success' && issueUrl && (
                <p className="status-message status-success">
                  Issue created.{' '}
                  <a href={issueUrl} target="_blank" rel="noreferrer">
                    View it on GitHub
                  </a>
                </p>
              )}

              {submitStatus === 'error' && errorMessage && (
                <div className="status-message status-error">
                  <p>{errorMessage}</p>
                  <p className="status-detail">
The issue may have been created even if this check failed.{' '}
                    <a href={`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues?q=is%3Aissue+label%3Aplayground+label%3Astatus%3Aplan`} target="_blank" rel="noreferrer">
                      Check the playground issues directly
                    </a>
                    .
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
