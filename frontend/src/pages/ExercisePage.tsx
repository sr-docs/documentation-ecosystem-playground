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

// --- begin plan ---
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

  onStatusUpdate('Sending your request to GitHub...')

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

  onStatusUpdate('Workflow triggered. Waiting for GitHub to create the issue...')

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
    onStatusUpdate(`Checking GitHub for your issue... (attempt ${attempt})`)

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
// --- end plan ---

// --- begin write ---
interface WriteInputs {
  title: string
  draftContent: string
}

async function dispatchWriteWorkflow(
  inputs: WriteInputs,
  onStatusUpdate: (message: string) => void
): Promise<{ url: string; number: number; draftUrl: string }> {
  const requestId = crypto.randomUUID()

  onStatusUpdate('Sending your draft to GitHub...')

  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowFile: 'create-write-pr.yml',
      ref: 'main',
      inputs: { ...inputs, requestId },
    }),
  })

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.error || `Dispatch failed: ${res.status}`)
  }

  onStatusUpdate('Creating your branch and pull request. This takes longer than PLAN...')

  return findCreatedPR(requestId, onStatusUpdate)
}

async function findCreatedPR(
  requestId: string,
  onStatusUpdate: (message: string) => void,
  { timeoutMs = 60000, intervalMs = 3000 } = {}
): Promise<{ url: string; number: number; draftUrl: string }> {
  const deadline = Date.now() + timeoutMs
  let attempt = 0

  while (Date.now() < deadline) {
    attempt += 1
    onStatusUpdate(`Checking for your pull request... (attempt ${attempt})`)

    const res = await fetch(
      `${WORKER_URL}poll?type=pulls&labels=status:write&_=${Date.now()}`,
      { cache: 'no-store' }
    )

    if (res.ok) {
      const pulls = await res.json()
      const match = pulls.find((pr: { body?: string }) =>
        pr.body?.includes(`request-id: ${requestId}`)
      )
      if (match) {
        onStatusUpdate('Pull request found.')
        const draftUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/${match.head.ref}/tasks/write-instances/${requestId}.md`
        return { url: match.html_url, number: match.number, draftUrl }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new Error('Timed out waiting for the pull request to appear.')
}

async function dispatchReviewRequest(prNumber: number): Promise<void> {
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowFile: 'request-write-review.yml',
      ref: 'main',
      inputs: { prNumber: String(prNumber) },
    }),
  })

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.error || `Dispatch failed: ${res.status}`)
  }
}
// --- end write ---
// --- end GitHub wiring ---

export default function ExercisePage({ stage, onBack }: ExercisePageProps) {
  const [workflowStarted, setWorkflowStarted] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [issueUrl, setIssueUrl] = useState<string | null>(null)
  const [draftUrl, setDraftUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>('')

  const [prNumber, setPrNumber] = useState<number | null>(null)
  const [reviewStatus, setReviewStatus] = useState<'idle' | 'requesting' | 'requested' | 'error'>('idle')

  const [artifact, setArtifact] = useState({
    title: 'Authentication API Documentation',
    problem: 'Users cannot integrate with the authentication API because documentation does not exist.',
    audience: 'Developers integrating with the authentication API',
    documentationNeeded: 'Quick start guide, API reference, and three integration examples',
    success: 'Developers can authenticate and make their first API request without support.',
  })

  const [draftContent, setDraftContent] = useState(
    'Start your draft here. Aim for at least a few sentences.'
  )

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

  async function handleCreateWritePR() {
    if (draftContent.trim().length < 20) {
      setErrorMessage('Your draft needs at least 20 characters.')
      setSubmitStatus('error')
      return
    }

    if (draftContent.length > 2000) {
      setErrorMessage('Keep your draft under 2,000 characters.')
      setSubmitStatus('error')
      return
    }

    setSubmitStatus('loading')
    setErrorMessage(null)
    setStatusMessage('')
    setReviewStatus('idle')
    setPrNumber(null)
    setDraftUrl(null)

    try {
      const result = await dispatchWriteWorkflow(
        { title: 'Quick Start Guide Draft', draftContent },
        setStatusMessage
      )
      setIssueUrl(result.url)
      setDraftUrl(result.draftUrl)
      setPrNumber(result.number)
      setSubmitStatus('success')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong.')
      setSubmitStatus('error')
    }
  }

  async function handleRequestReview() {
    if (!prNumber) {
      return
    }

    setReviewStatus('requesting')
    setErrorMessage(null)

    try {
      await dispatchReviewRequest(prNumber)
      setReviewStatus('requested')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong.')
      setReviewStatus('error')
    }
  }

  return (
    <div className="exercise-page">
      <div className="exercise-header">
        <button className="back-button" onClick={onBack} type="button">
          Back
        </button>
        <h1>{content.exercise.title}</h1>
      </div>

      <div className="exercise-content">
        <section className="exercise-section">
          <h2>The scenario</h2>
          <p className="scenario-text">{content.exercise.scenario}</p>
        </section>

        <section className="exercise-section">
          <h2>Your task</h2>
          <p className="task-text">{content.exercise.task}</p>
        </section>

        {content.exercise.keyDecisions && (
          <section className="exercise-section">
            <h2>Key decisions to consider</h2>
            <ul className="decisions-list">
              {content.exercise.keyDecisions.map((decision, index) => (
                <li key={index}>{decision}</li>
              ))}
            </ul>
          </section>
        )}

        {!content.isAvailable && (
          <section className="exercise-section">
            <h2>Coming soon</h2>
            <p>
              This stage's hands-on exercise isn't built yet. Go back and try PLAN or WRITE.
              Both connect to GitHub right now.
            </p>
          </section>
        )}

        {content.isAvailable && !workflowStarted && (
          <section className="exercise-section">
            <button className="begin-button" type="button" onClick={() => setWorkflowStarted(true)}>
              Start workflow
            </button>
          </section>
        )}

        {content.isAvailable && workflowStarted && stage === 'PLAN' && (
          <section className="artifact-section">
            <div className="artifact-header">
              <h2>Documentation planning issue</h2>
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
                <label>Documentation needed</label>
                <textarea
                  rows={3}
                  value={artifact.documentationNeeded}
                  onChange={(e) => setArtifact({ ...artifact, documentationNeeded: e.target.value })}
                />
              </div>

              <div className="artifact-field">
                <label>Success criteria</label>
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
                {submitStatus === 'loading' ? 'Creating issue...' : 'Create GitHub issue'}
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
                    The issue might exist even if this check failed.{' '}
                   <a 
                      href={`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues?q=is%3Aissue+label%3Aplayground+label%3Astatus%3Aplan`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Check the playground issues directly
                    </a>
                    .
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {content.isAvailable && workflowStarted && stage === 'WRITE' && (
          <section className="artifact-section">
            <div className="artifact-header">
              <h2>Documentation draft</h2>
            </div>

            <div className="artifact-card">
              <div className="artifact-field">
                <label>Your draft</label>
                <textarea
                  rows={10}
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                />
              </div>

              <button
                className="submit-button"
                type="button"
                onClick={handleCreateWritePR}
                disabled={submitStatus === 'loading'}
              >
                {submitStatus === 'loading' ? 'Creating pull request...' : 'Submit draft'}
              </button>

              {submitStatus === 'loading' && statusMessage && (
                <p className="status-message status-loading">{statusMessage}</p>
              )}

              {submitStatus === 'success' && issueUrl && (
                <div className="status-message status-success">
                  <p>
                    Draft created.{' '}
                    <a href={draftUrl ?? issueUrl} target="_blank" rel="noreferrer">
                      View it on GitHub
                    </a>
                  </p>

                  {reviewStatus === 'idle' && (
                    <button className="submit-button" type="button" onClick={handleRequestReview}>
                      Request review
                    </button>
                  )}

                  {reviewStatus === 'requesting' && (
                    <p className="status-message status-loading">Requesting review...</p>
                  )}

                  {reviewStatus === 'requested' && (
                    <p className="status-message status-success">
                      Review requested. A reviewer will take a look soon.
                    </p>
                  )}

                  {reviewStatus === 'error' && errorMessage && (
                    <p className="status-message status-error">{errorMessage}</p>
                  )}
                </div>
              )}

              {submitStatus === 'error' && errorMessage && (
                <p className="status-message status-error">{errorMessage}</p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
