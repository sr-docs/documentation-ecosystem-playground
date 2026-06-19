import '../styles/ExercisePage.css'

interface ExercisePageProps {
  stage: string
  onBack: () => void
}

const scenarioContent = {
  PLAN: {
    title: 'Documentation Planning Scenario',
    scenario:
      'Your team has built a new API for user authentication. The API is ready for release, but there is no documentation. Your product manager asks: "When can users start using this?" You realize documentation is the blocker.',
    task: 'Create a documentation plan for the authentication API. Define what documentation is needed, who needs it, and success criteria.',
    keyDecisions: [
      'Identify the target audience (developers, integrators, internal teams)',
      'List required documentation types (quick start, API reference, examples)',
      'Define success metrics (adoption rate, support ticket reduction)',
      'Set timeline and dependencies',
    ],
  },
  WRITE: {
    title: 'Documentation Writing Scenario',
    scenario:
      'The plan is approved. Your team has decided to write a quick start guide, API reference, and three integration examples. You are assigned to write the quick start guide.',
    task: 'Outline and draft a quick start guide that gets developers up and running in 10 minutes. Consider: what is the minimal setup needed? What is a realistic first example?',
    keyDecisions: [
      'Choose between code examples and interactive tutorials',
      'Decide what to include vs. defer to deeper documentation',
      'Organize content for maximum clarity',
      'Plan for different developer skill levels',
    ],
  },
  REVIEW: {
    title: 'Documentation Review Scenario',
    scenario:
      'The quick start guide draft is submitted for review. A team member has provided feedback: "This assumes users know how to set environment variables. We should add that step."',
    task: 'Review the feedback critically. Is it a blocker? Nice-to-have? How would you respond? Propose concrete revisions.',
    keyDecisions: [
      'Evaluate feedback for accuracy and completeness',
      'Prioritize revisions by impact and effort',
      'Balance brevity with accessibility',
      'Decide on example code style and consistency',
    ],
  },
  PUBLISH: {
    title: 'Documentation Publishing Scenario',
    scenario:
      'The quick start guide is approved. You need to publish it to your documentation site. The build process checks for broken links, validates code examples, and deploys to production.',
    task: 'Plan the publication workflow. How will you test the documentation before publishing? What could go wrong?',
    keyDecisions: [
      'Validate all links and code examples',
      'Test documentation build and rendering',
      'Plan rollback strategy if issues arise',
      'Set up monitoring for broken links after deployment',
    ],
  },
  OBSERVE: {
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
}

export default function ExercisePage({ stage, onBack }: ExercisePageProps) {
  const content = scenarioContent[stage as keyof typeof scenarioContent]

  if (!content) {
    return <div>Invalid stage</div>
  }

  return (
    <div className="exercise-page">
      <div className="exercise-header">
        <button className="back-button" onClick={onBack} type="button">
          ← Back
        </button>
        <h1>{content.title}</h1>
      </div>

      <div className="exercise-content">
        <section className="exercise-section">
          <h2>The Scenario</h2>
          <p className="scenario-text">{content.scenario}</p>
        </section>

        <section className="exercise-section">
          <h2>Your Task</h2>
          <p className="task-text">{content.task}</p>
        </section>

        <section className="exercise-section">
          <h2>Key Decisions to Consider</h2>
          <ul className="decisions-list">
            {content.keyDecisions.map((decision, index) => (
              <li key={index}>{decision}</li>
            ))}
          </ul>
        </section>

        <section className="exercise-section">
          <button className="begin-button" type="button">
            Begin Exercise
          </button>
        </section>
      </div>
    </div>
  )
}
