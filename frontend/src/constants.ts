// API Configuration
export const WORKER_URL = 'https://doc-playground-proxy.sabitarao2025.workers.dev/'
export const GITHUB_OWNER = 'sr-docs'
export const GITHUB_REPO = 'documentation-ecosystem-playground'
export const PORTFOLIO_URL = 'https://sr-docs.github.io/'

// Workflow files
export const WORKFLOWS = {
  CREATE_PLAN_ISSUE: 'create-plan-issue.yml',
  UPDATE_WRITE_PR: 'update-write-pr.yml',
  REQUEST_WRITE_REVIEW: 'request-write-review.yml',
  SUBMIT_PR_REVIEW: 'submit-pr-review.yml',
  RUN_CHECKS: 'run-checks.yml',
  PUBLISH_QUICKSTART: 'publish-quickstart.yml',
  CREATE_OBSERVE_ISSUE: 'create-observe-issue.yml',
} as const

// Polling configuration
export const POLLING_DEFAULTS = {
  TIMEOUT_MS: 30000,
  INTERVAL_MS: 2000,
  LONG_TIMEOUT_MS: 60000,
  LONG_INTERVAL_MS: 3000,
  PUBLISH_TIMEOUT_MS: 90000,
  PUBLISH_INTERVAL_MS: 4000,
} as const

// Validation limits
export const VALIDATION = {
  MIN_DRAFT_LENGTH: 20,
  MAX_DRAFT_LENGTH: 2000,
  MIN_COMMENT_LENGTH: 10,
  MIN_OBSERVATION_LENGTH: 15,
} as const

// Stage identifiers
export const STAGES = {
  PLAN: 'PLAN',
  WRITE: 'WRITE',
  REVIEW: 'REVIEW',
  PUBLISH: 'PUBLISH',
  OBSERVE: 'OBSERVE',
} as const

export type StageId = typeof STAGES[keyof typeof STAGES]

// Review decision statuses
export const REVIEW_STATUSES = {
  APPROVED: 'approved',
  CHANGES_REQUESTED: 'changes-requested',
  NOT_REVIEWED: 'not-reviewed',
  UNKNOWN: 'unknown',
} as const

export type ReviewDecisionStatus = typeof REVIEW_STATUSES[keyof typeof REVIEW_STATUSES]

// Check names and their display labels
export const CHECK_NAME_LABELS: Record<string, string> = {
  build: 'Site build check',
}

// Review status display labels
export const REVIEW_STATUS_LABELS: Record<string, string> = {
  approved: 'Approved',
  'changes-requested': 'Changes requested',
  'not-reviewed': 'Not yet reviewed',
  unknown: 'Unknown',
}

// Style guide rules
export const STYLE_GUIDE_RULES = [
  'Use plain language. Skip jargon.',
  'Write to the reader as "you."',
  'Use active voice.',
  'Keep sentences short.',
  'Cut filler words like "very," "simply," or "just."',
  'Use a verb, not a noun phrase: say "connect," not "establish connectivity."',
] as const

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  SAVE: { key: 's', ctrl: true, description: 'Save draft' },
  SUBMIT: { key: 'Enter', ctrl: true, description: 'Submit form' },
} as const

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'playground-theme',
  DRAFT_PREFIX: 'playground-draft-',
  TRACK_SELECTION: 'playground-track',
} as const

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "We couldn't reach GitHub. Check your internet connection and try again.",
  GENERIC_ERROR: "We couldn't complete that action. Please try again.",
  TIMEOUT_ERROR: 'This is taking longer than expected. Please try again.',
  DRAFT_TOO_SHORT: 'Your draft needs at least 20 characters.',
  DRAFT_TOO_LONG: 'Keep your draft under 2,000 characters.',
  COMMENT_TOO_SHORT: 'Add a bit more detail to your comment.',
  OBSERVATION_TOO_SHORT: 'Add a bit more detail: what you noticed, and what should happen next.',
  NO_CHECKS_SELECTED: 'Select at least one check to run.',
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  ISSUE_CREATED: 'Issue created.',
  DRAFT_SAVED: 'Draft saved.',
  DRAFT_UPDATED: 'Draft updated.',
  REVIEW_POSTED: 'Review posted.',
  REVIEW_REQUESTED: 'Review requested.',
  PUBLISHED: 'Live. Here\'s what happened.',
} as const

// Media extensions
export const IMAGE_EXTENSIONS = ['.gif', '.png', '.jpg', '.jpeg', '.webp'] as const
