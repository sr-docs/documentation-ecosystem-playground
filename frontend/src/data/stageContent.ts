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
        'Your team has built a new API for user authentication. The API is ready for release, but there is no documentation. Your product manager asks: "When can users start using this?" You realize documentation is the blocker.',
      task:
        'Create a documentation plan for the authentication API. Define what documentation is needed, who needs it, and success criteria.',
      keyDecisions: [
        'Identify the target audience (developers, integrators, internal teams)',
        'List required documentation types (quick start, API reference, examples)',
        'Define success metrics (adoption rate, support ticket reduction)',
        'Set timeline and dependencies',
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
        'The plan is approved. Your team has decided to write a quick start guide, API reference, and three integration examples. You are assigned to write the quick start guide.',
      task: 'Outline and draft a quick start guide that gets developers up and running quickly.',
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
    isAvailable: false,
    exercise: {
      title: 'Documentation Publishing Scenario',
      scenario: 'The quick start guide is approved. You need to publish it to the documentation site.',
      task: 'Plan the publication workflow and identify validation steps before release.',
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
    isAvailable: false,
    exercise: {
      title: 'Documentation Observation Scenario',
      scenario: 'The documentation has been live for two weeks. Usage patterns and support requests are available.',
      task: 'Analyze user behavior and identify opportunities for improvement.',
    },
  },
]

export function getStageContent(stageId: string): StageContent | undefined {
  return stages.find((stage) => stage.id === stageId)
}
