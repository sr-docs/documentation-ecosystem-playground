import { useState, useCallback } from 'react'
import { Button, LoadingStatus, SuccessStatus, ErrorStatus } from '../ui'
import { useSubmitShortcut } from '../../hooks'
import { createPlanIssue, getErrorMessage } from '../../utils/api'

interface PlanExerciseProps {
  onNavigateToStage: (stage: string) => void
  onStageComplete?: () => void
}

export function PlanExercise({ onNavigateToStage, onStageComplete }: PlanExerciseProps) {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [issueUrl, setIssueUrl] = useState<string | null>(null)

  const [artifact, setArtifact] = useState({
    title: 'Authentication API Documentation',
    problem: 'Users cannot integrate with the authentication API because documentation does not exist.',
    audience: 'Developers integrating with the authentication API',
    documentationNeeded: 'Quick start guide, API reference, and three integration examples',
    success: 'Developers can authenticate and make their first API request without support.',
  })

  const handleCreateIssue = useCallback(async () => {
    setSubmitStatus('loading')
    setErrorMessage(null)
    setStatusMessage('')

    try {
      const result = await createPlanIssue(
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
      onStageComplete?.()
    } catch (err) {
      setErrorMessage(getErrorMessage(err))
      setSubmitStatus('error')
    }
  }, [artifact])

  const handleRetry = useCallback(() => {
    setSubmitStatus('idle')
    setErrorMessage(null)
  }, [])

  useSubmitShortcut(handleCreateIssue, submitStatus !== 'loading' && submitStatus !== 'success')

  return (
    <section className="artifact-section" aria-labelledby="plan-heading">
      <div className="artifact-header">
        <h2 id="plan-heading">Documentation planning issue</h2>
      </div>

      <div className="artifact-card">
        <div className="artifact-field">
          <label htmlFor="plan-title">Title</label>
          <input
            id="plan-title"
            type="text"
            value={artifact.title}
            onChange={(e) => setArtifact({ ...artifact, title: e.target.value })}
            placeholder="What are you documenting?"
          />
        </div>

        <div className="artifact-field">
          <label htmlFor="plan-problem">Problem</label>
          <span className="field-helper">What can't users do without this documentation?</span>
          <textarea
            id="plan-problem"
            rows={4}
            value={artifact.problem}
            onChange={(e) => setArtifact({ ...artifact, problem: e.target.value })}
            placeholder="Users cannot..."
          />
        </div>

        <div className="artifact-field">
          <label htmlFor="plan-audience">Audience</label>
          <input
            id="plan-audience"
            type="text"
            value={artifact.audience}
            onChange={(e) => setArtifact({ ...artifact, audience: e.target.value })}
            placeholder="Who will read this?"
          />
        </div>

        <div className="artifact-field">
          <label htmlFor="plan-docs-needed">Documentation needed</label>
          <span className="field-helper">What types of content: guides, references, tutorials?</span>
          <textarea
            id="plan-docs-needed"
            rows={3}
            value={artifact.documentationNeeded}
            onChange={(e) => setArtifact({ ...artifact, documentationNeeded: e.target.value })}
            placeholder="Quick start guide, API reference..."
          />
        </div>

        <div className="artifact-field">
          <label htmlFor="plan-success">Success criteria</label>
          <span className="field-helper">How will you know the docs worked?</span>
          <textarea
            id="plan-success"
            rows={4}
            value={artifact.success}
            onChange={(e) => setArtifact({ ...artifact, success: e.target.value })}
            placeholder="Users can... without..."
          />
        </div>

        <Button
          variant="primary"
          onClick={handleCreateIssue}
          loading={submitStatus === 'loading'}
          loadingText="Submitting your plan..."
          disabled={submitStatus === 'success'}
        >
          Submit plan
        </Button>

        {submitStatus === 'loading' && statusMessage && (
          <LoadingStatus message={statusMessage} />
        )}

        {submitStatus === 'success' && issueUrl && (
          <SuccessStatus
            message="Issue created."
            linkUrl={issueUrl}
            linkText="View it on GitHub"
          >
            <p className="status-detail">
              Note: WRITE uses sample drafts, not your plan above. Continue to see how drafts get reviewed and published.
            </p>
            <Button variant="primary" onClick={() => onNavigateToStage('WRITE')}>
              Continue to WRITE
            </Button>
          </SuccessStatus>
        )}

        {submitStatus === 'error' && errorMessage && (
          <ErrorStatus message={errorMessage} onRetry={handleRetry} />
        )}
      </div>
    </section>
  )
}
