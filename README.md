# Documentation Ecosystem Playground

An interactive environment that demonstrates how modern documentation moves through a real GitHub workflow: planning, writing, review, and publishing. Visitors complete real workflow slices. The system runs on GitHub Issues, branches, pull requests, and Actions, not a simulation of them.

## Why this exists

This project shows the system behind the writing: how a plan becomes a draft, how a draft gets reviewed, and how automation keeps that process honest. The goal is to demonstrate documentation systems design, not just documentation.

## What it proves

The build log for this project has more than 50 individual tasks. The five decisions below are the ones that actually matter.

| Decision | What it demonstrates |
|---|---|
| Chose a GitHub-native workflow engine over a content-first documentation site | The system had to run on real GitHub primitives, issues, branches, pull requests, and Actions, rather than a page-based site with GitHub features bolted on. This shaped every decision that followed |
| Solved the multi-user collision problem by isolating every visitor's work into its own branch and pull request | Real documentation work happens in pull requests. If every visitor edited the same branch, submissions would overwrite each other. Each draft gets a unique branch, tied to a generated request ID, so the system scales without conflicts |
| Chose real branches and pull requests over a simulated review flow, then engineered around the resulting risks | A simulated review is safer but dishonest about what the system actually does. Real pull requests introduced real problems, token scope, rate limits, cleanup, abuse prevention, and each one got a specific, documented fix rather than a workaround that quietly narrowed the original design |
| Found and closed a review gate that could be silently bypassed | Pull requests could merge with no review step at all. Fixed by opening every submission as a draft, requiring an explicit review request, and adding branch protection so merging depends on a real approval decision |
| Documented every place the current build doesn't yet match the original design | Not every stage of the system is finished. Rather than let the gap go unstated, each open decision, deferred feature, and known limitation is written down as it's found. A hiring manager can see exactly what's built, what's designed but not built, and why |

## Current state

| Stage | Status | GitHub primitive |
|---|---|---|
| PLAN | Live | Issue |
| WRITE | Live | Branch and pull request |
| REVIEW | Live | Pull request comment |
| PUBLISH | Not yet built | GitHub Actions |
| OBSERVE | Not yet built | Issues and iteration |

## What's deliberately out of scope, for now

- A wider catalog of documentation activities (API docs, UX writing, AI-assisted drafting) was mapped early on and intentionally deferred until the core PLAN through REVIEW loop was proven end to end.
- REVIEW currently posts a comment rather than a formal GitHub review, since the review identity and the pull request author are the same account. This is a documented limitation, not an oversight.
- REVIEW loads one fixed example pull request rather than any real visitor submission. Extending it to review live submissions is a scoped, not-yet-built next step.

## Read more

The full design narrative, including every architectural decision, rejected alternative, and open question, lives in `docs/design.md`.
