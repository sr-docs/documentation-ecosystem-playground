# Documentation Ecosystem Playground: Design Narrative

## What this is

A working demonstration of a GitHub-native documentation workflow, built as a portfolio piece. Visitors move through the same lifecycle a real documentation team uses, and each stage maps to a real GitHub primitive, not a simulation of one.

| Question | Answer |
|---|---|
| What does a visitor do | Complete one real piece of documentation work per stage |
| What proves it's real | Each stage maps to an actual GitHub primitive (issue, branch, PR, action) |
| What is this not | A documentation theory site, or a simulated/sandboxed workflow |
| How many stages are built | Five: PLAN, WRITE, REVIEW, PUBLISH, OBSERVE, the full lifecycle |

## Why GitHub is the runtime, not just storage

| Option considered | Why rejected / accepted |
|---|---|
| Docusaurus-style content site with interactive elements | Rejected: centers content over systems, teaches by explaining rather than executing |
| GitHub as the backend (issues, branches, PRs, Actions) | Accepted: no separate database, no custom backend beyond a small proxy, repository is the system |

| Architectural rule | What it means |
|---|---|
| Frontend never executes logic | It only requests actions and displays state GitHub already holds |

## PLAN: what's built

| Fact | Detail |
|---|---|
| Status | Fully wired to GitHub, working end to end |
| Visitor input | Problem, audience, documentation needed, success criteria |
| Result | Real GitHub Issue created in this repo, labeled `playground`, `status:plan` |
| How the token is protected | A Cloudflare Worker holds the token and forwards an authenticated `workflow_dispatch` request |
| How the frontend confirms success | Polls the GitHub Issues API, filtered by request ID, until the new issue appears |

## WRITE: what's built

| Fact | Detail |
|---|---|
| Status | Fully wired, produces real branches and pull requests |
| Entry point | A picker of open PLAN issues, with a permanent fallback issue if none are open |
| What happens on submit | Creates branch `write/{requestId}`, commits the draft to `tasks/write-instances/{requestId}.md`, opens a draft PR labeled `status:write` |
| Why a draft PR, not immediately open | Review is a separate, explicit step. A visitor must click "Request Review" to mark the PR ready and assign a reviewer |
| CI | `lint-write-pr.yml` runs automatically on every WRITE pull request |
| Cleanup | `cleanup-write-branches.yml` closes and deletes PRs and branches older than 7 days |
| Traceability | `comment-on-plan-issue.yml` posts a comment on the original PLAN issue linking to the new PR, so a PM can track progress without doing the writing themselves |

### Why WRITE uses real branches and PRs, not a simulation

Three options were weighed: a real branch and PR per visitor, a simulated PR shown only in the browser, or an issue-only approach matching PLAN's pattern. The issue-only option was initially favored for safety, then reversed once it became clear it removed the one thing WRITE is meant to teach: branches, commits, and pull requests. Real branches were chosen, with the resulting risks (token scope, rate limits, abandoned branches, abuse) each solved directly rather than avoided.

## REVIEW: what's built

| Fact | Detail |
|---|---|
| Status | Fully wired, acts on a real, fixed pull request (PR #28) |
| What the visitor sees | Live draft content fetched from the seed branch, live CI check results, the linked PLAN issue's success criteria, and a link to the API reference as a source of truth |
| What happens on submit | A real comment is posted to the pull request via `submit-pr-review.yml`, recording the decision (Approved or Changes requested) and the visitor's comment |

### Known limitations in REVIEW

REVIEW works end to end: it loads a real pull request, shows live draft content and CI status, and posts a real comment back to GitHub. Two limitations are worth stating directly, since they're deliberate scoping decisions, not oversights.

**Review comments don't count toward branch protection.** `main` requires one approval before any pull request can merge. REVIEW's Approve and Request changes buttons post a real comment to the pull request, but not a formal GitHub review. This is because the pull request under review and the identity running REVIEW's automation are the same GitHub account, and GitHub blocks an account from formally approving its own pull request. Two ways to close this gap exist: add a second GitHub account to act as the reviewer identity, or accept that REVIEW demonstrates the review conversation without demonstrating the required-approval mechanism. This project takes the second path, since it avoids adding a second account for a single-repository portfolio project, and the comment itself is real, visible, and tied to the actual pull request.

**REVIEW loads one fixed pull request, not any pull request a visitor creates.** WRITE lets a visitor create a real pull request from any open plan. REVIEW does not let a visitor review that pull request, or choose from a list of open ones. It loads a single, fixed example: the seed pull request, seeded specifically to contain a realistic technical error (a GET request described where the code sample shows POST) alongside a correct reference to check it against. A picker was considered and rejected. Extending REVIEW to list and review any open pull request, including one a visitor just created themselves, surfaces a problem this project hasn't solved: there is no visitor identity system anywhere in the build, so nothing distinguishes a visitor reviewing their own recent submission from a visitor reviewing someone else's. The fixed seed pull request avoids this by design, and reads as an intentional example to practice on rather than an incomplete review queue.

## PUBLISH: what's built

| Fact | Detail |
|---|---|
| Status | Fully wired, runs real, visitor-configurable checks and publishes a real artifact |
| What the visitor sees | The current review status (fetched live from the seed PR's comments), an editable draft pre-filled with live content, and four check options |
| Checks available | Link check, heading structure check, code block formatting check, Vale style check |
| Why checks are pre-built, not visitor-authored | Visitor-authored workflow logic would run with access to repository secrets. Every check is fixed and repo-controlled; the visitor only chooses which ones to run, never what they do |
| What happens on submit | `publish-quickstart.yml` runs the selected checks against the visitor's draft, uploads the result as a workflow artifact, and commits both the draft and the results to `publish-results/{requestId}/` on a dedicated branch |
| Why results are also committed, not just uploaded as an artifact | GitHub Actions artifacts require a download to view. Committing the results to a branch lets the frontend fetch and display them inline, consistent with how every other stage shows its result directly on the page |
| Unreviewed content | If the review status is `not-reviewed` at the moment of publishing, the workflow prepends a visible watermark to the published content: "NOT REVIEWED. This draft was published without going through REVIEW." No hard gate blocks publishing, since no visitor identity system exists to enforce one reliably. The watermark makes the gap honest instead of silently absent |
| Cleanup | `cleanup-publish-results.yml` removes `publish-results/{requestId}/` folders past a retention window, keeping the branch from growing without bound while preserving enough history for OBSERVE to work with |

### Why PUBLISH is a real, repeatable check-and-fix loop, not a read-only history view

The original design considered a simpler version: a page that only linked out to the site's actual build and deploy history, useful, but read-only, with nothing for a visitor to act on. Reworked into its built form, PUBLISH lets a visitor edit the draft, choose checks, run them, see results, and try again, closing the loop that a read-only view could not.

## OBSERVE: what's built

| Fact | Detail |
|---|---|
| Status | Fully wired, built around real accumulated publish history |
| What the visitor sees | A real, chronological list of past PUBLISH runs, each with its actual review status and how many checks failed, pulled from the `publish-results` branch's commit history |
| What happens on submit | The visitor writes an observation and a recommendation, and `create-observe-issue.yml` creates a real GitHub issue labeled `status:observe`, closing the lifecycle loop, since this issue could seed the next visitor's PLAN |

### Why OBSERVE uses real publish history instead of invented analytics

The original scenario described fabricated usage data: a 40% skip rate, hypothetical support tickets. This was replaced with the system's own real history once PUBLISH existed to generate it. No real user analytics exist for this project, since it isn't a live product with real readers. Building OBSERVE around real publish history, rather than simulated user behavior, keeps the same "real, not simulated" principle that shaped every other stage, and gives the visitor something to reason about that is genuinely true, if narrower than production analytics would be.

## The architecture: five layers

| Layer | Role | Status |
|---|---|---|
| Experience layer | React frontend across all five stages. Holds no logic, only requests actions and reflects state | Built |
| Execution layer | GitHub itself: issues, branches, PRs, Actions | Built |
| Orchestration layer | GitHub Actions: 13 workflows covering creation, validation, cleanup, and reporting across all five stages | Built |
| State layer | No database. State lives entirely in GitHub: issue bodies, PR comments, committed files on dedicated branches | Built, GitHub-native by design |
| Output layer | GitHub Pages, serving the built React app | Built |

The state layer was originally planned as per-user JSON files tracking capability vectors and progression. That model was never built, since no visitor identity system exists. Instead, state lives implicitly in GitHub's own primitives: an issue's existence, a PR's comment history, a branch's commit log. This is a smaller, more honest version of the original plan, not full task-engine orchestration, but real, inspectable, GitHub-native memory.

## What's deliberately out of scope

| Category from the original Workflow Slice Catalog | Status |
|---|---|
| Create new content | One activity (PLAN, WRITE) built and wired |
| Improve existing content | Deferred |
| Perform documentation review | One activity (REVIEW) built and wired |
| Publish documentation | One activity (PUBLISH) built and wired |
| Maintain documentation | Partially addressed by OBSERVE's reflection step, not built as a standalone flow |
| Documentation operations (improve the review/contribution process itself) | Deferred |
| API documentation flow | Deferred, marked future expansion from the start |
| UX writing flow | Deferred, marked future expansion from the start |
| AI-assisted documentation flow | Deferred, marked future expansion from the start; was part of the original project concept |

| Principle | Statement |
|---|---|
| Why only one activity per stage exists | Building toward all nine catalog categories before the core lifecycle worked end to end would have repeated the over-scoping this project worked to avoid. With PLAN through OBSERVE now proven, revisiting the catalog is the honest next step, not a shortcut taken early |

## What this project is, honestly, right now

| Claim | Status |
|---|---|
| "A workflow orchestration engine with capability tracking and adaptive task assignment" | Not built. The original architecture discussions explored this; the actual system took a smaller, more honest path |
| "A working system covering the full PLAN → WRITE → REVIEW → PUBLISH → OBSERVE lifecycle, each stage backed by real GitHub state" | True |
| "Every known gap between the design and the build is documented here, not hidden" | True |
| "State lives natively in GitHub, with no visitor identity system and no database" | True, and named as the reason certain features (a REVIEW picker, a hard publish gate, per-user progression) were deliberately not built |

A picker was considered and rejected. Extending REVIEW to list and review any open pull request, including one a visitor just created themselves, surfaces a second problem this project hasn't solved: there is no visitor identity system anywhere in the build, so nothing distinguishes a visitor reviewing their own recent submission from a visitor reviewing someone else's. Building a picker without solving that problem would add complexity without adding realism. The fixed seed pull request avoids this by design, and reads as an intentional example to practice on rather than an incomplete review queue.  
