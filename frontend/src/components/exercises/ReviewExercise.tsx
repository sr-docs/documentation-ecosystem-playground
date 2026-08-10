import { useState, useEffect, useCallback } from 'react'
import { Button, LoadingStatus, SuccessStatus, ErrorStatus } from '../ui'
import { TrackPicker } from '../TrackPicker'
import { MarkdownPreview } from '../MarkdownPreview'
import { DraftSkeleton } from '../ui/Skeleton'
import { getTrack } from '../../data/tracks'
import {
  fetchDraftContent,
  fetchPRChecks,
  submitPRReview,
  getErrorMessage,
  type CheckResult,
} from '../../utils/api'
import { CHECK_NAME_LABELS, VALIDATION, ERROR_MESSAGES } from '../../constants'

interface ReviewExerciseProps {
  onNavigateToStage: (stage: string, fromReviewFeedback?: boolean) => void
  selectedTrackId: string
  onSelectTrack: (id: string) => void
  onStageComplete?: () => void
}

function checkDisplayName(check: CheckResult): string {
  return CHECK_NAME_LABELS[check.name] || check.name
}

function checkStatusLabel(check: CheckResult): string {
  if (check.status !== 'completed') return 'Running'
  if (check.conclusion === 'success') return 'Passed'
  if (check.conclusion === 'failure') return 'Failed'
  return check.conclusion || 'Unknown'
}

export function ReviewExercise({
  onNavigateToStage,
  selectedTrackId,
  onSelectTrack,
  onStageComplete,
}: ReviewExerciseProps) {
  const track = getTrack(selectedTrackId)

  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitStatus, setReviewSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [reviewResultUrl, setReviewResultUrl] = useState<string | null>(null)
  const [lastReviewDecision, setLastReviewDecision] = useState<'approve' | 'request-changes' | null>(null)
  const [liveDraftContent, setLiveDraftContent] = useState('')
  const [draftLoading, setDraftLoading] = useState(false)
  const [checks, setChecks] = useState<CheckResult[] | null>(null)
  const [checksLoading, setChecksLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setReviewComment('')
    setReviewSubmitStatus('idle')
    setReviewResultUrl(null)
    setLastReviewDecision(null)

    setDraftLoading(true)
    fetchDraftContent(track).then((text) => {
      setLiveDraftContent(text)
      setDraftLoading(false)
    })

    setChecksLoading(true)
    fetchPRChecks(track).then((result) => {
      setChecks(result)
      setChecksLoading(false)
    })
  }, [selectedTrackId, track])

  const handleSubmitReview = useCallback(async (decision: 'approve' | 'request-changes') => {
    if (reviewComment.trim().length < VALIDATION.MIN_COMMENT_LENGTH) {
      setErrorMessage(ERROR_MESSAGES.COMMENT_TOO_SHORT)
      setReviewSubmitStatus('error')
      return
    }

    setReviewSubmitStatus('loading')
    setErrorMessage(null)
    setStatusMessage('')

    try {
      const decisionLabel = decision === 'approve' ? 'Approved' : 'Changes requested'
      await submitPRReview(track, reviewComment, decisionLabel, setStatusMessage)
      setReviewResultUrl(track.seedPrUrl)
      setLastReviewDecision(decision)
      setReviewSubmitStatus('success')
      onStageComplete?.()
    } catch (err) {
      setErrorMessage(getErrorMessage(err))
      setReviewSubmitStatus('error')
    }
  }, [track, reviewComment])

  return (
    <section className="artifact-section" aria-labelledby="review-heading">
      <div className="artifact-header">
        <h2 id="review-heading">Draft under review</h2>
      </div>

      <div className="artifact-card">
        <table className="field-table">
          <tbody>
            <tr>
              <th scope="row">Choose what to review</th>
              <td>
                <TrackPicker 
                  selectedTrackId={selectedTrackId} 
                  onSelect={onSelectTrack}
                  label="Select a draft to review"
                />
              </td>
            </tr>
            <tr>
              <th scope="row">Success criteria</th>
              <td>{track.plan.successCriteria}</td>
            </tr>
            <tr>
              <th scope="row">Check against</th>
              <td>
                <a href={track.relatedReferenceUrl} target="_blank" rel="noreferrer">
                  {track.referenceLabel}
                </a>
              </td>
            </tr>
            <tr>
              <th scope="row">Pull request</th>
              <td>
                <a href={track.seedPrUrl} target="_blank" rel="noreferrer">
                  View on GitHub
                </a>
              </td>
            </tr>
            <tr>
              <th scope="row">Automated checks</th>
              <td>
                {checksLoading && <LoadingStatus message="Loading checks..." />}
                {!checksLoading && checks && checks.length > 0 && (
                  <ul className="checks-list" role="list" aria-label="Check results">
                    {checks.map((check) => (
                      <li 
                        key={check.id} 
                        className={`check-item check-${checkStatusLabel(check).toLowerCase()}`}
                      >
                        {checkDisplayName(check)}: {checkStatusLabel(check)}
                      </li>
                    ))}
                  </ul>
                )}
                {!checksLoading && (!checks || checks.length === 0) && (
                  <p className="task-text">No check results available.</p>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="artifact-field">
          <label id="draft-preview-label">The draft</label>
          {draftLoading ? (
            <DraftSkeleton />
          ) : (
            <div 
              className="draft-preview-rendered" 
              aria-labelledby="draft-preview-label"
              role="article"
            >
              <MarkdownPreview content={liveDraftContent} />
            </div>
          )}
        </div>

        {reviewSubmitStatus !== 'success' && (
          <>
            <div className="artifact-field">
              <label htmlFor="review-comment">Your comment</label>
              <span className="field-helper">
                What did you notice in this draft? Be specific.
              </span>
              <textarea
                id="review-comment"
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="The draft says X, but the reference shows Y..."
              />
            </div>

            <div className="review-decision-row" role="group" aria-label="Review decision">
              <Button
                variant="primary"
                className="decision-button approve"
                onClick={() => handleSubmitReview('approve')}
                loading={reviewSubmitStatus === 'loading'}
                loadingText="Posting your review..."
              >
                Approve
              </Button>
              <Button
                variant="secondary"
                className="decision-button"
                onClick={() => handleSubmitReview('request-changes')}
                loading={reviewSubmitStatus === 'loading'}
                loadingText="Posting your review..."
              >
                Request changes
              </Button>
            </div>

            {reviewSubmitStatus === 'loading' && statusMessage && (
              <LoadingStatus message={statusMessage} />
            )}
          </>
        )}

        {reviewSubmitStatus === 'success' && reviewResultUrl && lastReviewDecision === 'approve' && (
          <SuccessStatus
            message="Approved."
            linkUrl={reviewResultUrl}
            linkText="View the comment on GitHub"
          >
            <p>This draft is ready to publish.</p>
            <Button variant="primary" onClick={() => onNavigateToStage('PUBLISH')}>
              Continue to PUBLISH
            </Button>
          </SuccessStatus>
        )}

        {reviewSubmitStatus === 'success' && reviewResultUrl && lastReviewDecision === 'request-changes' && (
          <div className="status-message status-error next-step-banner">
            <p>
              Changes requested.{' '}
              <a href={reviewResultUrl} target="_blank" rel="noreferrer">
                View the comment on GitHub
              </a>
            </p>
            <p>The draft is back with the writer to address your feedback.</p>
            <Button variant="primary" onClick={() => onNavigateToStage('WRITE', true)}>
              Continue to WRITE
            </Button>
          </div>
        )}

        {reviewSubmitStatus === 'error' && errorMessage && (
          <ErrorStatus 
            message={errorMessage} 
            onRetry={() => setReviewSubmitStatus('idle')} 
          />
        )}
      </div>
    </section>
  )
}
