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
    isAvailable: false,
    exercise: {
      title: 'Documentation Writing Scenario',
      scenario:
        'The plan is approved. Your team has decided to write a quick start guide, API reference, and three integration examples. You are assigned to write the quick start guide.',
      task:
        'Outline and draft a quick start guide that gets developers up and running in 10 minutes. Consider: what is the minimal setup needed? What is a realistic first example?',
      keyDecisions: [
        'Choose between code examples and interactive tutorials',
        'Decide what to include vs. defer to deeper documentation',
        'Organize content for maximum clarity',
        'Plan for different developer skill levels',
      ],
    },
  },
  {
    id: 'REVIEW',
    label: 'REVIEW',
    whatHappens: ['Content is evaluated.', 'Feedback is provided.', 'Quality is improved.'],
    githubImplementation: 'Pull Request',
    artifacts: ['Review comments', 'Approval decisions'],
    isAvailable: false,
    exercise: {
      title: 'Documentation Review Scenario',
      scenario:
        'The quick start guide draft is submitted for review. A team member has provided feedback: "This assumes users know how to set environment variables. We should add that step."',
      task:
        'Review the feedback critically. Is it a blocker? Nice-to-have? How would you respond? Propose concrete revisions.',
      keyDecisions: [
        'Evaluate feedback for accuracy and completeness',
        'Prioritize revisions by impact and effort',
        'Balance brevity with accessibility',
        'Decide on example code style and consistency',
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
      scenario:
        'The quick start guide is approved. You need to publish it to your documentation site. The build process checks for broken links, validates code examples, and deploys to production.',
      task:
        'Plan the publication workflow. How will you test the documentation before publishing? What could go wrong?',
      keyDecisions: [
        'Validate all links and code examples',
        'Test documentation build and rendering',
        'Plan rollback strategy if issues arise',
        'Set up monitoring for broken links after deployment',
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
      task: 'Analyze this feedback. What improvements would you make? What metrics matter most?',
      keyDecisions: [
        'Prioritize improvements based on user behavior',
        'Update content based on support ticket patterns',
        'Consider adding interactive elements or video tutorials',
        'Plan iteration schedule and success metrics',
      ],
    },
  },
]

export function getStageContent(stageId: string): StageContent | undefined {
  return stages.find((stage) => stage.id === stageId)
}
