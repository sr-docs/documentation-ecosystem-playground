# Documentation Ecosystem Playground: Design Narrative

## What this is

A working demonstration of a GitHub-native documentation workflow, built as a portfolio piece. Visitors move through the same lifecycle a real documentation team uses, and each stage maps to a real GitHub primitive, not a simulation of one.

| Question | Answer |
|---|---|
| What does a visitor do | Complete one real piece of documentation work per stage |
| What proves it's real | Each stage maps to an actual GitHub primitive (issue, branch, PR, action) |
| What is this not | A documentation theory site, or a simulated/sandboxed workflow |

## Why GitHub is the runtime, not just storage

| Option considered | Why rejected / accepted |
|---|---|
| Docusaurus-style content site with interactive elements | Rejected: centers content over systems, teaches by explaining rather than executing |
| GitHub as the backend (issues, branches, PRs, Actions) | Accepted: no separate database, no custom backend beyond a small proxy, repository is the system |

| Architectural rule | What it means |
|---|---|
| Frontend never executes logic | It only requests actions and displays state GitHub already holds |

## The PLAN stage: what's actually built

| Fact | Detail |
|---|---|
| Status | Fully wired to GitHub, working end to end |
| Visitor input | Problem, audience, documentation needed, success criteria |
| Result | Real GitHub Issue created in this repo |
| Labels applied | `playground`, `status:plan` |
| Why not call GitHub directly from the browser | Would expose a GitHub token client-side |
| How the token is protected | A Cloudflare Worker holds the token and forwards an authenticated `workflow_dispatch` request |
| How the issue is created | A GitHub Action receives the dispatch, creates the issue, stamps it with a request ID |
| How the frontend confirms success | Polls the GitHub Issues API, filtered by request ID, until the new issue appears |
| Why PLAN was built first | Proves the full pattern, visitor action → brokered event → automation run → visible result, before harder problems (scaling, task assignment, state) need solving |

## Why the other four stages are not yet wired

| Fact | Detail |
|---|---|
| Current state of WRITE, REVIEW, PUBLISH, OBSERVE | Full scenario content (situation, task, key decisions) is live; no GitHub action is wired behind any of them |
| Is this accidental | No, deliberate |
| Why PLAN doesn't have a collision problem | Every submission creates a new, independent Issue |
| Why WRITE does have a collision problem | Real documentation work happens in PRs; if every visitor edited the same branch, submissions would overwrite each other |

### Options under consideration for WRITE (decision not yet made)

| Option | Mechanism | Tradeoff |
|---|---|---|
| Real branch + real PR per visitor | Naming scheme like `user/{id}/write-{n}` to guarantee isolation | Most faithful to "real contributions" vision; requires a way to generate and eventually clean up disposable workspaces |
| Simulated pull request | Visitor edits a draft; system shows a PR-style view; nothing touches the real repo until explicit submission | Scales without limit, removes collisions entirely; feels less "real" than PLAN |
| Issue-only, like PLAN | Treat each WRITE submission as its own issue/artifact rather than a branch | Sidesteps collisions the same way PLAN does; loses the CI/PR texture WRITE is meant to demonstrate |

| Principle | Statement |
|---|---|
| Build order rule | This decision will be made and documented here before WRITE is built |
| Reason | Building WRITE before resolving this would repeat a known risk: describing a system in more advanced terms than what's actually running |

## The architecture: five layers, two built

| Layer | Role | Status |
|---|---|---|
| Experience layer | React frontend: stage picker, scenario content, exercise form. Holds no logic, only requests actions and reflects state | Built |
| Execution layer | GitHub itself: issues, branches, PRs, Actions | Built (for PLAN only) |
| Orchestration layer | GitHub Actions: assigns tasks, validates submissions, will eventually update state and trigger deployment | Partially built (handles PLAN issue creation only) |
| State layer | Tracks visitors and progress without a database, likely as per-user JSON files in the repo | Not built |
| Output layer | GitHub Pages, serving the built React app | Built (static deployment only) |

| Open question | Current answer |
|---|---|
| Does the system track returning visitors | No; every visitor experiences PLAN identically, with no memory of prior visits |
| Does a task engine or capability model exist | No |

### Why "rebuild-driven" was chosen for future multi-user state

| Model | Mechanism | Tradeoff |
|---|---|---|
| Rebuild-driven (chosen) | GitHub Actions update repo state, then trigger a rebuild that bakes the latest snapshot into the deployed site | Simple to implement and reason about; updates appear after the next rebuild, not instantly |
| Live API-polling frontend (rejected for now) | React fetches GitHub state directly at runtime | More complex (auth, rate limits); not needed yet given current scale |

| Note | Detail |
|---|---|
| Is the rebuild delay a problem | Considered acceptable for a learning/portfolio project; reinforces that CI/CD systems process work rather than respond instantly |

## What's deliberately out of scope for now

| Category from the original Workflow Slice Catalog | Status |
|---|---|
| Create new content | One activity (PLAN) built; rest of category deferred |
| Improve existing content | Deferred |
| Perform documentation review | Deferred |
| Publish documentation | Deferred |
| Maintain documentation | Deferred |
| Documentation operations (improve the review/contribution process itself) | Deferred |
| API documentation flow | Deferred, marked future expansion from the start |
| UX writing flow | Deferred, marked future expansion from the start |
| AI-assisted documentation flow | Deferred, marked future expansion from the start; was part of the original project concept |

| Principle | Statement |
|---|---|
| Why only one activity per stage exists | Building toward all nine categories before a single stage works end to end would repeat the over-scoping this project has worked to avoid |

## What this project is, honestly, right now

| Claim | Status |
|---|---|
| "A workflow orchestration engine" | Not yet true |
| "A working prototype of one full slice (PLAN) of a GitHub-native documentation workflow" | True |
| "Architecture documented for the remaining four stages" | True |
| "An open, named decision stands between this state and the next" | True |
