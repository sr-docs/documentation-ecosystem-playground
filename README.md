# Documentation Ecosystem Playground

Learn Docs as Code by doing it. This project walks you through a real documentation workflow, planning, writing, reviewing, publishing, and observing, using actual GitHub issues, branches, pull requests, and automation. Nothing here is simulated.

## Purpose

Most documentation portfolios show finished writing. This one shows the system behind it: how a plan becomes a draft, how a draft gets reviewed, and how automation keeps that process honest. The goal is to demonstrate documentation systems design, not just documentation.

## Core principles

| Principle | Decision |
|---|---|
| Unit of learning | A workflow slice, one real piece of work per stage |
| Center of gravity | The documentation ecosystem, not a single document |
| Learning style | Interactive. You do the work, not read about it |
| Automation | GitHub-native. No separate backend, no database |
| Portfolio goal | Demonstrate documentation systems design |

## The five stages

| Stage | Purpose | GitHub primitive | What you do |
|---|---|---|---|
| PLAN | Define the work | Issue | Write a brief: the problem, the audience, what success looks like |
| WRITE | Create the content | Branch and pull request | Draft a quick start guide, submit it as a real PR |
| REVIEW | Check the work | Pull request comment | Read the draft against a reference, approve it or request changes |
| PUBLISH | Ship it | GitHub Actions | Pick which checks to run, fix what fails, publish |
| OBSERVE | Learn from it | Issues and iteration | Look at real publish history, file an issue with what you'd do next |

All five stages are live and connected to real GitHub state.

## Your path through it

1. Land on the homepage.
2. Pick a stage.
3. Do the work: fill in a form, draft content, leave a review comment, run a check, or write an observation.
4. Watch GitHub respond in real time, an issue appears, a PR opens, a check runs.
5. Move to the next stage, or explore another one.

## What you'll come away understanding

| If you try this stage | You'll understand |
|---|---|
| PLAN | How documentation work gets scoped before anyone writes a word |
| WRITE | How real teams draft content in branches and pull requests, not documents |
| REVIEW | What a reviewer actually checks, and why review is a gate, not a formality |
| PUBLISH | Why publishing isn't a single click, and what automated checks catch |
| OBSERVE | How teams decide what to improve once something is already live |

## Known limitations

Two things are worth stating plainly, since they're deliberate choices, not oversights.

**REVIEW posts a comment, not a formal GitHub review.** The pull request under review and the account running REVIEW's automation are the same identity, and GitHub won't let an account approve its own pull request. Rather than add a second account just to satisfy this, REVIEW posts a real, visible comment on the actual PR instead. The review conversation is real. The formal approval mechanism isn't demonstrated.

**REVIEW always loads the same example pull request.** WRITE lets you open a real PR from any open plan, but REVIEW doesn't yet let you review the PR you just created, or pick from a list of open ones. It uses one fixed example instead: a draft seeded with a real, catchable error, and a correct reference to check it against. Building a picker here would surface a harder problem this project doesn't solve, there's no way to tell a visitor reviewing their own recent submission apart from one reviewing someone else's, since there's no visitor identity system at all.

More detail on both, along with the reasoning behind every major decision in this project, lives in `docs/design.md`.

## Project status

| Area | Status |
|---|---|
| Core lifecycle (PLAN through OBSERVE) | Built and working end to end |
| GitHub Pages deployment | Live |
| Multiple activities per stage | Not built. Each stage runs one real exercise, by design, not by gap |
| AI-assisted workflows | Deferred. Part of the original concept, intentionally left for later |
