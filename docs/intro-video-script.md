# Intro video script: Docs that ship with the release

Production script for the landing intro (~20–30s). Silent-friendly: burn in or ship captions. Prefer screen-native motion over talking-head or team-conflict drama.

Audience: hiring managers and eng leaders evaluating a docs-as-code portfolio piece.

## On-screen titles (captions)

| Time | Title / caption |
|---|---|
| 0:00–0:04 | Plan docs with the feature — this sprint |
| 0:04–0:10 | Draft in Git. Verify against the source. |
| 0:10–0:16 | Review the PR. Checks catch what eyes miss. |
| 0:16–0:22 | Publish with the release |
| 0:22–0:26 | Observe what shipped. Improve the next pass. |
| 0:26–0:30 | Plan → Write → Review → Publish → Observe — try it on real GitHub |

## Beat sheet

### Beat 1 — PLAN (0–4s)
- Visual: Sprint board or GitHub Issue titled “Auth API — docs needed this sprint.”
- Skill: Docs scoped with the feature, not after ship.
- Avoid: Blame for excluding docs from the sprint.

### Beat 2 — WRITE (4–10s)
- Visual: Markdown beside `sessions.js` (or similar). Small accuracy fix (method or param mismatch).
- Skill: Drafts in Git; technical verification against source.

### Beat 3 — REVIEW + tooling (10–16s)
- Visual: PR + CI (link / Vale / consistency). Review note: “checked against implementation.”
- Skill: Peer review plus automated quality gates.

### Beat 4 — PUBLISH (16–22s)
- Visual: Green pipeline / publish decision. Cue: “published with release.”
- Skill: Docs as a shippable artifact, not a wiki afterthought.

### Beat 5 — OBSERVE (22–26s)
- Visual: Publish history → follow-up issue.
- Skill: Lifecycle ownership, not one-and-done prose.

### Beat 6 — CTA (26–30s)
- Visual: Playground UI.
- End card: “Explore the workflow — every action hits real GitHub.”
- Match IntroPage CTA: Explore the workflow.

## Explicitly avoid

- Blame frame (“devs kicked docs out of the sprint”)
- Savior frame (“the right tech writer arrives”)
- Long backstory before the workflow appears
- Abstract metaphors with no GitHub UI
- Ending on “hire me” instead of “try the system”

## Optional opener (≤2s)

Split screen only: left = docs opened after ship (stale); right = docs in the same PR/pipeline. Then enter Beat 1. Keep contrast framing, not the whole story.

## Page copy sync

- H1: Great software needs documentation that keeps up
- End card: Plan → Write → Review → Publish → Observe — try it on real GitHub
