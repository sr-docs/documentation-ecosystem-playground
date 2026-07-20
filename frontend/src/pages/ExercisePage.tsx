import { useState, useEffect } from 'react'
import { getStageContent } from '../data/stageContent'
import '../styles/ExercisePage.css'

interface ExercisePageProps {
  stage: string
  onBack: () => void
  onNavigateToStage: (stage: string, fromReviewFeedback?: boolean) => void
  cameFromReview: boolean
}

// --- GitHub wiring ---
const WORKER_URL = 'https://doc-playground-proxy.sabitarao2025.workers.dev/'
const GITHUB_OWNER = 'sr-docs'
const GITHUB_REPO = 'documentation-ecosystem-playground'

function getErrorMessage(err: unknown): string {
  if (err instanceof TypeError) {
    return "Couldn't reach GitHub. Check your connection and try again."
  }
  if (err instanceof Error) {
    return err.message
  }
  return 'Something went wrong.'
}

// --- begin markdown rendering ---
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderMarkdown(raw: string): string {
  const codeBlocks: string[] = []

  let text = raw.replace(/```([\s\S]*?)```/g, (_match, code: string) => {
    const escaped = escapeHtml(code.trim())
    codeBlocks.push(`<pre class="md-code-block"><code>${escaped}</code></pre>`)
    return `\u0000CODEBLOCK${codeBlocks.length - 1}\u0000`
  })

  text = escapeHtml(text)

  text = text.replace(/^###### (.*)$/gm, '<h6>$1</h6>')
  text = text.replace(/^##### (.*)$/gm, '<h5>$1</h5>')
  text = text.replace(/^#### (.*)$/gm, '<h4>$1</h4>')
  text = text.replace(/^### (.*)$/gm, '<h3>$1</h3>')
  text = text.replace(/^## (.*)$/gm, '<h2>$1</h2>')
  text = text.replace(/^# (.*)$/gm, '<h1>$1</h1>')

  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>')

  text = text.replace(/^- (.*)$/gm, '<li>$1</li>')
  text = text.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)

  const blockTagPattern = /^<(h1|h2|h3|h4|h5|h6|ul|pre)/
  const paragraphs = text.split(/\n{2,}/).map((block) => {
    const trimmed = block.trim()
    if (!trimmed) {
      return ''
    }
    if (blockTagPattern.test(trimmed)) {
      return trimmed
    }
    return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`
  })
  text = paragraphs.join('\n')

  text = text.replace(/\u0000CODEBLOCK(\d+)\u0000/g, (_match, idx: string) => codeBlocks[Number(idx)])

  return text
}

function MarkdownPreview({ content }: { content: string }) {
  return (
    <div
      className="markdown-preview"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}
// --- end markdown rendering ---

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

// --- shared fixed plan info, used by WRITE, REVIEW, and PUBLISH ---
interface FixedPlan {
  title: string
  problem: string
  audience: string
  documentationNeeded: string
  successCriteria: string
}

const FIXED_PLAN: FixedPlan = {
  title: 'Authentication API Documentation',
  problem: "Users can't integrate with the authentication API because documentation doesn't exist.",
  audience: 'Developers integrating with the authentication API',
  documentationNeeded: 'Quick start guide, API reference, and three integration examples',
  successCriteria: 'Developers can authenticate and make their first API request without support.',
}

const SEED_DRAFT_PATH = 'tasks/write-instances/seed-fallback-001.md'
const SEED_DRAFT_BRANCH = 'write/seed-fallback-001'
const SEED_PR_URL = 'https://github.com/sr-docs/documentation-ecosystem-playground/pull/28'
const SEED_PR_NUMBER = '28'
const RELATED_REFERENCE_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/main/tasks/write-instances/nimbusauth-api-reference.md`

const SEED_DRAFT_CONTENT_FALLBACK = `# NimbusAuth Quick Start Guide

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

async function fetchSeedDraftContent(): Promise<string> {
  try {
    const res = await fetch(
      `${WORKER_URL}file?path=${encodeURIComponent(SEED_DRAFT_PATH)}&ref=${encodeURIComponent(SEED_DRAFT_BRANCH)}&_=${Date.now()}`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      return SEED_DRAFT_CONTENT_FALLBACK
    }

    const data = await res.json()
    return data.content || SEED_DRAFT_CONTENT_FALLBACK
  } catch {
    return SEED_DRAFT_CONTENT_FALLBACK
  }
}

// --- begin write ---
async function dispatchUpdateWriteDraft(
  draftContent: string,
  onStatusUpdate: (message: string) => void
): Promise<void> {
  const requestId = crypto.randomUUID()

  onStatusUpdate('Sending your draft to GitHub.')

  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowFile: 'update-write-pr.yml',
      ref: 'main',
      inputs: { draftContent, requestId },
    }),
  })

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.error || `Dispatch failed: ${res.status}`)
  }

  onStatusUpdate('Updating the pull request. This can take a moment.')

  await pollForUpdatedDraft(draftContent, onStatusUpdate)
}

async function pollForUpdatedDraft(
  expectedContent: string,
  onStatusUpdate: (message: string) => void,
  { timeoutMs = 60000, intervalMs = 3000 } = {}
): Promise<void> {
  const deadline = Date.now() + timeoutMs
  let attempt = 0

  while (Date.now() < deadline) {
    attempt += 1
    onStatusUpdate(`Confirming the update. Attempt ${attempt}.`)

    const current = await fetchSeedDraftContent()
    if (current.trim() === expectedContent.trim()) {
      onStatusUpdate('Draft updated.')
      return
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new Error('Timed out waiting for the update to be confirmed.')
}

async function dispatchReviewRequest(prNumber: string): Promise<void> {
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowFile: 'request-write-review.yml',
      ref: 'main',
      inputs: { prNumber },
    }),
  })

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.error || `Dispatch failed: ${res.status}`)
  }
}
// --- end write ---

// --- begin review ---
interface CheckResult {
  id: number
  name: string
  status: string
  conclusion: string | null
}

const CHECK_NAME_LABELS: Record<string, string> = {
  build: 'Site build check',
}

function checkDisplayName(check: CheckResult): string {
  return CHECK_NAME_LABELS[check.name] || check.name
}

function dedupeChecksByName(checks: CheckResult[]): CheckResult[] {
  const sorted = [...checks].sort((a, b) => b.id - a.id)
  const seen = new Set<string>()
  const result: CheckResult[] = []

  for (const check of sorted) {
    if (!seen.has(check.name)) {
      seen.add(check.name)
      result.push(check)
    }
  }

  return result
}

async function fetchSeedPRChecks(): Promise<CheckResult[] | null> {
  try {
    const pullsRes = await fetch(
      `${WORKER_URL}poll?type=pulls&_=${Date.now()}`,
      { cache: 'no-store' }
    )

    if (!pullsRes.ok) {
      return null
    }

    const pulls = await pullsRes.json()
    const seedPR = pulls.find((pr: { number: number }) => String(pr.number) === SEED_PR_NUMBER)

    if (!seedPR) {
      return null
    }

    const checksRes = await fetch(
      `${WORKER_URL}checks?sha=${seedPR.head.sha}&_=${Date.now()}`,
      { cache: 'no-store' }
    )

    if (!checksRes.ok) {
      return null
    }

    const data = await checksRes.json()
    const rawChecks: CheckResult[] = (data.check_runs || []).map(
      (run: { id: number; name: string; status: string; conclusion: string | null }) => ({
        id: run.id,
        name: run.name,
        status: run.status,
        conclusion: run.conclusion,
      })
    )

    return dedupeChecksByName(rawChecks)
  } catch {
    return null
  }
}

type ReviewDecisionStatus = 'approved' | 'changes-requested' | 'not-reviewed' | 'unknown'

interface ReviewCommentInfo {
  status: ReviewDecisionStatus
  rawComment: string | null
}

async function fetchLatestReviewCommentInfo(): Promise<ReviewCommentInfo> {
  try {
    const res = await fetch(
      `${WORKER_URL}pr-comments?prNumber=${SEED_PR_NUMBER}&_=${Date.now()}`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      return { status: 'unknown', rawComment: null }
    }

    const comments = await res.json()

    if (!Array.isArray(comments) || comments.length === 0) {
      return { status: 'not-reviewed', rawComment: null }
    }

    const latest = comments.find((c: { body?: string }) =>
      c.body?.includes('Review decision:')
    )

    if (!latest) {
      return { status: 'not-reviewed', rawComment: null }
    }

    let status: ReviewDecisionStatus = 'unknown'
    if (latest.body.includes('Review decision: Approved')) {
      status = 'approved'
    } else if (latest.body.includes('Review decision: Changes requested')) {
      status = 'changes-requested'
    }

    return { status, rawComment: latest.body }
  } catch {
    return { status: 'unknown', rawComment: null }
  }
}

function extractCommentBody(raw: string): string {
  const withoutHeader = raw.replace(/\*\*Review decision:.*?\*\*\n*/, '')
  const withoutFooter = withoutHeader.split('---')[0]
  return withoutFooter.trim()
}

async function dispatchPRReview(
  comment: string,
  decision: string,
  onStatusUpdate: (message: string) => void
): Promise<void> {
  onStatusUpdate('Posting your review to the pull request.')

  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowFile: 'submit-pr-review.yml',
      ref: 'main',
      inputs: { prNumber: SEED_PR_NUMBER, comment, decision },
    }),
  })

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.error || `Dispatch failed: ${res.status}`)
  }

  onStatusUpdate('Review posted.')
}
// --- end review ---

// --- begin publish ---
interface PublishChecks {
  runLinkCheck: boolean
  runHeadingCheck: boolean
  runCodeBlockCheck: boolean
  runValeCheck: boolean
}

interface PublishResults {
  resultsContent: string
  finalDraftContent: string
}

async function fetchPublishedFile(path: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${WORKER_URL}file?path=${encodeURIComponent(path)}&ref=publish-results&_=${Date.now()}`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    return data.content || null
  } catch {
    return null
  }
}

async function pollForPublishResults(
  requestId: string,
  onStatusUpdate: (message: string) => void,
  { timeoutMs = 90000, intervalMs = 4000 } = {}
): Promise<PublishResults> {
  const deadline = Date.now() + timeoutMs
  let attempt = 0

  while (Date.now() < deadline) {
    attempt += 1
    onStatusUpdate(`Waiting for the workflow to finish. Attempt ${attempt}.`)

    const resultsContent = await fetchPublishedFile(`publish-results/${requestId}/results.md`)

    if (resultsContent) {
      const finalDraftContent = await fetchPublishedFile(
        `publish-results/${requestId}/quick-start-guide.md`
      )
      onStatusUpdate('Results found.')
      return { resultsContent, finalDraftContent: finalDraftContent || '' }
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new Error('Timed out waiting for the publish results to appear.')
}

async function dispatchPublishWorkflow(
  draftContent: string,
  checks: PublishChecks,
  reviewStatus: ReviewDecisionStatus,
  onStatusUpdate: (message: string) => void
): Promise<{ runUrl: string; requestId: string }> {
  const requestId = crypto.randomUUID()

  onStatusUpdate('Sending your draft and check selection to GitHub.')

  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowFile: 'publish-quickstart.yml',
      ref: 'main',
      inputs: {
        draftContent,
        reviewStatus,
        runLinkCheck: String(checks.runLinkCheck),
        runHeadingCheck: String(checks.runHeadingCheck),
        runCodeBlockCheck: String(checks.runCodeBlockCheck),
        runValeCheck: String(checks.runValeCheck),
        requestId,
      },
    }),
  })

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.error || `Dispatch failed: ${res.status}`)
  }

  onStatusUpdate('Workflow triggered. It usually takes under a minute to finish.')

  return {
    runUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/publish-quickstart.yml`,
    requestId,
  }
}
// --- end publish ---

// --- begin observe ---
interface PublishHistoryEntry {
  requestId: string
  date: string
  reviewStatus: string
  failCount: number
}

function parsePublishCommits(commits: Array<{ commit: { message: string; author: { date: string } } }>): PublishHistoryEntry[] {
  const entries: { requestId: string; date: string }[] = []

  for (const commit of commits) {
    const match = commit.commit.message.match(/Publish results for ([\w-]+)/)
    if (match) {
      entries.push({ requestId: match[1], date: commit.commit.author.date })
    }
  }

  return entries.map((e) => ({ ...e, reviewStatus: 'Loading', failCount: -1 }))
}

async function fetchPublishHistory(): Promise<PublishHistoryEntry[]> {
  try {
    const res = await fetch(`${WORKER_URL}publish-history?_=${Date.now()}`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return []
    }

    const commits = await res.json()
    const entries = parsePublishCommits(commits)

    const detailed = await Promise.all(
      entries.slice(0, 10).map(async (entry) => {
        const resultsContent = await fetchPublishedFile(`publish-results/${entry.requestId}/results.md`)
        if (!resultsContent) {
          return { ...entry, reviewStatus: 'unknown', failCount: 0 }
        }

        const statusMatch = resultsContent.match(/Review status at publish time: (.+)/)
        const failCount = (resultsContent.match(/FAIL/g) || []).length

        return {
          ...entry,
          reviewStatus: statusMatch ? statusMatch[1].trim() : 'unknown',
          failCount,
        }
      })
    )

    return detailed
  } catch {
    return []
  }
}

async function dispatchObserveIssue(
  title: string,
  observation: string,
  recommendation: string,
  onStatusUpdate: (message: string) => void
): Promise<{ url: string; number: number }> {
  const requestId = crypto.randomUUID()

  onStatusUpdate('Sending your observation to GitHub.')

  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowFile: 'create-observe-issue.yml',
      ref: 'main',
      inputs: { title, observation, recommendation, requestId },
    }),
  })

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.error || `Dispatch failed: ${res.status}`)
  }

  onStatusUpdate('Workflow triggered. Waiting for GitHub to create the issue.')

  return findCreatedObserveIssue(requestId, onStatusUpdate)
}

async function findCreatedObserveIssue(
  requestId: string,
  onStatusUpdate: (message: string) => void,
  { timeoutMs = 60000, intervalMs = 3000 } = {}
): Promise<{ url: string; number: number }> {
  const deadline = Date.now() + timeoutMs
  let attempt = 0

  while (Date.now() < deadline) {
    attempt += 1
    onStatusUpdate(`Checking GitHub for your issue. Attempt ${attempt}.`)

    const res = await fetch(
      `${WORKER_URL}poll?type=issues&labels=playground,status:observe&_=${Date.now()}`,
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
// --- end observe ---
// --- end GitHub wiring ---

const STYLE_GUIDE_RULES = [
  'Use plain language. Skip jargon.',
  'Write to the reader as "you."',
  'Use active voice.',
  'Keep sentences short.',
  'Cut filler words like "very," "simply," or "just."',
  'Use a verb, not a noun phrase: say "connect," not "establish connectivity."',
]

const STAGE_ORDER = ['PLAN', 'WRITE', 'REVIEW', 'PUBLISH', 'OBSERVE']

function getStageProgressLabel(stage: string): string {
  const index = STAGE_ORDER.indexOf(stage)
  if (index === -1) {
    return ''
  }
  return `Stage ${index + 1} of ${STAGE_ORDER.length}`
}

function checkStatusLabel(check: CheckResult): string {
  if (check.status !== 'completed') {
    return 'Running'
  }
  if (check.conclusion === 'success') {
    return 'Passed'
  }
  if (check.conclusion === 'failure') {
    return 'Failed'
  }
  return check.conclusion || 'Unknown'
}

const KNOWN_REVIEW_STATUS_LABELS: Record<string, string> = {
  approved: 'Approved',
  'changes-requested': 'Changes requested',
  'not-reviewed': 'Not yet reviewed',
  unknown: 'Unknown',
}

function formatReviewStatusText(raw: string): string {
  const normalized = raw.trim().toLowerCase()
  if (KNOWN_REVIEW_STATUS_LABELS[normalized]) {
    return KNOWN_REVIEW_STATUS_LABELS[normalized]
  }
  return raw
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function reviewStatusClassSuffix(raw: string): string {
  const normalized = raw.trim().toLowerCase()
  if (Object.keys(KNOWN_REVIEW_STATUS_LABELS).includes(normalized)) {
    return normalized
  }
  return 'unknown'
}

function reviewStatusLabel(status: ReviewDecisionStatus): string {
  return KNOWN_REVIEW_STATUS_LABELS[status]
}

export default function ExercisePage({ stage, onBack, onNavigateToStage, cameFromReview }: ExercisePageProps) {
  const [workflowStarted, setWorkflowStarted] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // PLAN
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [issueUrl, setIssueUrl] = useState<string | null>(null)
  const [artifact, setArtifact] = useState({
    title: 'Authentication API Documentation',
    problem: 'Users cannot integrate with the authentication API because documentation does not exist.',
    audience: 'Developers integrating with the authentication API',
    documentationNeeded: 'Quick start guide, API reference, and three integration examples',
    success: 'Developers can authenticate and make their first API request without support.',
  })

  // WRITE
  const [showStyleGuide, setShowStyleGuide] = useState(false)
  const [writeDraft, setWriteDraft] = useState<string>(SEED_DRAFT_CONTENT_FALLBACK)
  const [writeDraftLoading, setWriteDraftLoading] = useState(false)
  const [writeFeedbackComment, setWriteFeedbackComment] = useState<string | null>(null)
  const [writeUpdateStatus, setWriteUpdateStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [writeReviewRequestStatus, setWriteReviewRequestStatus] = useState<'idle' | 'requesting' | 'requested' | 'error'>('idle')

  // REVIEW
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitStatus, setReviewSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [reviewResultUrl, setReviewResultUrl] = useState<string | null>(null)
  const [lastReviewDecision, setLastReviewDecision] = useState<'approve' | 'request-changes' | null>(null)
  const [liveDraftContent, setLiveDraftContent] = useState<string>(SEED_DRAFT_CONTENT_FALLBACK)
  const [draftLoading, setDraftLoading] = useState(false)
  const [checks, setChecks] = useState<CheckResult[] | null>(null)
  const [checksLoading, setChecksLoading] = useState(false)

  // PUBLISH
  const [publishDraft, setPublishDraft] = useState<string>(SEED_DRAFT_CONTENT_FALLBACK)
  const [publishLoading, setPublishLoading] = useState(false)
  const [publishChecks, setPublishChecks] = useState<PublishChecks>({
    runLinkCheck: true,
    runHeadingCheck: true,
    runCodeBlockCheck: true,
    runValeCheck: true,
  })
  const [publishSubmitStatus, setPublishSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [publishRunUrl, setPublishRunUrl] = useState<string | null>(null)
  const [reviewDecisionStatus, setReviewDecisionStatus] = useState<ReviewDecisionStatus | null>(null)
  const [reviewDecisionLoading, setReviewDecisionLoading] = useState(false)
  const [publishResultsContent, setPublishResultsContent] = useState<string | null>(null)
  const [publishFinalDraft, setPublishFinalDraft] = useState<string | null>(null)

  // OBSERVE
  const [publishHistory, setPublishHistory] = useState<PublishHistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [observation, setObservation] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [observeSubmitStatus, setObserveSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [observeIssueUrl, setObserveIssueUrl] = useState<string | null>(null)

  const content = getStageContent(stage)

  useEffect(() => {
    if (stage === 'WRITE' && workflowStarted) {
      setWriteUpdateStatus('idle')
      setWriteReviewRequestStatus('idle')
      setWriteDraftLoading(true)

      fetchSeedDraftContent().then((text) => {
        setWriteDraft(text)
        setWriteDraftLoading(false)
      })

      if (cameFromReview) {
        fetchLatestReviewCommentInfo().then((info) => {
          if (info.status === 'changes-requested' && info.rawComment) {
            setWriteFeedbackComment(extractCommentBody(info.rawComment))
          } else {
            setWriteFeedbackComment(null)
          }
        })
      } else {
        setWriteFeedbackComment(null)
      }
    }

    if (stage === 'REVIEW' && workflowStarted) {
      setDraftLoading(true)
      fetchSeedDraftContent().then((text) => {
        setLiveDraftContent(text)
        setDraftLoading(false)
      })

      setChecksLoading(true)
      fetchSeedPRChecks().then((result) => {
        setChecks(result)
        setChecksLoading(false)
      })
    }

    if (stage === 'PUBLISH' && workflowStarted) {
      setPublishLoading(true)
      fetchSeedDraftContent().then((text) => {
        setPublishDraft(text)
        setPublishLoading(false)
      })

      setReviewDecisionLoading(true)
      fetchLatestReviewCommentInfo().then((info) => {
        setReviewDecisionStatus(info.status)
        setReviewDecisionLoading(false)
      })
    }

    if (stage === 'OBSERVE' && workflowStarted) {
      setHistoryLoading(true)
      fetchPublishHistory().then((entries) => {
        setPublishHistory(entries)
        setHistoryLoading(false)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, workflowStarted, cameFromReview])

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
      setErrorMessage(getErrorMessage(err))
      setSubmitStatus('error')
    }
  }

  async function handleUpdateWriteDraft() {
    if (writeDraft.trim().length < 20) {
      setErrorMessage('Your draft needs at least 20 characters.')
      setWriteUpdateStatus('error')
      return
    }

    if (writeDraft.length > 2000) {
      setErrorMessage('Keep your draft under 2,000 characters.')
      setWriteUpdateStatus('error')
      return
    }

    setWriteUpdateStatus('loading')
    setErrorMessage(null)
    setStatusMessage('')

    try {
      await dispatchUpdateWriteDraft(writeDraft, setStatusMessage)
      setWriteUpdateStatus('success')
    } catch (err) {
      setErrorMessage(getErrorMessage(err))
      setWriteUpdateStatus('error')
    }
  }

  async function handleRequestReviewFromWrite() {
    setWriteReviewRequestStatus('requesting')
    setErrorMessage(null)

    try {
      await dispatchReviewRequest(SEED_PR_NUMBER)
      setWriteReviewRequestStatus('requested')
    } catch (err) {
      setErrorMessage(getErrorMessage(err))
      setWriteReviewRequestStatus('error')
    }
  }

  async function handleSubmitReview(decision: 'approve' | 'request-changes') {
    if (reviewComment.trim().length < 10) {
      setErrorMessage('Add a bit more detail to your comment.')
      setReviewSubmitStatus('error')
      return
    }

    setReviewSubmitStatus('loading')
    setErrorMessage(null)
    setStatusMessage('')

    try {
      const decisionLabel = decision === 'approve' ? 'Approved' : 'Changes requested'
      await dispatchPRReview(reviewComment, decisionLabel, setStatusMessage)
      setReviewResultUrl(SEED_PR_URL)
      setLastReviewDecision(decision)
      setReviewSubmitStatus('success')
    } catch (err) {
      setErrorMessage(getErrorMessage(err))
      setReviewSubmitStatus('error')
    }
  }

  async function handlePublish() {
    if (publishDraft.trim().length < 20) {
      setErrorMessage('The draft is too short to publish.')
      setPublishSubmitStatus('error')
      return
    }

    const anyCheckSelected = Object.values(publishChecks).some(Boolean)
    if (!anyCheckSelected) {
      setErrorMessage('Select at least one check to run.')
      setPublishSubmitStatus('error')
      return
    }

    setPublishSubmitStatus('loading')
    setErrorMessage(null)
    setStatusMessage('')
    setPublishResultsContent(null)
    setPublishFinalDraft(null)

    try {
      const result = await dispatchPublishWorkflow(
        publishDraft,
        publishChecks,
        reviewDecisionStatus ?? 'unknown',
        setStatusMessage
      )
      setPublishRunUrl(result.runUrl)

      const results = await pollForPublishResults(result.requestId, setStatusMessage)
      setPublishResultsContent(results.resultsContent)
      setPublishFinalDraft(results.finalDraftContent)
      setPublishSubmitStatus('success')
    } catch (err) {
      setErrorMessage(getErrorMessage(err))
      setPublishSubmitStatus('error')
    }
  }

  async function handleSubmitObservation() {
    if (observation.trim().length < 10) {
      setErrorMessage('Add a bit more detail to your observation.')
      setObserveSubmitStatus('error')
      return
    }

    if (recommendation.trim().length < 10) {
      setErrorMessage('Add a bit more detail to your recommendation.')
      setObserveSubmitStatus('error')
      return
    }

    setObserveSubmitStatus('loading')
    setErrorMessage(null)
    setStatusMessage('')

    try {
      const result = await dispatchObserveIssue(
        'Documentation observation: NimbusAuth quick start',
        observation,
        recommendation,
        setStatusMessage
      )
      setObserveIssueUrl(result.url)
      setObserveSubmitStatus('success')
    } catch (err) {
      setErrorMessage(getErrorMessage(err))
      setObserveSubmitStatus('error')
    }
  }

  return (
    <div className="exercise-page">
      <div className="exercise-header">
        <button className="back-button" onClick={onBack} type="button">
          Back
        </button>
        <div>
          <p className="stage-progress">{getStageProgressLabel(stage)}</p>
          <h1>{content.exercise.title}</h1>
        </div>
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
            <p>This stage's hands-on exercise isn't built yet.</p>
          </section>
        )}

        {content.isAvailable && !workflowStarted && (
          <section className="exercise-section">
            <button
              className="begin-button"
              type="button"
              onClick={() => setWorkflowStarted(true)}
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
                {submitStatus === 'loading' ? 'Submitting plan.' : 'Submit plan'}
              </button>

              {submitStatus === 'loading' && statusMessage && (
                <p className="status-message status-loading">{statusMessage}</p>
              )}

              {submitStatus === 'success' && issueUrl && (
                <div className="status-message status-success next-step-banner">
                  <p>
                    Issue created.{' '}
                    <a href={issueUrl} target="_blank" rel="noreferrer">
                      View it on GitHub
                    </a>
                  </p>
                  <p className="status-detail">
                    WRITE currently works from one fixed example draft, not the plan you just
                    submitted. Try WRITE to see how a draft gets reviewed and published.
                  </p>
                  <button
                    className="submit-button"
                    type="button"
                    onClick={() => onNavigateToStage('WRITE')}
                  >
                    Go to WRITE
                  </button>
                </div>
              )}

              {submitStatus === 'error' && errorMessage && (
                <p className="status-message status-error">{errorMessage}</p>
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
                <label>Writing for</label>
                <p className="task-text">{FIXED_PLAN.title}</p>
              </div>

              <div className="artifact-field">
                <label>Problem</label>
                <p className="task-text">{FIXED_PLAN.problem}</p>
              </div>

              <div className="artifact-field">
                <label>Audience</label>
                <p className="task-text">{FIXED_PLAN.audience}</p>
              </div>

              {writeFeedbackComment && (
                <div className="artifact-field">
                  <label>Reviewer feedback</label>
                  <p className="task-text reviewer-feedback">{writeFeedbackComment}</p>
                </div>
              )}

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
                <label>Draft</label>
                {writeDraftLoading && <p className="status-message status-loading">Loading the current draft.</p>}
                {!writeDraftLoading && (
                  <textarea
                    rows={14}
                    value={writeDraft}
                    onChange={(e) => setWriteDraft(e.target.value)}
                  />
                )}
              </div>

              <button
                className="submit-button"
                type="button"
                onClick={handleUpdateWriteDraft}
                disabled={writeUpdateStatus === 'loading'}
              >
                {writeUpdateStatus === 'loading'
                  ? 'Updating pull request.'
                  : writeUpdateStatus === 'success'
                  ? 'Save changes'
                  : 'Save draft'}
              </button>

              {writeUpdateStatus === 'loading' && statusMessage && (
                <p className="status-message status-loading">{statusMessage}</p>
              )}

              {writeUpdateStatus === 'success' && (
                <div className="status-message status-success">
                  <p>
                    Draft saved.{' '}
                    <a href={SEED_PR_URL} target="_blank" rel="noreferrer">
                      View the pull request on GitHub
                    </a>
                  </p>

                  {writeReviewRequestStatus === 'idle' && (
                    <button className="submit-button" type="button" onClick={handleRequestReviewFromWrite}>
                      Request review
                    </button>
                  )}

                  {writeReviewRequestStatus === 'requesting' && (
                    <p className="status-message status-loading">Requesting review.</p>
                  )}

                  {writeReviewRequestStatus === 'requested' && (
                    <div>
                      <p className="status-message status-success">
                        Review requested. A reviewer will take a look soon.
                      </p>
                      <button
                        className="submit-button"
                        type="button"
                        onClick={() => onNavigateToStage('REVIEW')}
                      >
                        Go to REVIEW
                      </button>
                    </div>
                  )}

                  {writeReviewRequestStatus === 'error' && errorMessage && (
                    <p className="status-message status-error">{errorMessage}</p>
                  )}
                </div>
              )}

              {writeUpdateStatus === 'error' && errorMessage && (
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
                <p className="task-text">{FIXED_PLAN.successCriteria}</p>
              </div>

              <div className="artifact-field">
                <label>Related reference</label>
                <a href={RELATED_REFERENCE_URL} target="_blank" rel="noreferrer">
                  NimbusAuth API Reference
                </a>
              </div>

              <div className="artifact-field">
                <label>Pull request under review</label>
                <a href={SEED_PR_URL} target="_blank" rel="noreferrer">
                  View the pull request on GitHub
                </a>
              </div>

              <div className="artifact-field">
                <label>Checks</label>
                {checksLoading && <p className="status-message status-loading">Loading checks.</p>}
                {!checksLoading && checks && checks.length > 0 && (
                  <ul className="checks-list">
                    {checks.map((check) => (
                      <li key={check.id} className={`check-item check-${checkStatusLabel(check).toLowerCase()}`}>
                        {checkDisplayName(check)}: {checkStatusLabel(check)}
                      </li>
                    ))}
                  </ul>
                )}
                {!checksLoading && (!checks || checks.length === 0) && (
                  <p className="task-text">No check results available.</p>
                )}
              </div>

              <div className="artifact-field">
                <label>Draft content</label>
                {draftLoading && <p className="status-message status-loading">Loading the draft.</p>}
                {!draftLoading && (
                  <div className="draft-preview-rendered">
                    <MarkdownPreview content={liveDraftContent} />
                  </div>
                )}
              </div>

              {reviewSubmitStatus !== 'success' && (
                <>
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
                      className="decision-button approve"
                      onClick={() => handleSubmitReview('approve')}
                      disabled={reviewSubmitStatus === 'loading'}
                    >
                      {reviewSubmitStatus === 'loading' ? 'Submitting.' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      className="decision-button"
                      onClick={() => handleSubmitReview('request-changes')}
                      disabled={reviewSubmitStatus === 'loading'}
                    >
                      {reviewSubmitStatus === 'loading' ? 'Submitting.' : 'Request changes'}
                    </button>
                  </div>
                </>
              )}

              {reviewSubmitStatus === 'success' && reviewResultUrl && lastReviewDecision === 'approve' && (
                <div className="status-message status-success next-step-banner">
                  <p>
                    Approved.{' '}
                    <a href={reviewResultUrl} target="_blank" rel="noreferrer">
                      View the comment on GitHub
                    </a>
                  </p>
                  <p>This draft is ready to publish.</p>
                  <button
                    className="submit-button"
                    type="button"
                    onClick={() => onNavigateToStage('PUBLISH')}
                  >
                    Go to PUBLISH
                  </button>
                </div>
              )}

              {reviewSubmitStatus === 'success' && reviewResultUrl && lastReviewDecision === 'request-changes' && (
                <div className="status-message status-error next-step-banner">
                  <p>
                    Changes requested.{' '}
                    <a href={reviewResultUrl} target="_blank" rel="noreferrer">
                      View the comment on GitHub
                    </a>
                  </p>
                  <p>The draft is back in WRITE. A writer needs to address this feedback.</p>
                  <button
  className="submit-button"
  type="button"
  onClick={() => onNavigateToStage('WRITE', true)}
>
  Go to WRITE
</button>
                </div>
              )}

              {reviewSubmitStatus === 'error' && errorMessage && (
                <p className="status-message status-error">{errorMessage}</p>
              )}
            </div>
          </section>
        )}

        {content.isAvailable && workflowStarted && stage === 'PUBLISH' && (
          <section className="artifact-section">
            <div className="artifact-header">
              <h2>Check and publish</h2>
            </div>

            <div className="artifact-card">
              <div className="artifact-field">
                <label>Review status</label>
                {reviewDecisionLoading && (
                  <p className="status-message status-loading">Checking review status.</p>
                )}
                {!reviewDecisionLoading && reviewDecisionStatus && (
                  <p className={`review-status-badge review-status-${reviewStatusClassSuffix(reviewDecisionStatus)}`}>
                    {reviewStatusLabel(reviewDecisionStatus)}
                  </p>
                )}
              </div>

              {!reviewDecisionLoading && reviewDecisionStatus && reviewDecisionStatus !== 'approved' && (
                <div className="modified-banner">
                  <p>
                    {reviewDecisionStatus === 'changes-requested'
                      ? 'A reviewer requested changes on this draft. Publishing now will mark it as not reviewed.'
                      : reviewDecisionStatus === 'not-reviewed'
                      ? 'This draft has not been reviewed yet.'
                      : 'The review status could not be confirmed.'}
                  </p>
                  <button
  type="button"
  className="style-guide-toggle"
  onClick={() =>
    onNavigateToStage(
      reviewDecisionStatus === 'changes-requested' ? 'WRITE' : 'REVIEW',
      reviewDecisionStatus === 'changes-requested'
    )
  }
>
  {reviewDecisionStatus === 'changes-requested' ? 'Go to WRITE' : 'Go to REVIEW'}
</button>
                </div>
              )}

              <div className="artifact-field">
                <label>Draft, as currently written in WRITE</label>
                {publishLoading && <p className="status-message status-loading">Loading the draft.</p>}
                {!publishLoading && (
                  <div className="draft-preview-rendered">
                    <MarkdownPreview content={publishDraft} />
                  </div>
                )}
              </div>

              <div className="artifact-field">
                <label>Checks to run</label>
                <div className="checkbox-list">
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={publishChecks.runLinkCheck}
                      onChange={(e) =>
                        setPublishChecks({ ...publishChecks, runLinkCheck: e.target.checked })
                      }
                    />
                    Link check
                  </label>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={publishChecks.runHeadingCheck}
                      onChange={(e) =>
                        setPublishChecks({ ...publishChecks, runHeadingCheck: e.target.checked })
                      }
                    />
                    Heading structure check
                  </label>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={publishChecks.runCodeBlockCheck}
                      onChange={(e) =>
                        setPublishChecks({ ...publishChecks, runCodeBlockCheck: e.target.checked })
                      }
                    />
                    Code block formatting check
                  </label>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={publishChecks.runValeCheck}
                      onChange={(e) =>
                        setPublishChecks({ ...publishChecks, runValeCheck: e.target.checked })
                      }
                    />
                    Vale style check
                  </label>
                </div>
              </div>

              <button
                className="submit-button"
                type="button"
                onClick={handlePublish}
                disabled={publishSubmitStatus === 'loading'}
              >
                {publishSubmitStatus === 'loading' ? 'Running checks.' : 'Run checks and publish'}
              </button>

              {publishSubmitStatus === 'loading' && statusMessage && (
                <p className="status-message status-loading">{statusMessage}</p>
              )}

              {publishSubmitStatus === 'success' && publishResultsContent && (
                <div className="status-message status-success">
                  <p>Published. Results are shown below.</p>

                  <div className="artifact-field">
                    <label>Check results</label>
                    <div className="draft-preview-rendered">
                      <MarkdownPreview content={publishResultsContent} />
                    </div>
                  </div>

                  {publishFinalDraft && (
                    <div className="artifact-field">
                      <label>Published content</label>
                      <div className="draft-preview-rendered">
                        <MarkdownPreview content={publishFinalDraft} />
                      </div>
                    </div>
                  )}

                  {publishRunUrl && (
  <p className="status-detail">
    <a href={publishRunUrl} target="_blank" rel="noreferrer">
      View the full workflow run on GitHub
    </a>
  </p>
)}

<button
  className="submit-button"
  type="button"
  onClick={() => onNavigateToStage('OBSERVE')}
>
  Go to OBSERVE
</button>

              {publishSubmitStatus === 'error' && errorMessage && (
                <p className="status-message status-error">{errorMessage}</p>
              )}
            </div>
          </section>
        )}

        {content.isAvailable && workflowStarted && stage === 'OBSERVE' && (
          <section className="artifact-section">
            <div className="artifact-header">
              <h2>Publish history</h2>
            </div>

            <div className="artifact-card">
              {historyLoading && <p className="status-message status-loading">Loading history.</p>}

              {!historyLoading && publishHistory.length === 0 && (
                <p className="task-text">
                  No publish history yet. Try PUBLISH first, then come back here.
                </p>
              )}

              {!historyLoading && publishHistory.length > 0 && (
                <ul className="history-list">
                  {publishHistory.map((entry, index) => (
                    <li key={index} className="history-item">
                      <div>
                        <strong>{new Date(entry.date).toLocaleString()}</strong>
                        <span
                          className={`review-status-badge review-status-${reviewStatusClassSuffix(entry.reviewStatus)}`}
                        >
                          {' '}{formatReviewStatusText(entry.reviewStatus)}
                        </span>
                      </div>
                      <p className="task-text">
                        {entry.failCount === 0
                          ? 'All selected checks passed.'
                          : `${entry.failCount} check line(s) flagged FAIL.`}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="artifact-field">
                <label>What did you observe</label>
                <textarea
                  rows={4}
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="What pattern or issue do you see in the history above?"
                />
              </div>

              <div className="artifact-field">
                <label>What should happen next</label>
                <textarea
                  rows={4}
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  placeholder="What would you recommend doing about it?"
                />
              </div>

              <button
                className="submit-button"
                type="button"
                onClick={handleSubmitObservation}
                disabled={observeSubmitStatus === 'loading'}
              >
                {observeSubmitStatus === 'loading' ? 'Filing issue.' : 'File an issue'}
              </button>

              {observeSubmitStatus === 'loading' && statusMessage && (
                <p className="status-message status-loading">{statusMessage}</p>
              )}

              {observeSubmitStatus === 'success' && observeIssueUrl && (
                <p className="status-message status-success">
                  Issue created.{' '}
                  <a href={observeIssueUrl} target="_blank" rel="noreferrer">
                    View it on GitHub
                  </a>
                </p>
              )}

              {observeSubmitStatus === 'error' && errorMessage && (
                <p className="status-message status-error">{errorMessage}</p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
