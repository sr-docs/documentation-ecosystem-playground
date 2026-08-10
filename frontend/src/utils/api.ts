import {
  WORKER_URL,
  GITHUB_OWNER,
  GITHUB_REPO,
  WORKFLOWS,
  POLLING_DEFAULTS,
  ERROR_MESSAGES,
} from '../constants'

export interface PlanInputs {
  title: string
  problem: string
  audience: string
  documentationNeeded: string
  successCriteria: string
}

export interface Track {
  id: string
  title: string
  description: string
  seedDraftPath: string
  seedDraftBranch: string
  seedPrUrl: string
  seedPrNumber: string
  relatedReferenceUrl: string
  referenceLabel: string
  fallbackContent: string
  plan: {
    title: string
    problem: string
    audience: string
    documentationNeeded: string
    successCriteria: string
  }
}

export interface CheckResult {
  id: number
  name: string
  status: string
  conclusion: string | null
}

export interface PublishChecks {
  runLinkCheck: boolean
  runHeadingCheck: boolean
  runCodeBlockCheck: boolean
  runConsistencyCheck: boolean
  runAccuracyCheck: boolean
  runValeCheck: boolean
}

export interface PublishResults {
  resultsContent: string
  finalDraftContent: string
}

export interface PublishHistoryEntry {
  requestId: string
  date: string
  reviewStatus: string
  failCount: number
}

type ReviewDecisionStatus = 'approved' | 'changes-requested' | 'not-reviewed' | 'unknown'

export function getErrorMessage(err: unknown): string {
  if (err instanceof TypeError) {
    return ERROR_MESSAGES.NETWORK_ERROR
  }
  if (err instanceof Error) {
    return err.message
  }
  return ERROR_MESSAGES.GENERIC_ERROR
}

interface PollOptions {
  timeoutMs?: number
  intervalMs?: number
  signal?: AbortSignal
}

export async function pollUntil<T>(
  checkFn: () => Promise<T | null>,
  onStatusUpdate: (message: string, attempt: number) => void,
  statusTemplate: string,
  options: PollOptions = {}
): Promise<T> {
  const {
    timeoutMs = POLLING_DEFAULTS.TIMEOUT_MS,
    intervalMs = POLLING_DEFAULTS.INTERVAL_MS,
    signal,
  } = options

  const deadline = Date.now() + timeoutMs
  let attempt = 0

  while (Date.now() < deadline) {
    if (signal?.aborted) {
      throw new Error('Operation cancelled')
    }

    attempt += 1
    onStatusUpdate(`${statusTemplate} Attempt ${attempt}.`, attempt)

    const result = await checkFn()
    if (result !== null) {
      return result
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR)
}

async function dispatchWorkflow(
  workflowFile: string,
  inputs: Record<string, string>
): Promise<void> {
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowFile,
      ref: 'main',
      inputs,
    }),
  })

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.error || `Dispatch failed: ${res.status}`)
  }
}

export async function createPlanIssue(
  inputs: PlanInputs,
  onStatusUpdate: (message: string) => void
): Promise<{ url: string; number: number }> {
  const requestId = crypto.randomUUID()

  onStatusUpdate('Sending your request to GitHub...')

  await dispatchWorkflow(WORKFLOWS.CREATE_PLAN_ISSUE, {
    ...inputs,
    requestId,
  })

  onStatusUpdate('Workflow triggered. Waiting for GitHub to create the issue...')

  return pollUntil(
    async () => {
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?labels=playground,status:plan&state=all&sort=created&direction=desc&per_page=10&_=${Date.now()}`,
        { cache: 'no-store' }
      )

      if (!res.ok) return null

      const issues = await res.json()
      const match = issues.find((issue: { body?: string }) =>
        issue.body?.includes(`request-id: ${requestId}`)
      )

      if (match) {
        onStatusUpdate('Issue found.')
        return { url: match.html_url, number: match.number }
      }
      return null
    },
    onStatusUpdate,
    'Checking GitHub for your issue.'
  )
}

export async function fetchDraftContent(track: Track): Promise<string> {
  try {
    const res = await fetch(
      `${WORKER_URL}file?path=${encodeURIComponent(track.seedDraftPath)}&ref=${encodeURIComponent(track.seedDraftBranch)}&_=${Date.now()}`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      return track.fallbackContent
    }

    const data = await res.json()
    return data.content || track.fallbackContent
  } catch {
    return track.fallbackContent
  }
}

export async function updateWriteDraft(
  track: Track,
  draftContent: string,
  onStatusUpdate: (message: string) => void
): Promise<void> {
  const requestId = crypto.randomUUID()

  onStatusUpdate('Sending your draft to GitHub...')

  await dispatchWorkflow(WORKFLOWS.UPDATE_WRITE_PR, {
    draftContent,
    branch: track.seedDraftBranch,
    filePath: track.seedDraftPath,
    requestId,
  })

  onStatusUpdate('Updating the pull request. This can take a moment...')

  await pollUntil(
    async () => {
      const current = await fetchDraftContent(track)
      if (current.trim() === draftContent.trim()) {
        onStatusUpdate('Draft updated.')
        return true
      }
      return null
    },
    onStatusUpdate,
    'Confirming the update.',
    { timeoutMs: POLLING_DEFAULTS.LONG_TIMEOUT_MS, intervalMs: POLLING_DEFAULTS.LONG_INTERVAL_MS }
  )
}

export async function requestReview(prNumber: string): Promise<void> {
  await dispatchWorkflow(WORKFLOWS.REQUEST_WRITE_REVIEW, { prNumber })
}

export async function fetchPRChecks(track: Track): Promise<CheckResult[] | null> {
  try {
    const pullsRes = await fetch(
      `${WORKER_URL}poll?type=pulls&_=${Date.now()}`,
      { cache: 'no-store' }
    )

    if (!pullsRes.ok) return null

    const pulls = await pullsRes.json()
    const pr = pulls.find((p: { number: number }) => String(p.number) === track.seedPrNumber)

    if (!pr) return null

    const checksRes = await fetch(
      `${WORKER_URL}checks?sha=${pr.head.sha}&_=${Date.now()}`,
      { cache: 'no-store' }
    )

    if (!checksRes.ok) return null

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

export interface ReviewCommentInfo {
  status: ReviewDecisionStatus
  rawComment: string | null
}

export async function fetchReviewCommentInfo(track: Track, attempts = 3): Promise<ReviewCommentInfo> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(
        `${WORKER_URL}pr-comments?prNumber=${track.seedPrNumber}&_=${Date.now()}`,
        { cache: 'no-store' }
      )

      if (res.ok) {
        const comments = await res.json()

        if (!Array.isArray(comments) || comments.length === 0) {
          return { status: 'not-reviewed', rawComment: null }
        }

        let latest: { body?: string } | undefined
        for (let i = comments.length - 1; i >= 0; i--) {
          const c = comments[i]
          if (c && typeof c.body === 'string' && c.body.includes('Review decision:')) {
            latest = c
            break
          }
        }

        if (!latest) {
          return { status: 'not-reviewed', rawComment: null }
        }

        let status: ReviewDecisionStatus = 'unknown'
        if (latest.body!.includes('Review decision: Approved')) {
          status = 'approved'
        } else if (latest.body!.includes('Review decision: Changes requested')) {
          status = 'changes-requested'
        }

        return { status, rawComment: latest.body! }
      }
    } catch {
      // fall through and retry
    }

    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, 700))
    }
  }

  return { status: 'unknown', rawComment: null }
}

export function extractCommentBody(raw: string): string {
  const withoutHeader = raw.replace(/\*\*Review decision:.*?\*\*\n*/, '')
  const withoutFooter = withoutHeader.split('---')[0]
  return withoutFooter.trim()
}

export async function submitPRReview(
  track: Track,
  comment: string,
  decision: string,
  onStatusUpdate: (message: string) => void
): Promise<void> {
  onStatusUpdate('Posting your review to the pull request...')

  await dispatchWorkflow(WORKFLOWS.SUBMIT_PR_REVIEW, {
    prNumber: track.seedPrNumber,
    comment,
    decision,
  })

  onStatusUpdate('Review posted.')
}

async function fetchPublishedFile(path: string, attempts = 3): Promise<string | null> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(
        `${WORKER_URL}file?path=${encodeURIComponent(path)}&ref=publish-results&_=${Date.now()}`,
        { cache: 'no-store' }
      )

      if (res.ok) {
        const data = await res.json()
        if (data.content) {
          return data.content
        }
      }
    } catch {
      // fall through and retry
    }

    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, 700))
    }
  }

  return null
}

export async function runChecks(
  draftContent: string,
  checks: PublishChecks,
  reviewStatus: ReviewDecisionStatus,
  onStatusUpdate: (message: string) => void
): Promise<string> {
  const requestId = crypto.randomUUID()

  onStatusUpdate('Sending your draft and check selection to GitHub...')

  await dispatchWorkflow(WORKFLOWS.RUN_CHECKS, {
    draftContent,
    reviewStatus,
    runLinkCheck: String(checks.runLinkCheck),
    runHeadingCheck: String(checks.runHeadingCheck),
    runCodeBlockCheck: String(checks.runCodeBlockCheck),
    runConsistencyCheck: String(checks.runConsistencyCheck),
    runAccuracyCheck: String(checks.runAccuracyCheck),
    runValeCheck: String(checks.runValeCheck),
    requestId,
  })

  onStatusUpdate('Workflow triggered. It usually takes under a minute to finish...')

  return pollUntil(
    async () => {
      const resultsContent = await fetchPublishedFile(`publish-results/${requestId}/results.md`)
      if (resultsContent) {
        onStatusUpdate('Results found.')
        return resultsContent
      }
      return null
    },
    onStatusUpdate,
    'Waiting for checks to finish.',
    { timeoutMs: POLLING_DEFAULTS.PUBLISH_TIMEOUT_MS, intervalMs: POLLING_DEFAULTS.PUBLISH_INTERVAL_MS }
  )
}

export async function publishDraft(
  draftContent: string,
  checks: PublishChecks,
  reviewStatus: ReviewDecisionStatus,
  onStatusUpdate: (message: string) => void
): Promise<PublishResults> {
  const requestId = crypto.randomUUID()

  onStatusUpdate('Sending your draft and check selection to GitHub...')

  await dispatchWorkflow(WORKFLOWS.PUBLISH_QUICKSTART, {
    draftContent,
    reviewStatus,
    runLinkCheck: String(checks.runLinkCheck),
    runHeadingCheck: String(checks.runHeadingCheck),
    runCodeBlockCheck: String(checks.runCodeBlockCheck),
    runConsistencyCheck: String(checks.runConsistencyCheck),
    runAccuracyCheck: String(checks.runAccuracyCheck),
    runValeCheck: String(checks.runValeCheck),
    requestId,
  })

  onStatusUpdate('Workflow triggered. It usually takes under a minute to finish...')

  return pollUntil(
    async () => {
      const resultsContent = await fetchPublishedFile(`publish-results/${requestId}/results.md`)
      if (resultsContent) {
        const finalDraftContent = await fetchPublishedFile(
          `publish-results/${requestId}/quick-start-guide.md`
        )
        onStatusUpdate('Results found.')
        return { resultsContent, finalDraftContent: finalDraftContent || '' }
      }
      return null
    },
    onStatusUpdate,
    'Waiting for the workflow to finish.',
    { timeoutMs: POLLING_DEFAULTS.PUBLISH_TIMEOUT_MS, intervalMs: POLLING_DEFAULTS.PUBLISH_INTERVAL_MS }
  )
}

export function checkResultsHaveFailure(resultsContent: string): boolean {
  return resultsContent.includes('FAIL') || /^E\d{3}/m.test(resultsContent)
}

function parsePublishCommits(
  commits: Array<{ commit: { message: string; author: { date: string } } }>
): PublishHistoryEntry[] {
  const entries: { requestId: string; date: string }[] = []

  for (const commit of commits) {
    const match = commit.commit.message.match(/Publish results for ([\w-]+)/)
    if (match) {
      entries.push({ requestId: match[1], date: commit.commit.author.date })
    }
  }

  return entries.map((e) => ({ ...e, reviewStatus: 'Loading', failCount: -1 }))
}

export async function fetchPublishHistory(): Promise<PublishHistoryEntry[]> {
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

export async function createObserveIssue(
  title: string,
  notes: string,
  onStatusUpdate: (message: string) => void
): Promise<{ url: string; number: number }> {
  const requestId = crypto.randomUUID()

  onStatusUpdate('Sending your observation to GitHub...')

  await dispatchWorkflow(WORKFLOWS.CREATE_OBSERVE_ISSUE, {
    title,
    notes,
    requestId,
  })

  onStatusUpdate('Workflow triggered. Waiting for GitHub to create the issue...')

  return pollUntil(
    async () => {
      const res = await fetch(
        `${WORKER_URL}poll?type=issues&labels=playground,status:observe&_=${Date.now()}`,
        { cache: 'no-store' }
      )

      if (!res.ok) return null

      const issues = await res.json()
      const match = issues.find((issue: { body?: string }) =>
        issue.body?.includes(`request-id: ${requestId}`)
      )

      if (match) {
        onStatusUpdate('Issue found.')
        return { url: match.html_url, number: match.number }
      }
      return null
    },
    onStatusUpdate,
    'Checking GitHub for your issue.',
    { timeoutMs: POLLING_DEFAULTS.LONG_TIMEOUT_MS, intervalMs: POLLING_DEFAULTS.LONG_INTERVAL_MS }
  )
}
