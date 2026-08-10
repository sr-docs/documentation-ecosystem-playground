import { useState, useEffect, useCallback } from 'react'
import { Button, LoadingStatus, SuccessStatus, ErrorStatus } from '../ui'
import { TrackPicker } from '../TrackPicker'
import { useSaveShortcut } from '../../hooks'
import { getTrack } from '../../data/tracks'
import {
  fetchDraftContent,
  updateWriteDraft,
  requestReview,
  fetchReviewCommentInfo,
  extractCommentBody,
  getErrorMessage,
} from '../../utils/api'
import { STYLE_GUIDE_RULES, VALIDATION, ERROR_MESSAGES } from '../../constants'

interface WriteExerciseProps {
  onNavigateToStage: (stage: string, fromReviewFeedback?: boolean) => void
  cameFromReview: boolean
  selectedTrackId: string
  onSelectTrack: (id: string) => void
  onStageComplete?: () => void
}

export function WriteExercise({
  onNavigateToStage,
  cameFromReview,
  selectedTrackId,
  onSelectTrack,
  onStageComplete,
}: WriteExerciseProps) {
  const track = getTrack(selectedTrackId)
  
  const [showStyleGuide, setShowStyleGuide] = useState(false)
  const [writeDraftLoading, setWriteDraftLoading] = useState(false)
  const [writeFeedbackComment, setWriteFeedbackComment] = useState<string | null>(null)
  const [writeUpdateStatus, setWriteUpdateStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [writeReviewRequestStatus, setWriteReviewRequestStatus] = useState<'idle' | 'requesting' | 'requested' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [writeDraft, setWriteDraft] = useState(track.fallbackContent)

  useEffect(() => {
    setWriteUpdateStatus('idle')
    setWriteReviewRequestStatus('idle')
    setWriteDraftLoading(true)

    fetchDraftContent(track).then((text) => {
      setWriteDraft(text)
      setWriteDraftLoading(false)
    })

    if (cameFromReview) {
      fetchReviewCommentInfo(track).then((info) => {
        if (info.status === 'changes-requested' && info.rawComment) {
          setWriteFeedbackComment(extractCommentBody(info.rawComment))
        } else {
          setWriteFeedbackComment(null)
        }
      })
    } else {
      setWriteFeedbackComment(null)
    }
  }, [selectedTrackId, cameFromReview, track])

  const handleDraftChange = useCallback((value: string) => {
    setWriteDraft(value)
  }, [])

  const handleUpdateWriteDraft = useCallback(async () => {
    if (writeDraft.trim().length < VALIDATION.MIN_DRAFT_LENGTH) {
      setErrorMessage(ERROR_MESSAGES.DRAFT_TOO_SHORT)
      setWriteUpdateStatus('error')
      return
    }

    if (writeDraft.length > VALIDATION.MAX_DRAFT_LENGTH) {
      setErrorMessage(ERROR_MESSAGES.DRAFT_TOO_LONG)
      setWriteUpdateStatus('error')
      return
    }

    setWriteUpdateStatus('loading')
    setErrorMessage(null)
    setStatusMessage('')

    try {
      await updateWriteDraft(track, writeDraft, setStatusMessage)
      setWriteUpdateStatus('success')
      onStageComplete?.()
    } catch (err) {
      setErrorMessage(getErrorMessage(err))
      setWriteUpdateStatus('error')
    }
  }, [track, writeDraft])

  const handleRequestReviewFromWrite = useCallback(async () => {
    setWriteReviewRequestStatus('requesting')
    setErrorMessage(null)

    try {
      await requestReview(track.seedPrNumber)
      setWriteReviewRequestStatus('requested')
    } catch (err) {
      setErrorMessage(getErrorMessage(err))
      setWriteReviewRequestStatus('error')
    }
  }, [track])

  useSaveShortcut(handleUpdateWriteDraft, writeUpdateStatus !== 'loading')

  return (
    <section className="artifact-section" aria-labelledby="write-heading">
      <div className="artifact-header">
        <h2 id="write-heading">Documentation draft</h2>
      </div>

      <div className="artifact-card">
        <table className="field-table">
          <tbody>
            <tr>
              <th scope="row">Choose what to work on</th>
              <td>
                <TrackPicker 
                  selectedTrackId={selectedTrackId} 
                  onSelect={onSelectTrack}
                  label="Select a draft to edit"
                />
              </td>
            </tr>
            <tr>
              <th scope="row">Writing for</th>
              <td>{track.plan.title}</td>
            </tr>
            <tr>
              <th scope="row">Problem</th>
              <td>{track.plan.problem}</td>
            </tr>
            <tr>
              <th scope="row">Audience</th>
              <td>{track.plan.audience}</td>
            </tr>
            <tr>
              <th scope="row">Source reference</th>
              <td>
                <a href={track.relatedReferenceUrl} target="_blank" rel="noreferrer">
                  {track.referenceLabel}
                </a>
              </td>
            </tr>
            {writeFeedbackComment && (
              <tr>
                <th scope="row">Reviewer feedback</th>
                <td className="reviewer-feedback">{writeFeedbackComment}</td>
              </tr>
            )}
          </tbody>
        </table>

        <Button
          variant="ghost"
          onClick={() => setShowStyleGuide(!showStyleGuide)}
          aria-expanded={showStyleGuide}
          aria-controls="style-guide"
        >
          {showStyleGuide ? 'Hide style guide' : 'Show style guide'}
        </Button>

        {showStyleGuide && (
          <ul id="style-guide" className="style-guide-list" role="list">
            {STYLE_GUIDE_RULES.map((rule, index) => (
              <li key={index}>{rule}</li>
            ))}
          </ul>
        )}

        <div className="artifact-field">
          <label htmlFor="write-draft">Draft</label>
          <span className="field-helper">
            Edit the draft below. Press Ctrl+S to save.
          </span>
          {writeDraftLoading ? (
            <LoadingStatus message="Loading the current draft..." />
          ) : (
            <textarea
              id="write-draft"
              rows={14}
              value={writeDraft}
              onChange={(e) => handleDraftChange(e.target.value)}
              aria-describedby="draft-hint"
            />
          )}
        </div>

        <Button
          variant="primary"
          onClick={handleUpdateWriteDraft}
          loading={writeUpdateStatus === 'loading'}
          loadingText="Saving your draft..."
          disabled={writeDraftLoading}
        >
          {writeUpdateStatus === 'success' ? 'Save changes' : 'Save draft'}
        </Button>

        {writeUpdateStatus === 'loading' && statusMessage && (
          <LoadingStatus message={statusMessage} />
        )}

        {writeUpdateStatus === 'success' && (
          <SuccessStatus
            message="Draft saved."
            linkUrl={track.seedPrUrl}
            linkText="View the pull request on GitHub"
          >
            {writeReviewRequestStatus === 'idle' && (
              <Button variant="secondary" onClick={handleRequestReviewFromWrite}>
                Request review
              </Button>
            )}

            {writeReviewRequestStatus === 'requesting' && (
              <LoadingStatus message="Requesting review..." />
            )}

            {writeReviewRequestStatus === 'requested' && (
              <div>
                <p>Review requested. See what a reviewer would say.</p>
                <Button variant="primary" onClick={() => onNavigateToStage('REVIEW')}>
                  Continue to REVIEW
                </Button>
              </div>
            )}

            {writeReviewRequestStatus === 'error' && errorMessage && (
              <ErrorStatus message={errorMessage} />
            )}
          </SuccessStatus>
        )}

        {writeUpdateStatus === 'error' && errorMessage && (
          <ErrorStatus 
            message={errorMessage} 
            onRetry={() => setWriteUpdateStatus('idle')} 
          />
        )}
      </div>
    </section>
  )
}
