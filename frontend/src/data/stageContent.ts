export interface StageContent {
  id: string
  label: string
  whatHappens: string[]
  githubImplementation: string
  artifacts: string[]
  isAvailable: boolean
  exercise: {
    title: string
    scenario: string
    task: string
    keyDecisions?: string[]
  }
}

export const stages: StageContent[] = [
  {
    id: 'PLAN',
    label: 'PLAN',
    whatHappens: [
      'A documentation need is identified.',
      'Scope is defined.',
      'Success criteria are established.',
    ],
    githubImplementation: 'Issue',
    artifacts: ['Problem statement', 'Scope definition', 'Acceptance criteria'],
    isAvailable: true,
    exercise: {
      title: 'Documentation Planning Scenario',
      scenario:
        'Your team built a new API for user authentication. The API is ready for release, but there\'s no documentation. Your product manager asks: "When can users start using this?" You realize documentation is the blocker.',
      task:
        'Create a documentation plan for the authentication API. Define what documentation you need, who needs it, and how you\'ll know it worked.',
      keyDecisions: [
        'Identify the target audience: developers, integrators, or internal teams',
        'List the documentation types you need: quick start, API reference, examples',
        'Define success metrics: adoption rate, support ticket reduction',
        'Set a timeline and note any dependencies',
      ],
    },
  },
  {
    id: 'WRITE',
    label: 'WRITE',
    whatHappens: ['Content is drafted.', 'Information is organized.', 'Documentation takes shape.'],
    githubImplementation: 'Branch + Commits',
    artifacts: ['Draft documentation', 'Structured content'],
    isAvailable: true,
    exercise: {
      title: 'Documentation Writing Scenario',
      scenario:
        'A quick start guide already exists in the pull request below. It has a mistake: an instruction that doesn\'t match its own example. Read it closely.',
      task:
        'Find and fix the problem in the draft. Save your changes, then request a review when you\'re ready.',
      keyDecisions: [
        'Check every instruction against its own example',
        'Decide what else, if anything, needs tightening',
        'Keep the fix scoped to what\'s actually wrong',
        'Save your changes before requesting a review',
      ],
    },
  },
  {
    id: 'REVIEW',
    label: 'REVIEW',
    whatHappens: ['Content is evaluated.', 'Feedback is provided.', 'Quality is improved.'],
    githubImplementation: 'Pull Request',
    artifacts: ['Review comments', 'Approval decisions'],
    isAvailable: true,
    exercise: {
      title: 'Documentation Review Scenario',
      scenario:
        'The quick start guide is ready for review. You\'re the reviewer. The plan\'s success criteria and the API reference are both available to check the draft against.',
      task:
        'Read the draft. Compare it to the API reference for accuracy, and to the success criteria for completeness. Leave a comment explaining what you found, then approve the draft or request changes.',
      keyDecisions: [
        'Check the draft\'s technical accuracy against the API reference',
        'Decide whether an issue blocks publishing or can wait',
        'Write a comment specific enough for the writer to act on',
        'Choose to approve or request changes',
      ],
    },
  },
  {
    id: 'PUBLISH',
    label: 'PUBLISH',
    whatHappens: ['Documentation is built.', 'Changes are deployed.', 'Content becomes available.'],
    githubImplementation: 'GitHub Actions',
    artifacts: ['Successful build', 'Deployment result'],
    isAvailable: true,
    exercise: {
      title: 'Documentation Publishing Scenario',
      scenario:
        'Publishing isn\'t a single click. Below is the current draft, exactly as it stands in WRITE right now, along with its review status. Automation checks it before it goes live.',
      task:
        'Review the draft and its review status. Choose which checks to run, then publish. If the draft isn\'t approved yet, go back and fix it first, the checks will tell you why.',
      keyDecisions: [
        'Decide what\'s worth validating before publishing: links, headings, code formatting, style',
        'Notice whether this draft has actually been reviewed',
        'Read the check results and decide what to fix first',
        'Think through what you\'d monitor after publishing',
      ],
    },
  },
  {
    id: 'OBSERVE',
    label: 'OBSERVE',
    whatHappens: [
      'Documentation performance is evaluated.',
      'Improvements are identified.',
      'Future work is planned.',
    ],
    githubImplementation: 'Issues and Iteration',
    artifacts: ['Improvement opportunities', 'Follow-up work'],
    isAvailable: true,
    exercise: {
      title: 'Documentation Observation Scenario',
      scenario:
        'Every time someone runs PUBLISH, the result is saved. Below is the real history: what was published, whether it was reviewed first, and what the checks found.',
      task:
        'Look through the real publish history. Decide what it tells you. Then file an issue describing what you observed and what should happen next.',
      keyDecisions: [
        'Look for patterns: repeated failures, unreviewed publishes, missing checks',
        'Decide what\'s worth fixing versus what\'s a one-time issue',
        'Write an observation specific enough to act on',
        'Recommend a next step: a new plan, a process change, or nothing yet',
      ],
    },
  },
]

export function getStageContent(stageId: string): StageContent | undefined {
  return stages.find((stage) => stage.id === stageId)
}
