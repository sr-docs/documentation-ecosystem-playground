# Documentation Ecosystem Playground

The **Documentation Ecosystem Playground** is an interactive, "real-world" demonstration of a complete documentation lifecycle. Not a simulation; this site interacts directly with **real GitHub state**, using Issues, Pull Requests, Branches, and Actions to walk visitors through a professional documentation workflow.

## The Workflow Loop
The project is structured as a five-stage loop where every action results in an observable change in the repository:

1.  **PLAN (Define the Ask):** Define documentation goals by filling out a brief, which creates a **real GitHub Issue**
2.  **WRITE (Draft It):** Select one of two tracks (Quick Start or API Reference) to draft content, commit to a seed branch, and request a review
3.  **REVIEW (Check It):** Act as a reviewer by reading live drafts and CI check results, then posting **real comments** to a Pull Request
4.  **PUBLISH (Ship It):** Run a battery of automated checks (e.g., link validation, Vale prose linting) and "publish" results to a dedicated history branch
5.  **OBSERVE (Learn from It):** Review the commit history of published content and file a final **observation issue** to close the loop for future visitors

## Technical Architecture
The system utilizes a modern, decoupled architecture to manage security and real-time state:

*   **Frontend:** A static **React** application hosted on **GitHub Pages**
*   **Proxy Layer:** A **Cloudflare Worker** that securely holds credentials (`GITHUB_TOKEN`, `WRITE_PAT`), manages rate limiting (10 req/min/IP), and validates all visitor input before dispatching to GitHub
*   **Backend:** The **GitHub REST API** and **GitHub Actions** serve as the engine for state retrieval and asynchronous execution

## Security & Safeguards
Because the site allows anonymous visitors to trigger GitHub workflows, several safeguards are in place:
*   **KNOWN_TRACKS Allowlist:** Restricts interactions to specific, hardcoded tracks (Quick Start Guide and API Reference)
*   **Input Validation:** Every workflow validates input fields, types, and lengths before execution
*   **Injection Prevention:** Visitor input is passed via environment variables (`env:`) rather than being spliced directly into script bodies, closing potential script and heredoc injection vectors

## Deliberate Limitations
To maintain the "everything is real" principle without a complex visitor identity system, the project accepts certain constraints:
*   **Comment-Based Reviews:** Because the system uses shared credentials, GitHub blocks formal self-approval. Reviews are instead handled via real PR comments
*   **Watermarked Content:** The system does not "gate" publishing; instead, it **watermarks** unreviewed content to maintain transparency and honesty about the review status
*   **Scheduled Cleanup:** To prevent repository clutter, a daily maintenance workflow deletes temporary branches and stale PRs older than 7 days

## Integrated Workflows
The project automates various documentation checks during the **PUBLISH** stage, including:
*   **Link & Heading Checks:** Verifies all links resolve and heading hierarchies are correct
*   **Instruction Consistency:** Ensures stated methods match provided examples
*   **Vale Style Check:** Validates prose against established style guidelines
