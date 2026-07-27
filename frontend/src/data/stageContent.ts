export interface StageContent {
  id: string
  label: string
  outcomeLabel: string
  videoSrc: string
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
    outcomeLabel: 'Define the ask',
    videoSrc: 'media/stages/plan.mp4',
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
        'Your team just started a new sprint. This time, the docs team sits in sprint planning with the dev team from day one, not brought in after the code ships. A new authentication API is on the board. Decide what documentation it needs, now, while the sprint is still being planned.',
      task: 'Decide what to write, who it\'s for, and how you\'ll know it worked.',
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
    outcomeLabel: 'Draft it',
    videoSrc: 'media/stages/write.mp4',
    whatHappens: ['Content is drafted.', 'Information is organized.', 'Documentation takes shape.'],
    githubImplementation: 'Branch + Commits',
    artifacts: ['Draft documentation', 'Structured content'],
    isAvailable: true,
    exercise: {
      title: 'Documentation Writing Scenario',
      scenario:
        'Below are two real pull requests. Each has a real bug hiding in it: something the draft claims that its own example quietly contradicts. Pick one and find the mismatch.',
      task: 'Pick a draft, fix what\'s wrong, save your changes, then request a review, just like you would on a real team.',
      keyDecisions: [
        'Check every instruction and every table row against its own example',
        'Decide what else, if anything, needs tightening',
        'Keep the fix scoped to what\'s actually wrong',
        'Save your changes before requesting a review',
      ],
    },
  },
  {
    id: 'REVIEW',
    label: 'REVIEW',
    outcomeLabel: 'Check it',
    videoSrc: 'media/stages/review.mp4',
    whatHappens: ['Content is evaluated.', 'Feedback is provided.', 'Quality is improved.'],
    githubImplementation: 'Pull Request',
    artifacts: ['Review comments', 'Approval decisions'],
    isAvailable: true,
    exercise: {
      title: 'Documentation Review Scenario',
      scenario:
        'You\'re the reviewer now. Pick a draft below. You\'ll see what the writer was asked to deliver, and what to check their work against, a reference doc for one draft, the actual source code for the other.',
      task:
        'Read the draft. Compare it against the reference material for accuracy, and against the success criteria for completeness. Leave a comment explaining what you found, then approve the draft or request changes.',
      keyDecisions: [
        'Check the draft\'s technical accuracy against the reference material',
        'Decide whether an issue blocks publishing or can wait',
        'Write a comment specific enough for the writer to act on',
        'Choose to approve or request changes',
      ],
    },
  },
  {
    id: 'PUBLISH',
    label: 'PUBLISH',
    outcomeLabel: 'Ship it',
    videoSrc: 'media/stages/publish.mp4',
    whatHappens: ['Documentation is built.', 'Changes are deployed.', 'Content becomes available.'],
    githubImplementation: 'GitHub Actions',
    artifacts: ['Successful build', 'Deployment result'],
    isAvailable: true,
    exercise: {
      title: 'Documentation Publishing Scenario',
      scenario:
        'Publishing isn\'t a single click. It\'s a decision. Pick a draft below, then see whether it\'s actually been reviewed and what automated checks find before it goes live.',
      task:
        'Pick a draft, check its review status, choose which checks to run, then publish. If it isn\'t approved yet, go back and fix it first, the checks will tell you why.',
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
    outcomeLabel: 'Learn from it',
    videoSrc: 'media/stages/observe.mp4',
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
        'Every time someone runs PUBLISH, it\'s saved, for any draft. Below is the real history: what was published, whether it was reviewed first, and what the checks found.',
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
