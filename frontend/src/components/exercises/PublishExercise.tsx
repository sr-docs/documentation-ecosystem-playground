import { useState, useEffect, useCallback } from 'react'
import { Button, LoadingStatus, SuccessStatus, ErrorStatus } from '../ui'
import { TrackPicker } from '../TrackPicker'
import { MarkdownPreview } from '../MarkdownPreview'
import { DraftSkeleton } from '../ui/Skeleton'
import { getTrack } from '../../data/tracks'
import {
  fetchDraftContent,
  fetchReviewCommentInfo,
  runChecks,
  publishDraft,
  checkResultsHaveFailure,
  getErrorMessage,
  type PublishChecks,
} from '../../utils/api'
import { GITHUB_OWNER, GITHUB_REPO, REVIEW_STATUS_LABELS, ERROR_MESSAGES } from '../../constants'

type ReviewDecisionStatus = 'approved' | 'changes-requested' | 'not-reviewed' | 'unknown'

interface PublishExerciseProps {
  onNavigateToStage: (stage: string, fromReviewFeedback?: boolean) => void
  selectedTrackId: string
  onSelectTrack: (id: string) => void
  onStageComplete?: () => void
}

function reviewStatusLabel(status: ReviewDecisionStatus): string {
  return REVIEW_STATUS_LABELS[status] || status
}

function reviewStatusClassSuffix(raw: string): string {
  const normalized = raw.trim().toLowerCase()
  if (Object.keys(REVIEW_STATUS_LABELS).includes(normalized)) {
    return normalized
  }
  return 'unknown'
}

const ACTIONS_PAGE_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/actions`

export function PublishExercise({
  onNavigateToStage,
  selectedTrackId,
  onSelectTrack,
  onStageComplete,
}: PublishExerciseProps) {
  const track = getTrack(selectedTrackId)

  const [publishDraftContent, setPublishDraftContent] = useState('')
  const [publishLoading, setPublishLoading] = useState(false)
  const [publishChecks, setPublishChecks] = useState<PublishChecks>({
    runLinkCheck: true,
    runHeadingCheck: true,
    runCodeBlockCheck: true,
    runConsistencyCheck: true,
    runAccuracyCheck: true,
    runValeCheck: true,
  })
  const [reviewDecisionStatus, setReviewDecisionStatus] = useState<ReviewDecisionStatus | null>(null)
  const [reviewDecisionLoading, setReviewDecisionLoading] = useState(false)

  const [checkRunStatus, setCheckRunStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [checkResultsContent, setCheckResultsContent] = useState<string | null>(null)

  const [publishSubmitStatus, setPublishSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [publishResultsContent, setPublishResultsContent] = useState<string | null>(null)
  const [publishFinalDraft, setPublishFinalDraft] = useState<string | null>(null)

  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setCheckRunStatus('idle')
    setCheckResultsContent(null)
    setPublishSubmitStatus('idle')
    setPublishResultsContent(null)
    setPublishFinalDraft(null)

    setPublishLoading(true)
    fetchDraftContent(track).then((text) => {
      setPublishDraftContent(text)
      setPublishLoading(false)
    })

    setReviewDecisionLoading(true)
    fetchReviewCommentInfo(track).then((info) => {
      setReviewDecisionStatus(info.status)
      setReviewDecisionLoading(false)
    })
  }, [selectedTrackId, track])

  const handleToggleCheck = useCallback((key: keyof PublishChecks, value: boolean) => {
    setPublishChecks((prev) => ({ ...prev, [key]: value }))
    setCheckRunStatus('idle')
    setCheckResultsContent(null)
  }, [])

  const handleRunChecks = useCallback(async () => {
    if (publishDraftContent.trim().length < 20) {
      setErrorMessage('The draft is too short to check.')
      setCheckRunStatus('error')
      return
    }

    const anyCheckSelected = Object.values(publishChecks).some(Boolean)
    if (!anyCheckSelected) {
      setErrorMessage(ERROR_MESSAGES.NO_CHECKS_SELECTED)
      setCheckRunStatus('error')
      return
    }

    setCheckRunStatus('loading')
    setErrorMessage(null)
    setStatusMessage('')
    setCheckResultsContent(null)

    try {
      const results = await runChecks(
        publishDraftContent,
        publishChecks,
        reviewDecisionStatus ?? 'unknown',
        setStatusMessage
      )
      setCheckResultsContent(results)
      setCheckRunStatus('success')
    } catch (err) {
      setErrorMessage(getErrorMessage(err))
      setCheckRunStatus('error')
    }
  }, [publishDraftContent, publishChecks, reviewDecisionStatus])

  const handlePublish = useCallback(async () => {
    setPublishSubmitStatus('loading')
    setErrorMessage(null)
    setStatusMessage('')
    setPublishResultsContent(null)
    setPublishFinalDraft(null)

    try {
      const results = await publishDraft(
        publishDraftContent,
        publishChecks,
        reviewDecisionStatus ?? 'unknown',
        setStatusMessage
      )
      setPublishResultsContent(results.resultsContent)
      setPublishFinalDraft(results.finalDraftContent)
      setPublishSubmitStatus('success')
      onStageComplete?.()
    } catch (err) {
      setErrorMessage(getErrorMessage(err))
      setPublishSubmitStatus('error')
    }
  }, [publishDraftContent, publishChecks, reviewDecisionStatus])

  const checksHaveFailure = checkResultsContent ? checkResultsHaveFailure(checkResultsContent) : false

  return (
    <section className="artifact-section" aria-labelledby="publish-heading">
      <div className="artifact-header">
        <h2 id="publish-heading">Check and publish</h2>
      </div>

      <div className="artifact-card">
        <table className="field-table">
          <tbody>
            <tr>
              <th scope="row">Choose what to publish</th>
              <td>
                <TrackPicker 
                  selectedTrackId={selectedTrackId} 
                  onSelect={onSelectTrack}
                  label="Select a draft to publish"
                />
              </td>
            </tr>
            <tr>
              <th scope="row">Review status</th>
              <td>
                {reviewDecisionLoading && <LoadingStatus message="Checking review status..." />}
                {!reviewDecisionLoading && reviewDecisionStatus && (
                  <p className={`review-status-badge review-status-${reviewStatusClassSuffix(reviewDecisionStatus)}`}>
                    {reviewStatusLabel(reviewDecisionStatus)}
                  </p>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {!reviewDecisionLoading && reviewDecisionStatus && reviewDecisionStatus !== 'approved' && (
          <div className="modified-banner" role="alert">
            <p>
              {reviewDecisionStatus === 'changes-requested'
                ? 'A reviewer requested changes. Publishing now will mark it as not reviewed.'
                : reviewDecisionStatus === 'not-reviewed'
                ? 'This draft has not been reviewed yet.'
                : 'The review status could not be confirmed.'}
            </p>
            <Button
              variant="ghost"
              onClick={() =>
                onNavigateToStage(
                  reviewDecisionStatus === 'changes-requested' ? 'WRITE' : 'REVIEW',
                  reviewDecisionStatus === 'changes-requested'
                )
              }
            >
              {reviewDecisionStatus === 'changes-requested' ? 'Go to WRITE' : 'Go to REVIEW'}
            </Button>
          </div>
        )}

        <div className="artifact-field">
          <label id="publish-preview-label">Draft to publish</label>
          {publishLoading ? (
            <DraftSkeleton />
          ) : (
            <div 
              className="draft-preview-rendered" 
              aria-labelledby="publish-preview-label"
              role="article"
            >
              <MarkdownPreview content={publishDraftContent} />
            </div>
          )}
        </div>

        <fieldset className="artifact-field">
          <legend>Checks to run</legend>
          <div className="checkbox-list" role="group">
            {[
              { key: 'runLinkCheck', label: 'Link check', desc: 'Confirms every link resolves.' },
              { key: 'runHeadingCheck', label: 'Heading structure', desc: 'Ensures headings step down in order.' },
              { key: 'runCodeBlockCheck', label: 'Code block formatting', desc: 'Checks code blocks are properly closed.' },
              { key: 'runConsistencyCheck', label: 'Instruction consistency', desc: 'Confirms instructions match examples.' },
              { key: 'runAccuracyCheck', label: 'Endpoint accuracy', desc: 'Confirms optional params aren\'t contradicted.' },
              { key: 'runValeCheck', label: 'Vale style check', desc: 'Flags filler words and style issues.' },
            ].map(({ key, label, desc }) => (
              <label 
                key={key}
                className={`checkbox-row ${publishChecks[key as keyof PublishChecks] ? 'checkbox-row-active' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={publishChecks[key as keyof PublishChecks]}
                  onChange={(e) => handleToggleCheck(key as keyof PublishChecks, e.target.checked)}
                />
                <span className="checkbox-row-text">
                  <span className="checkbox-row-title">{label}</span>
                  <span className="checkbox-row-description">{desc}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {checkRunStatus !== 'success' && (
          <Button
            variant="primary"
            onClick={handleRunChecks}
            loading={checkRunStatus === 'loading'}
            loadingText="Running checks on your draft..."
            disabled={publishLoading}
          >
            Run checks
          </Button>
        )}

        {checkRunStatus === 'loading' && statusMessage && (
          <LoadingStatus message={statusMessage} />
        )}

        {checkRunStatus === 'error' && errorMessage && (
          <ErrorStatus 
            message={errorMessage} 
            onRetry={() => setCheckRunStatus('idle')} 
          />
        )}

        {checkRunStatus === 'success' && checkResultsContent && (
          <div className="artifact-field">
            <label>Check results</label>
            <div className="draft-preview-rendered" role="log" aria-label="Check results">
              <MarkdownPreview content={checkResultsContent} />
            </div>
            <p className="status-detail">
              <a href={ACTIONS_PAGE_URL} target="_blank" rel="noreferrer">
                View this workflow on GitHub
              </a>
            </p>
          </div>
        )}

        {checkRunStatus === 'success' && checksHaveFailure && (
          <div className="modified-banner" role="alert">
            <p>Some checks failed. You can still publish, but the result will reflect that.</p>
            <Button variant="ghost" onClick={() => onNavigateToStage('WRITE')}>
              Edit the draft
            </Button>
          </div>
        )}

        {checkRunStatus === 'success' && publishSubmitStatus !== 'success' && (
          <Button
            variant="primary"
            onClick={handlePublish}
            loading={publishSubmitStatus === 'loading'}
            loadingText="Publishing your documentation..."
          >
            {checksHaveFailure ? 'Publish anyway' : 'Publish'}
          </Button>
        )}

        {publishSubmitStatus === 'loading' && statusMessage && (
          <LoadingStatus message={statusMessage} />
        )}

        {publishSubmitStatus === 'success' && publishResultsContent && (
          <SuccessStatus message="Live. Here's what happened.">
            <div className="artifact-field">
              <label>Published content</label>
              <div className="draft-preview-rendered">
                <MarkdownPreview content={publishFinalDraft || ''} />
              </div>
            </div>
            <Button variant="primary" onClick={() => onNavigateToStage('OBSERVE')}>
              Continue to OBSERVE
            </Button>
            <p className="status-detail">
              <a href={ACTIONS_PAGE_URL} target="_blank" rel="noreferrer">
                View this workflow on GitHub
              </a>
            </p>
          </SuccessStatus>
        )}

        {publishSubmitStatus === 'error' && errorMessage && (
          <ErrorStatus 
            message={errorMessage} 
            onRetry={() => setPublishSubmitStatus('idle')} 
          />
        )}
      </div>
    </section>
  )
}
