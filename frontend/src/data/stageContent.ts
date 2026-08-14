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
      'Identify a documentation need.',
      'Define the scope and audience.',
      'Set success criteria.',
    ],
    githubImplementation: 'Issue',
    artifacts: ['Problem statement', 'Scope definition', 'Acceptance criteria'],
    isAvailable: true,
    exercise: {
      title: 'Documentation Planning',
      scenario:
        'Your team just started a new sprint. The docs team joins sprint planning from day one, not after the code ships. A new authentication API is on the board. Decide what documentation it needs while planning is still open.',
      task: 'Define what to write, who reads it, and how you measure success.',
      keyDecisions: [
        'Identify the target audience (for example, developers, integrators, or internal teams)',
        'List the documentation types (for example, quick start, API reference, examples)',
        'Define success metrics (for example, adoption rate, support ticket reduction)',
        'Note any dependencies on other teams or releases',
      ],
    },
  },
  {
    id: 'WRITE',
    label: 'WRITE',
    outcomeLabel: 'Draft it',
    videoSrc: 'media/stages/write.mp4',
    whatHappens: [
      'Draft the content.',
      'Organize the information.',
      'Shape the documentation.',
    ],
    githubImplementation: 'Branch + Commits',
    artifacts: ['Draft documentation', 'Structured content'],
    isAvailable: true,
    exercise: {
      title: 'Documentation Writing',
      scenario:
        'Pick any one of the two documentation drafts here, read the problem statement, and view the reference material if required.',
      task: 'Pick a draft, fix the issue, save your changes, then request a review.',
      keyDecisions: [
        'Compare the draft against its source reference',
        'Decide what else needs tightening',
        'Save before requesting review',
      ],
    },
  },
  {
    id: 'REVIEW',
    label: 'REVIEW',
    outcomeLabel: 'Check it',
    videoSrc: 'media/stages/review.mp4',
    whatHappens: [
      'Evaluate the content.',
      'Provide feedback.',
      'Improve quality.',
    ],
    githubImplementation: 'Pull Request',
    artifacts: ['Review comments', 'Approval decisions'],
    isAvailable: true,
    exercise: {
      title: 'Documentation Review',
      scenario:
        "You're the reviewer now. Pick a draft submitted by the writer, and check for technical accuracy.",
      task: 'Read the draft, compare it against the reference, leave a comment, then approve or request changes.',
      keyDecisions: [
        'Decide if an issue blocks publishing or can wait',
        'Write a comment specific enough to act on',
        'Choose to approve or request changes',
      ],
    },
  },
  {
    id: 'PUBLISH',
    label: 'PUBLISH',
    outcomeLabel: 'Ship it',
    videoSrc: 'media/stages/publish.mp4',
    whatHappens: [
      'Build the documentation.',
      'Deploy changes.',
      'Make content available.',
    ],
    githubImplementation: 'GitHub Actions',
    artifacts: ['Successful build', 'Deployment result'],
    isAvailable: true,
    exercise: {
      title: 'Documentation Publishing',
      scenario:
        'Publishing is a decision, not just a button. Pick a draft, check whether it passed review, and see what automated checks find before it goes live.',
      task: 'Pick a draft, verify its review status, run checks, then publish.',
      keyDecisions: [
        'Choose what to validate: links, headings, code formatting, style',
        'Check whether this draft passed review',
        'Read check results and prioritize fixes',
        'Consider what to monitor after publishing',
      ],
    },
  },
  {
    id: 'OBSERVE',
    label: 'OBSERVE',
    outcomeLabel: 'Learn from it',
    videoSrc: 'media/stages/observe.mp4',
    whatHappens: [
      'Evaluate documentation performance.',
      'Identify improvements.',
      'Plan future work.',
    ],
    githubImplementation: 'Issues and Iteration',
    artifacts: ['Improvement opportunities', 'Follow-up work'],
    isAvailable: true,
    exercise: {
      title: 'Documentation Observation',
      scenario:
        'Every publish is saved. Below is the real history: what shipped, whether it passed review, and what the checks found.',
      task: 'Review the publish history, identify patterns, then file an issue with your findings.',
      keyDecisions: [
        'Look for patterns: repeated failures, unreviewed publishes, missing checks',
        'Distinguish one-time issues from recurring problems',
        'Write an observation specific enough to act on',
        'Recommend a next step: new plan, process change, or wait',
      ],
    },
  },
]

export function getStageContent(stageId: string): StageContent | undefined {
  return stages.find((stage) => stage.id === stageId)
}
