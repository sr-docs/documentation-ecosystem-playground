import { useState, useEffect, useCallback } from 'react'
import { Button, LoadingStatus, SuccessStatus, ErrorStatus } from '../ui'
import { HistorySkeleton } from '../ui/Skeleton'
import {
  fetchPublishHistory,
  createObserveIssue,
  getErrorMessage,
  type PublishHistoryEntry,
} from '../../utils/api'
import { REVIEW_STATUS_LABELS, VALIDATION, ERROR_MESSAGES } from '../../constants'

interface ObserveExerciseProps {
  onNavigateToStage: (stage: string) => void
  onStageComplete?: () => void
}

function formatReviewStatusText(raw: string): string {
  const normalized = raw.trim().toLowerCase()
  if (REVIEW_STATUS_LABELS[normalized]) {
    return REVIEW_STATUS_LABELS[normalized]
  }
  return raw
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function reviewStatusClassSuffix(raw: string): string {
  const normalized = raw.trim().toLowerCase()
  if (Object.keys(REVIEW_STATUS_LABELS).includes(normalized)) {
    return normalized
  }
  return 'unknown'
}

export function ObserveExercise({ onNavigateToStage, onStageComplete }: ObserveExerciseProps) {
  const [publishHistory, setPublishHistory] = useState<PublishHistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [observationNotes, setObservationNotes] = useState('')
  const [observeSubmitStatus, setObserveSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [observeIssueUrl, setObserveIssueUrl] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setHistoryLoading(true)
    fetchPublishHistory().then((entries) => {
      setPublishHistory(entries)
      setHistoryLoading(false)
    })
  }, [])

  const handleSubmitObservation = useCallback(async () => {
    if (observationNotes.trim().length < VALIDATION.MIN_OBSERVATION_LENGTH) {
      setErrorMessage(ERROR_MESSAGES.OBSERVATION_TOO_SHORT)
      setObserveSubmitStatus('error')
      return
    }

    setObserveSubmitStatus('loading')
    setErrorMessage(null)
    setStatusMessage('')

    try {
      const result = await createObserveIssue(
        'Documentation observation: NimbusAuth quick start',
        observationNotes,
        setStatusMessage
      )
      setObserveIssueUrl(result.url)
      setObserveSubmitStatus('success')
      onStageComplete?.()
    } catch (err) {
      setErrorMessage(getErrorMessage(err))
      setObserveSubmitStatus('error')
    }
  }, [observationNotes])

  return (
    <section className="artifact-section" aria-labelledby="observe-heading">
      <div className="artifact-header">
        <h2 id="observe-heading">What's actually happened here</h2>
      </div>

      <div className="artifact-card">
        {historyLoading && <HistorySkeleton />}

        {!historyLoading && publishHistory.length === 0 && (
          <div className="modified-banner" role="status">
            <p>No publish history yet.</p>
            <Button variant="ghost" onClick={() => onNavigateToStage('PUBLISH')}>
              Try PUBLISH first
            </Button>
          </div>
        )}

        {!historyLoading && publishHistory.length > 0 && (
          <ul className="history-list" role="list" aria-label="Publish history">
            {publishHistory.map((entry, index) => (
              <li key={index} className="history-item">
                <div>
                  <strong>
                    <time dateTime={entry.date}>
                      {new Date(entry.date).toLocaleString()}
                    </time>
                  </strong>
                  <span
                    className={`review-status-badge review-status-${reviewStatusClassSuffix(entry.reviewStatus)}`}
                  >
                    {' '}{formatReviewStatusText(entry.reviewStatus)}
                  </span>
                </div>
                <p className="task-text">
                  {entry.failCount === 0
                    ? 'All checks passed.'
                    : `${entry.failCount} check${entry.failCount === 1 ? '' : 's'} found a problem.`}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="artifact-field">
          <label htmlFor="observation-notes">Your observation</label>
          <span className="field-helper">
            What pattern or issue do you see in the history? What should happen next?
          </span>
          <textarea
            id="observation-notes"
            rows={5}
            value={observationNotes}
            onChange={(e) => setObservationNotes(e.target.value)}
            placeholder="I noticed that... We should..."
          />
        </div>

        <Button
          variant="primary"
          onClick={handleSubmitObservation}
          loading={observeSubmitStatus === 'loading'}
          loadingText="Logging your observation..."
          disabled={observeSubmitStatus === 'success'}
        >
          Log observation
        </Button>

        <p className="status-detail">
          This becomes a real GitHub issue, the same way a team would track it.
        </p>

        {observeSubmitStatus === 'loading' && statusMessage && (
          <LoadingStatus message={statusMessage} />
        )}

        {observeSubmitStatus === 'success' && observeIssueUrl && (
          <SuccessStatus
            message="Issue created."
            linkUrl={observeIssueUrl}
            linkText="View it on GitHub"
          >
            <p>
              You've completed the full workflow: PLAN → WRITE → REVIEW → PUBLISH → OBSERVE.
            </p>
            <Button variant="secondary" onClick={() => onNavigateToStage('PLAN')}>
              Start a new cycle
            </Button>
          </SuccessStatus>
        )}

        {observeSubmitStatus === 'error' && errorMessage && (
          <ErrorStatus 
            message={errorMessage} 
            onRetry={() => setObserveSubmitStatus('idle')} 
          />
        )}
      </div>
    </section>
  )
}
