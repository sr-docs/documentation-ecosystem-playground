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

  onStatusUpdate('Sending your request to GitHub.')

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

  onStatusUpdate('Workflow triggered. Waiting for GitHub to create the issue.')

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
    onStatusUpdate(`Checking GitHub for your issue. Attempt ${attempt}.`)

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

// --- begin plan issue picker ---
interface PlanIssue {
  number: number
  title: string
  problem: string
  audience: string
  documentationNeeded: string
  successCriteria: string
}

const FALLBACK_ISSUE: PlanIssue = {
  number: 0,
  title: 'Authentication API Documentation',
  problem: "Users can't integrate with the authentication API because documentation doesn't exist.",
  audience: 'Developers integrating with the authentication API',
  documentationNeeded: 'Quick start guide, API reference, and three integration examples',
  successCriteria: 'Developers can authenticate and make their first API request without support.',
}

function parsePlanIssue(issue: { number: number; title: string; body?: string }): PlanIssue | null {
  if (!issue.body) {
    return null
  }

  const getSection = (label: string): string => {
    const pattern = new RegExp(`## ${label}\\s*\\n\\n([^#]+)`, 'i')
    const match = issue.body!.match(pattern)
    return match ? match[1].trim() : ''
  }

  return {
    number: issue.number,
    title: issue.title,
    problem: getSection('Problem'),
    audience: getSection('Audience'),
    documentationNeeded: getSection('Documentation Needed'),
    successCriteria: getSection('Success Criteria'),
  }
}

async function fetchOpenPlanIssues(): Promise<PlanIssue[]> {
  try {
    const res = await fetch(
      `${WORKER_URL}poll?type=issues&labels=playground,status:plan&_=${Date.now()}`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      return [FALLBACK_ISSUE]
    }

    const issues = await res.json()
    const openIssues = issues.filter((issue: { state: string }) => issue.state === 'open')
    const parsed = openIssues
      .map(parsePlanIssue)
      .filter((issue: PlanIssue | null): issue is PlanIssue => issue !== null)

    return parsed.length > 0 ? parsed : [FALLBACK_ISSUE]
  } catch {
    return [FALLBACK_ISSUE]
  }
}
// --- end plan issue picker ---

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

  onStatusUpdate('Sending your draft to GitHub.')

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

  onStatusUpdate('Creating your branch and pull request. This takes longer than PLAN.')

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
    onStatusUpdate(`Checking for your pull request. Attempt ${attempt}.`)

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

async function dispatchPlanComment(issueNumber: number, prUrl: string): Promise<void> {
  if (issueNumber === 0) {
    return
  }

  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowFile: 'comment-on-plan-issue.yml',
      ref: 'main',
      inputs: { issueNumber: String(issueNumber), prUrl },
    }),
  })

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.error || `Dispatch failed: ${res.status}`)
  }
}
// --- end write ---

// --- begin review ---
const SEED_DRAFT_CONTENT = `# NimbusAuth Quick Start Guide

Get up and running with the NimbusAuth API in a few minutes.

## What you need

- A NimbusAuth API key
- An email and password for your NimbusAuth account

## Set your API key

Store your API key as an environment variable named NIMBUS_API_KEY. Don't paste it directly into your code.

## Step 1: Log in

Send a GET request to /auth/login with your API key, email, and password in the request body.

POST https://api.nimbusauth.dev/v1/auth/login
Content-Type: application/json

{
  "api_key": "nimbus_live_4f8a2c9e",
  "email": "user@example.com",
  "password": "your-password"
}

You'll get back an access token and a refresh token:

{
  "access_token": "ey.abc123",
  "refresh_token": "rt.def456",
  "expires_in": 3600
}

## Step 2: Check your session

Use the access token to confirm you're logged in. Send a GET request to /auth/me:

GET https://api.nimbusauth.dev/v1/auth/me
Authorization: Bearer ey.abc123

You'll get back your account details.

## Step 3: Refresh your token

Access tokens expire after an hour. When yours expires, send your refresh token to /auth/refresh to get a new one.

## Step 4: Log out

Send a POST request to /auth/logout to end your session.`

const RELATED_REFERENCE_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/main/tasks/write-instances/nimbusauth-api-reference.md`

const SEED_PR_URL = 'https://github.com/sr-docs/documentation-ecosystem-playground/pull/28'
const SEED_PLAN_ISSUE_URL = 'https://github.com/sr-docs/documentation-ecosystem-playground/issues/26'

async function dispatchReviewFeedback(
  comment: string,
  decision: string,
  onStatusUpdate: (message: string) => void
): Promise<{ url: string; number: number }> {
  const requestId = crypto.randomUUID()

  onStatusUpdate('Sending your feedback to GitHub.')

  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowFile: 'create-review-feedback.yml',
      ref: 'main',
      inputs: {
        comment,
        decision,
        prUrl: SEED_PR_URL,
        planIssueUrl: SEED_PLAN_ISSUE_URL,
        requestId,
      },
    }),
  })

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.error || `Dispatch failed: ${res.status}`)
  }

  onStatusUpdate('Workflow triggered. Waiting for GitHub to log your feedback.')

  return findCreatedReviewIssue(requestId, onStatusUpdate)
}

async function findCreatedReviewIssue(
  requestId: string,
  onStatusUpdate: (message: string) => void,
  { timeoutMs = 30000, intervalMs = 2000 } = {}
): Promise<{ url: string; number: number }> {
  const deadline = Date.now() + timeoutMs
  let attempt = 0

  while (Date.now() < deadline) {
    attempt += 1
    onStatusUpdate(`Checking GitHub for your feedback. Attempt ${attempt}.`)

    const res = await fetch(
      `${WORKER_URL}poll?type=issues&labels=playground,status:review&_=${Date.now()}`,
      { cache: 'no-store' }
    )

    if (res.ok) {
      const issues = await res.json()
      const match = issues.find((issue: { body?: string }) =>
        issue.body?.includes(`request-id: ${requestId}`)
      )
      if (match) {
        onStatusUpdate('Feedback logged.')
        return { url: match.html_url, number: match.number }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new Error('Timed out waiting for your feedback to appear.')
}
// --- end review ---
// --- end GitHub wiring ---

const STYLE_GUIDE_RULES = [
  'Use plain language. Skip jargon.',
  'Write to the reader as "you."',
  'Use active voice.',
  'Keep sentences short.',
  'Cut filler words like "very," "simply," or "just."',
  'Use a verb, not a noun phrase: say "connect," not "establish connectivity."',
]

export default function ExercisePage({ stage, onBack }: ExercisePageProps) {
  const [workflowStarted, setWorkflowStarted] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [issueUrl, setIssueUrl] = useState<string | null>(null)
  const [draftUrl, setDraftUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>('')

  const [prNumber, setPrNumber] = useState<number | null>(null)
  const [reviewStatus, setReviewStatus] = useState<'idle' | 'requesting' | 'requested' | 'error'>('idle')

  const [planIssues, setPlanIssues] = useState<PlanIssue[]>([])
  const [selectedPlanIssue, setSelectedPlanIssue] = useState<PlanIssue | null>(null)
  const [loadingIssues, setLoadingIssues] = useState(false)

  const [showStyleGuide, setShowStyleGuide] = useState(false)

  const [reviewComment, setReviewComment] = useState('')
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'request-changes' | null>(null)
  const [reviewSubmitStatus, setReviewSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [reviewIssueUrl, setReviewIssueUrl] = useState<string | null>(null)

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

  async function loadPlanIssues() {
    setLoadingIssues(true)
    const issues = await fetchOpenPlanIssues()
    setPlanIssues(issues)
    setLoadingIssues(false)
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
        { title: selectedPlanIssue?.title ?? 'Documentation Draft', draftContent },
        setStatusMessage
      )
      setIssueUrl(result.url)
      setDraftUrl(result.draftUrl)
      setPrNumber(result.number)
      setSubmitStatus('success')

      if (selectedPlanIssue) {
        dispatchPlanComment(selectedPlanIssue.number, result.url).catch(() => {
          // A failed comment doesn't block the visitor. The draft and PR already exist.
        })
      }
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

  async function handleSubmitReview() {
    if (reviewComment.trim().length < 10) {
      setErrorMessage('Add a bit more detail to your comment.')
      setReviewSubmitStatus('error')
      return
    }

    if (!reviewDecision) {
      setErrorMessage('Choose approve or request changes before submitting.')
      setReviewSubmitStatus('error')
      return
    }

    setReviewSubmitStatus('loading')
    setErrorMessage(null)
    setStatusMessage('')

    try {
      const decisionLabel = reviewDecision === 'approve' ? 'Approved' : 'Changes requested'
      const result = await dispatchReviewFeedback(reviewComment, decisionLabel, setStatusMessage)
      setReviewIssueUrl(result.url)
      setReviewSubmitStatus('success')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong.')
      setReviewSubmitStatus('error')
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
              This stage's hands-on exercise isn't built yet. Go back and try PLAN, WRITE, or
              REVIEW. All three connect to GitHub right now.
            </p>
          </section>
        )}

        {content.isAvailable && !workflowStarted && (
          <section className="exercise-section">
            <button
              className="begin-button"
              type="button"
              onClick={() => {
                setWorkflowStarted(true)
                if (stage === 'WRITE') {
                  loadPlanIssues()
                }
              }}
            >
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
                {submitStatus === 'loading' ? 'Creating issue.' : 'Create GitHub issue'}
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
                    <a href={`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues?q=is%3Aissue+label%3Aplayground+label%3Astatus%3Aplan`}
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

        {content.isAvailable && workflowStarted && stage === 'WRITE' && !selectedPlanIssue && (
          <section className="artifact-section">
            <div className="artifact-header">
              <h2>Choose a plan to write for</h2>
            </div>

            {loadingIssues && <p className="status-message status-loading">Loading plans.</p>}

            {!loadingIssues && (
              <div className="artifact-card">
                {planIssues.map((issue) => (
                  <button
                    key={issue.number}
                    type="button"
                    className="plan-issue-option"
                    onClick={() => setSelectedPlanIssue(issue)}
                  >
                    <strong>{issue.title}</strong>
                    <p>{issue.problem}</p>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {content.isAvailable && workflowStarted && stage === 'WRITE' && selectedPlanIssue && (
          <section className="artifact-section">
            <div className="artifact-header">
              <h2>Documentation draft</h2>
            </div>

            <div className="artifact-card">
              <div className="artifact-field">
                <label>Writing for</label>
                <p className="task-text">{selectedPlanIssue.title}</p>
              </div>

              <div className="artifact-field">
                <label>Problem</label>
                <p className="task-text">{selectedPlanIssue.problem}</p>
              </div>

              <div className="artifact-field">
                <label>Audience</label>
                <p className="task-text">{selectedPlanIssue.audience}</p>
              </div>

              <div className="artifact-field">
                <label>Documentation needed</label>
                <p className="task-text">{selectedPlanIssue.documentationNeeded}</p>
              </div>

              <button
                type="button"
                className="style-guide-toggle"
                onClick={() => setShowStyleGuide(!showStyleGuide)}
              >
                {showStyleGuide ? 'Hide style guide' : 'Show style guide'}
              </button>

              {showStyleGuide && (
                <ul className="style-guide-list">
                  {STYLE_GUIDE_RULES.map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              )}

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
                {submitStatus === 'loading' ? 'Creating pull request.' : 'Submit draft'}
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
                    <p className="status-message status-loading">Requesting review.</p>
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

        {content.isAvailable && workflowStarted && stage === 'REVIEW' && (
          <section className="artifact-section">
            <div className="artifact-header">
              <h2>Draft under review</h2>
            </div>

            <div className="artifact-card">
              <div className="artifact-field">
                <label>Success criteria</label>
                <p className="task-text">{FALLBACK_ISSUE.successCriteria}</p>
              </div>

              <div className="artifact-field">
                <label>Related reference</label>
                <a href={RELATED_REFERENCE_URL} target="_blank" rel="noreferrer">
                  NimbusAuth API Reference
                </a>
              </div>

              <div className="artifact-field">
                <label>Draft content</label>
                <pre className="draft-preview">{SEED_DRAFT_CONTENT}</pre>
              </div>

              <div className="artifact-field">
                <label>Your comment</label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="What did you notice in this draft?"
                />
              </div>

              <div className="review-decision-row">
                <button
                  type="button"
                  className={`decision-button ${reviewDecision === 'approve' ? 'selected' : ''}`}
                  onClick={() => setReviewDecision('approve')}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className={`decision-button ${reviewDecision === 'request-changes' ? 'selected' : ''}`}
                  onClick={() => setReviewDecision('request-changes')}
                >
                  Request changes
                </button>
              </div>

              <button
                className="submit-button"
                type="button"
                onClick={handleSubmitReview}
                disabled={reviewSubmitStatus === 'loading'}
              >
                {reviewSubmitStatus === 'loading' ? 'Submitting feedback.' : 'Submit feedback'}
              </button>

              {reviewSubmitStatus === 'loading' && statusMessage && (
                <p className="status-message status-loading">{statusMessage}</p>
              )}

              {reviewSubmitStatus === 'success' && reviewIssueUrl && (
                <p className="status-message status-success">
                  Feedback logged.{' '}
                  <a href={reviewIssueUrl} target="_blank" rel="noreferrer">
                    View it on GitHub
                  </a>
                </p>
              )}

              {reviewSubmitStatus === 'error' && errorMessage && (
                <p className="status-message status-error">{errorMessage}</p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
