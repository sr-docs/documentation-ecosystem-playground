## Purpose
Learn the basics of Docs as Code by participating in a GitHub-native workflow. Observe the systems that enable documentation production.

## Core principles

| Principle         | Decision                                 |
| ----------------- | ---------------------------------------- |
| Unit of learning  | Workflow slice                           |
| Center of gravity | Documentation ecosystem                  |
| Learning style    | Interactive exploration                  |
| Progression       | Workflow capabilities                    |
| Automation        | GitHub-native                            |
| Portfolio goal    | Demonstrate documentation systems design |

## Documentation ecosystem

| Stage   | Purpose          | GitHub Primitive | Portfolio Signal      |
| ------- | ---------------- | ---------------- | --------------------- |
| PLAN    | Define work      | Issue            | Workflow design       |
| WRITE   | Create content   | Branch + Commit  | Content strategy      |
| REVIEW  | Validate quality | Pull Request     | Review and collaboration systems |
| PUBLISH | Deploy docs      | GitHub Action    | Automation            |
| OBSERVE | Iterate          | Issues + Updates | Operations            |

## User journey
1. Homepage
2. Select ecosystem stage
3. Enter workflow slice
4. Perform GitHub activity
5. Observe system response
6. Complete workflow

## Workflow experiences

| Experience                        | What You learn   |
| --------------------------------- | --------------------- |
| How Documentation Enters a System | Planning and creation |
| How Quality Is Maintained         | Review workflows      |
| How Documentation Reaches Users   | Deployment            |
| How Documentation Evolves         | Maintenance           |
| How Documentation Systems Improve | Operations            |

## Homepage concept
- Above the fold: Interactive ecosystem map
- Primary interaction: Click a workflow stage
- Visitor takeaways: "This person understands documentation ecosystems." and "I can try this process myself."

## MVP scope
v1:
- One workflow slice
- One GitHub workflow
- One visitor path
- GitHub Pages deployment

What does not exist yet:
- AI workflows
- Advanced automation
- Multiple workflow paths

## Known limitations in REVIEW

REVIEW works end to end: it loads a real pull request, shows live draft content and CI status, and posts a real comment back to GitHub. Two limitations are worth stating directly, since they're deliberate scoping decisions, not oversights.

### Review comments don't count toward branch protection

`main` requires one approval before any pull request can merge. REVIEW's Approve and Request changes buttons post a real comment to the pull request, but not a formal GitHub review. This is because the pull request under review and the identity running REVIEW's automation are the same GitHub account, and GitHub blocks an account from formally approving its own pull request.

Two ways to close this gap exist. Add a second GitHub account to act as the reviewer identity, or accept that REVIEW demonstrates the review conversation without demonstrating the required-approval mechanism. This project takes the second path, since it avoids adding a second account for a single-repository portfolio project, and the comment itself is real, visible, and tied to the actual pull request.

### REVIEW loads one fixed pull request, not any pull request a visitor creates

WRITE lets a visitor create a real pull request from any open plan. REVIEW does not yet let a visitor review that pull request, or choose from a list of open ones. It loads a single, fixed example: the seed pull request, seeded specifically to contain a realistic technical error alongside a correct reference to check it against.

A picker was considered and rejected. Extending REVIEW to list and review any open pull request, including one a visitor just created themselves, surfaces a second problem this project hasn't solved: there is no visitor identity system anywhere in the build, so nothing distinguishes a visitor reviewing their own recent submission from a visitor reviewing someone else's. Building a picker without solving that problem would add complexity without adding realism. The fixed seed pull request avoids this by design, and reads as an intentional example to practice on rather than an incomplete review queue.  
