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
        'The plan is approved. Your team decided to write a quick start guide, an API reference, and three integration examples. You\'re assigned the quick start guide.',
      task:
        'Outline and draft a quick start guide that gets developers up and running in 10 minutes. Think about the minimal setup needed, and what a realistic first example looks like.',
      keyDecisions: [
        'Choose between code examples and interactive tutorials',
        'Decide what to include now and what to defer to deeper documentation',
        'Organize the content for clarity',
        'Plan for readers at different skill levels',
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
        'The quick start guide is approved. Publishing isn\'t a single click. Automation builds the site, checks for problems, and deploys it, the same automation that runs on this site right now.',
      task:
        'Look at the real build and deploy history for this site below. Then think through: how would you test documentation before publishing it? What could go wrong, and how would you catch it?',
      keyDecisions: [
        'Decide what to validate before publishing: links, code examples, formatting',
        'Plan how you\'d test a build before it goes live',
        'Think through a rollback plan if something breaks after deployment',
        'Decide what you\'d monitor after publishing',
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
    isAvailable: false,
    exercise: {
      title: 'Documentation Observation Scenario',
      scenario:
        'The quick start guide has been live for two weeks. You notice: 40% of users skip the quick start and go straight to the API reference. Support tickets mention confusion about environment setup.',
      task: 'Analyze this feedback. What would you improve? Which metrics matter most?',
      keyDecisions: [
        'Prioritize improvements based on user behavior',
        'Update content based on support ticket patterns',
        'Consider adding interactive elements or video tutorials',
        'Plan an iteration schedule and success metrics',
      ],
    },
  },
]

export function getStageContent(stageId: string): StageContent | undefined {
  return stages.find((stage) => stage.id === stageId)
}
