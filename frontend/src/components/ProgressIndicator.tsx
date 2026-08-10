import { useLocalStorage } from '../hooks'
import { STORAGE_KEYS } from '../constants'
import { stages } from '../data/stageContent'
import '../styles/ProgressIndicator.css'

const STAGES = stages.map((s) => s.id)
const TOTAL_STAGES = STAGES.length

export function useProgressTracking() {
  const [completedStages, setCompletedStages] = useLocalStorage<string[]>(
    STORAGE_KEYS.TRACK_SELECTION + '-completed-stages',
    []
  )

  const markStageCompleted = (stageId: string) => {
    if (!completedStages.includes(stageId)) {
      setCompletedStages([...completedStages, stageId])
    }
  }

  const resetProgress = () => {
    setCompletedStages([])
  }

  return {
    completedStages,
    completedCount: completedStages.length,
    totalStages: TOTAL_STAGES,
    markStageCompleted,
    resetProgress,
    isCompleted: (stageId: string) => completedStages.includes(stageId),
  }
}

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
}

function ProgressRing({ progress, size = 40, strokeWidth = 3 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <svg
      className="progress-ring"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle
        className="progress-ring-bg"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
      />
      <circle
        className="progress-ring-fill"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {progress === 100 && (
        <path
          className="progress-ring-check"
          d={`M${size * 0.3} ${size * 0.5} L${size * 0.45} ${size * 0.65} L${size * 0.7} ${size * 0.35}`}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

interface ProgressIndicatorProps {
  completedCount: number
  totalStages: number
  variant?: 'ring' | 'bar' | 'text' | 'compact'
}

export function ProgressIndicator({
  completedCount,
  totalStages,
  variant = 'ring',
}: ProgressIndicatorProps) {
  const percentage = (completedCount / totalStages) * 100
  const isComplete = completedCount === totalStages

  if (variant === 'text') {
    return (
      <div className="progress-text" role="status" aria-label="Stage progress">
        <span className="progress-count">
          {completedCount} of {totalStages} stages completed
        </span>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div 
        className={`progress-compact ${isComplete ? 'progress-complete' : ''}`} 
        role="status" 
        aria-label={`${completedCount} of ${totalStages} stages completed`}
      >
        <ProgressRing progress={percentage} size={32} strokeWidth={2.5} />
        <span className="progress-badge">
          {completedCount}/{totalStages}
        </span>
        {isComplete && <span className="progress-complete-check" aria-hidden="true">✓</span>}
      </div>
    )
  }

  if (variant === 'bar') {
    return (
      <div className="progress-bar-container" role="progressbar" aria-valuenow={completedCount} aria-valuemin={0} aria-valuemax={totalStages} aria-label="Stage progress">
        <div className="progress-bar-header">
          <span className="progress-label">Progress</span>
          <span className="progress-count">
            {completedCount} of {totalStages} stages
          </span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {isComplete && (
          <div className="progress-complete-message">
            All stages completed!
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      className={`progress-ring-container ${isComplete ? 'progress-complete' : ''}`} 
      role="status" 
      aria-label={`${completedCount} of ${totalStages} stages completed`}
    >
      <ProgressRing progress={percentage} />
      <div className="progress-ring-text">
        <span className="progress-ring-count">{completedCount}/{totalStages}</span>
        <span className="progress-ring-label">stages</span>
      </div>
    </div>
  )
}
