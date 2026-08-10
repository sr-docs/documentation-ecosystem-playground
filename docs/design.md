# Documentation Ecosystem Playground: Design Narrative

## What this is

A working demonstration of a GitHub-native documentation workflow, built as a portfolio piece. Visitors move through the same lifecycle a real documentation team uses, and each stage maps to a real GitHub primitive, not a simulation of one.

| Question | Answer |
|---|---|
| What does a visitor do | Complete one real piece of documentation work per stage, across two parallel content tracks |
| What proves it's real | Each stage maps to an actual GitHub primitive (issue, branch, PR, action) |
| What is this not | A documentation theory site, a simulated workflow, or a multi-page docs generator like Docusaurus, this is a single, cohesive interactive app |
| How many stages are built | Five: PLAN, WRITE, REVIEW, PUBLISH, OBSERVE, the full lifecycle |
| How many content tracks | Two: a quick start guide, and an API endpoint reference |

## Why GitHub is the runtime, not just storage

| Decision | Reasoning |
|---|---|
| GitHub as the backend (issues, branches, PRs, Actions) | No separate database, no custom backend beyond a small proxy. The repository is the system |
| Frontend never executes logic on its own | It only requests actions and displays state GitHub already holds |
| One continuous React page, not a static site generator | The site is a single interactive workflow, not a set of documentation pages. A framework built around content generation (Docusaurus, for example) would add scaffolding without solving anything this project needs |

## Page architecture

| Element | Design |
|---|---|
| Intro page | Shown once on load. A media placeholder, the tagline, an explicit "this is real" statement, and a "Let's go" button |
| Homepage | Always visible once revealed. A fixed workflow map at the top, a clickable title that acts as a home button |
| Default state | PLAN is pre-selected and expanded on first load, so a visitor never lands on blank space |
| Navigation | Clicking any stage in the map goes straight to its full content, no intermediate "Try This Stage" click. Selecting a different stage always collapses whatever was previously open |
| Per-stage layout | Task and key decisions, a media placeholder, a two-column field table (choices, plan details, references, status), then the interactive work area |

This structure replaced an earlier two-click design (select a stage, then separately click "Try This Stage") and a separate `ContextPanel` component. Both were merged into one continuous flow to remove redundant clicks.

## The content tracks

Two tracks exist, each with its own fixed seed branch and pull request. Neither track uses a picker across many real submissions.

| Track | Branch | Draft file | Seed PR | Reference checked in REVIEW |
|---|---|---|---|---|
| Quick start guide | `write/seed-quick-start` | `tasks/write-instances/nimbusauth_quick-start.md` | PR #47 | `nimbusauth-api-reference.md`, a documentation file |
| API reference | `write/seed-api-reference` | `tasks/write-instances/seed-api-reference.md` | PR #45 | `reference-code/routes/sessions.js`, real source code |

Each track carries one deliberate, planted defect, subtle by design rather than obvious at a skim:

- The quick start guide's login step says "Send a GET request," while its own code example shows a POST request.
- The API reference marks the `limit` parameter as optional in its parameter table, but its worked example shows the API returning an error saying `limit is required`.

The API reference track's clean, correct version also lives permanently at `docs/api-reference/sessions.md` on `main`, independent of the exercise, functioning as a standalone work sample.

### Why two tracks, and why not more

A third and fourth track (a UX writing flow, and an AI-assisted documentation flow) were scoped in early planning and deliberately deferred. The UX writing flow would need a different content model entirely, since its unit isn't a markdown document but short interface strings, meaning almost none of the existing check pipeline transfers. The AI-assisted flow was deferred for a firmer reason: it would need a live LLM API call from a public, visitor-facing button, with no visitor identity system to control cost or abuse, a real production concern this project hasn't solved and shouldn't build around casually.

### Why the reference for the API track is code, not another document

REVIEW originally checked the API reference draft against another document. That was changed deliberately: checking documentation against documentation doesn't test the skill REVIEW is meant to demonstrate. A real technical writer checks documentation against the actual implementation. `reference-code/routes/sessions.js` is a small, realistic Express route handler, checked into the repo specifically so a reviewer has something to verify the draft's claims against, the same way a writer would check against real code on any real team.

## PLAN: what's built

| Fact | Detail |
|---|---|
| Status | Fully wired, creates a real GitHub Issue |
| Scenario | The documentation team sits in sprint planning alongside the dev team from day one, rather than being brought in after code ships. The explicit requirement: plan the documentation needed to ship successfully, at this stage, not after |
| What happens on submit | `create-plan-issue.yml` creates the issue, labeled `playground`, `status:plan` |
| What happens next | The visitor sees a note that WRITE currently works from a fixed example draft, not the plan they just submitted, and a "Go to WRITE" button |

## WRITE: what's built

| Fact | Detail |
|---|---|
| Status | Fully wired. No longer creates new branches or issues real PLAN content; operates on the two fixed tracks |
| Entry point | A track picker, shown as the first row of a two-column table alongside the plan's title, problem, audience, and a source reference link |
| Source reference | Links to the track's REVIEW reference material, so a writer can check their fix against the same material a reviewer would use |
| Reviewer feedback | Shown only when the visitor arrives via REVIEW's "Request changes" path, pulled live from the PR's actual comment |
| What happens on save | `update-write-pr.yml` commits directly to the track's existing seed branch. No new branch, no new PR |
| CI | `lint-write-pr.yml` runs "Documentation checks" on every save: word count, instruction consistency, endpoint reference accuracy |
| Request review | `request-write-review.yml` marks the draft PR ready and assigns a reviewer |

### Why WRITE uses real branches and a real PR, not a simulation

Three options were weighed early: a real branch and PR, a simulated PR shown only in the browser, and an issue-only approach matching PLAN's pattern. Issue-only was initially favored for safety, then reversed, since it removed the one thing WRITE is meant to teach: branches, commits, and pull requests. Real branches were chosen, and the resulting risks, token scope, rate limits, abandoned branches, abuse, were each solved directly.

### Why WRITE eventually stopped reading real PLAN issues

WRITE originally offered a picker across real, visitor-created PLAN issues. This was reversed once it produced confusing, duplicate-looking entries, and once it became clear that REVIEW and PUBLISH had already converged on one fixed instance per track. WRITE was brought in line with that same model for consistency, and because a picker across an unbounded, growing list of real submissions reopens the same self-review ambiguity problem that was already solved for REVIEW.

## REVIEW: what's built

| Fact | Detail |
|---|---|
| Status | Fully wired, acts on the real, fixed pull request for whichever track is selected |
| What the visitor sees | A track picker, what the draft needs to do, a link to the source reference (a doc or real code depending on the track), a link to the real PR, live CI check results, and the live, rendered draft content |
| Rendering | Draft content and check results render through a custom markdown renderer, including real HTML tables, added after tables were initially displaying as literal pipe-delimited text |
| What happens on submit | `submit-pr-review.yml` posts a real comment to the pull request recording the decision and the visitor's comment. If the decision is "Changes requested," the PR is converted back to draft status via the GitHub API |

### Known limitations in REVIEW

**Review comments don't count toward branch protection.** `main` requires one approval before any pull request can merge. REVIEW's Approve and Request changes buttons post a real comment, not a formal GitHub review, because the pull request's author and the identity running REVIEW's automation are the same account, and GitHub blocks an account from formally approving its own pull request. Adding a second account to act as a distinct reviewer identity would close this gap, but was judged not worth the added complexity for a single-repository portfolio project. The comment itself is real, visible, and tied to the actual pull request; only the formal-approval mechanism isn't demonstrated.

**REVIEW loads one fixed pull request per track, not any pull request a visitor creates.** A picker across real submissions was considered and rejected, since nothing distinguishes a visitor reviewing their own recent submission from a visitor reviewing someone else's, without a visitor identity system this project doesn't have.

## PUBLISH: what's built

| Fact | Detail |
|---|---|
| Status | Fully wired, a genuine two-step process |
| Step 1 | The visitor selects checks and clicks "Run checks." `run-checks.yml` runs the six checks and writes results only, no publish happens yet |
| Step 2 | Once results return, a "Publish" (or "Publish anyway," if a check failed) button appears. `publish-quickstart.yml` re-runs the same checks, watermarks the content if unreviewed or if changes were requested, uploads an artifact, and commits the published result |
| Escape hatch | An "Edit the draft" button is available at all times, and appears prominently inside the failure warning when a check fails, routing the visitor back to WRITE |
| Switching tracks | Clears any prior check or publish results immediately, so a visitor never sees stale results from a different draft |

### Why PUBLISH became two steps instead of one

The original design combined "run checks" and "publish" into a single click. This made the check selection cosmetic: a visitor could select every check, have several fail, and publishing would happen identically regardless. Splitting into two explicit steps means a failed check is something the visitor actually sees and has to act on, either fixing the draft or consciously choosing to publish anyway, closer to how a real CI/CD pipeline gates a real deployment decision.

### Checks

| Check | What it verifies | Applies to |
|---|---|---|
| Link check | Every link resolves | Both tracks |
| Heading structure check | Headings step down in order, none skipped | Both tracks |
| Code block formatting check | Every fence is properly closed | Both tracks |
| Instruction consistency check | Stated method matches the code example | Quick start track |
| Endpoint reference accuracy check | Optional parameters aren't contradicted by the example | API reference track |
| Vale style check | Filler words and phrasing against a custom style config (`.vale/styles/Playground`) | Both tracks |

## OBSERVE: what's built

| Fact | Detail |
|---|---|
| Status | Fully wired, built around real accumulated publish history across both tracks |
| What the visitor sees | A chronological list of past PUBLISH runs, each with its real review status and check outcome, pulled from commit history on the `publish-results` branch |
| What happens on submit | A single combined observation field (an earlier version used two separate fields for "what happened" and "what should happen next"; these were merged, since visitors naturally wrote both ideas in one breath) becomes a real issue labeled `status:observe`, closing the lifecycle loop |

## Real-time data and retry handling

Reading review status and publish results relies on GitHub's eventual consistency, a comment or file written moments earlier isn't always immediately readable back. Both `fetchReviewCommentInfo` and `fetchPublishedFile` retry up to three times, spaced roughly 700ms apart, before falling back to an "unknown" state. This addressed an intermittent bug where PUBLISH's review status and OBSERVE's history entries would occasionally read "Unknown" immediately after a real, successful action.

## The architecture: five layers

| Layer | Role | Status |
|---|---|---|
| Experience layer | React frontend across all five stages, one continuous page | Built |
| Execution layer | GitHub itself: issues, branches, PRs, Actions | Built |
| Orchestration layer | GitHub Actions workflows covering creation, validation, cleanup, and reporting across all five stages and both tracks | Built |
| State layer | No database. State lives in GitHub: issue bodies, PR comments, committed files on dedicated branches | Built, GitHub-native by design |
| Output layer | GitHub Pages, serving the built React app | Built |

The state layer was originally planned as per-user JSON files tracking capability vectors and progression. That was never built, since no visitor identity system exists. State instead lives implicitly in GitHub's own primitives, a smaller, more honest version of the original plan.

## Security hardening

| Fix | Detail |
|---|---|
| Script injection | Closed. All workflows pass visitor input via `env:`, never spliced directly into `${{ }}` inside a script body |
| Server-side input validation | The Worker validates every workflow's inputs for exact fields, types, and lengths before dispatch, independent of whatever the frontend already validates |
| Known-track allowlist | `update-write-pr.yml`, `request-write-review.yml`, and `submit-pr-review.yml` only accept branch, file path, and PR number combinations matching a hardcoded, known pair. A direct call to the Worker bypassing the UI can't target an arbitrary branch or PR |
| Vale binary integrity | Checksum-verified against the published release before installation |
| Heredoc injection | Closed, replaced with `printf`-based file writes in every issue- and comment-creating workflow |
| Branch protection | The repository owner is exempted from required review, so legitimate maintenance work isn't blocked by the same rule that governs the visitor-facing review flow |
| Git push authentication | Checkout steps that later push using `WRITE_PAT` use `persist-credentials: false`, preventing the default ambient `GITHUB_TOKEN` credential from silently intercepting the push |

## What's deliberately out of scope

| Category | Status |
|---|---|
| Wider catalog: improving existing content, documentation operations, maintenance workflows | Deferred, the two built tracks (create new content, review workflows) were prioritized first |
| UX writing flow | Deferred. Needs a different content model (short interface strings, not documents), so little of the existing check pipeline transfers |
| AI-assisted documentation flow | Deferred. Needs its own cost and abuse-control design, since it would require a live, cost-bearing LLM call from a public button with no visitor identity to gate it |
| Bot identity for playground-authored content | Not built. All GitHub activity currently authenticates as the repository owner's personal token, so every comment and PR shows the owner as author, not a distinct bot identity. A second account was considered as the fix, and documented as a future improvement rather than built |

## Known, accepted technical debt

| Item | Detail |
|---|---|
| Duplicated check logic | `run-checks.yml` and `publish-quickstart.yml` each contain the full, identical set of six check steps written out separately, rather than sharing a single composite action. A refactor was designed but not applied. Both workflows function correctly as written; this is a maintenance cost, not a functional defect |
| Cleanup workflow overlap | A workflow named "Cleanup Publish Artifacts" was observed running roughly every two hours, a frequency that doesn't match any workflow documented here (`cleanup-write-branches.yml` and `cleanup-publish-results.yml` are both daily). This likely indicates a leftover or duplicate workflow file from an earlier iteration, not yet identified or removed |

## What this project is, honestly, right now

| Claim | Status |
|---|---|
| "A working system covering the full PLAN → WRITE → REVIEW → PUBLISH → OBSERVE lifecycle, across two independent content tracks, each backed by real GitHub state" | True |
| "Every action a visitor takes produces a real, verifiable GitHub artifact" | True |
| "State lives natively in GitHub, with no visitor identity system and no database" | True, and named as the reason several features (a REVIEW picker, a hard publish gate, per-user progression, real formal approvals) were deliberately not built |
| "Every known gap between the design and the build is documented here, not hidden" | True |
| "A workflow orchestration engine with capability tracking and adaptive task assignment" | Not built. Early architecture discussions explored this; the actual system took a smaller, more honest path |