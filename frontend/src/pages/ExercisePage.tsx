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
// --- end plan ---

// --- begin write ---
interface WriteInputs {
  title: string
  draftContent: string
}

async function dispatchWriteWorkflow(
  inputs: WriteInputs,
  onStatusUpdate: (message: string) => void
): Promise<{ url: string; number: number }> {
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

  onStatusUpdate('Creating your branch and pull request. This takes a bit longer than PLAN...')

  return findCreatedPR(requestId, onStatusUpdate)
}

async function findCreatedPR(
  requestId: string,
  onStatusUpdate: (message: string) => void,
  { timeoutMs = 60000, intervalMs = 3000 } = {}
): Promise<{ url: string; number: number }> {
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
        return { url: match.html_url, number: match.number }
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>('')

  const [prNumber, setPrNumber] = useState<number | null>(null)
  const [reviewStatus, setReviewStatus] = useState<'idle' | 'requesting' | 'requested' | 'error'>('idle')

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
      setErrorMessage('Your draft is too long. Keep it under 2,000 characters.')
      setSubmitStatus('error')
      return
    }

    setSubmitStatus('loading')
    setErrorMessage(null)
    setStatusMessage('')
    setReviewStatus('idle')
    setPrNumber(null)

    try {
      const result = await dispatchWriteWorkflow(
        { title: 'Quick Start Guide Draft', draftContent
