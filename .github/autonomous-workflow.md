# Autonomous coding workflow

How WatchVault turns intent into agent-completable work. The unit of autonomous work is a **single, scoped GitHub issue** with clear acceptance criteria.

## The flow

1. **Planning issue** (`planning`) — a human (or agent) opens a planning task describing an outcome. Its deliverable is a **reviewed plan** that decomposes the work into implementation-sized tasks, each with a description and acceptance criteria. Use the *Planning task* template.
2. **Human review** — the operator reviews the plan (the planning issue stays `needs-review` until this happens). Feedback is incorporated or explicitly deferred.
3. **Implementation issues** (`agent-ready`) — each task from the approved plan becomes its own issue using the *Implementation task* template. Once labeled `agent-ready`, an autonomous agent can pick it up and complete it end to end.
4. **Delivery** — the agent works on a short-lived feature branch, merges into `staging`, and verifies on the preview stack. `staging` → `main` promotion is a human decision (see `Developer.md`).

## Labels

| Label | Meaning |
| --- | --- |
| `planning` | Design/planning task; its output is a plan + follow-up issues, not shipped code. |
| `agent-ready` | Scoped and specified well enough for an autonomous agent to implement without further clarification. |
| `needs-review` | Blocked awaiting human-operator review (plan approval, risky change, etc.). |
| `blockchain` | On-chain anchoring / smart-contract work. |

## What makes an issue "agent-ready"

- The **description** is specific enough to start without clarifying questions.
- **Affected areas** (files/dirs/subsystems) are named.
- **Dependencies/order** are explicit (`Blocked by #NN`).
- **Acceptance criteria** are objectively verifiable, including how correctness is demonstrated (tests or a concrete manual flow).
- Scope fits one focused branch — if it needs a plan, it's a `planning` issue, not `agent-ready`.

## Agent authentication (GitHub)

The GitHub CLI (`gh`) is installed. It can create/label/close issues and PRs for the flow above.

- **No token is stored in the repo or a dotfile.** Derive it from the macOS keychain at runtime and export it for the session:
  ```bash
  export GH_TOKEN=$(printf 'protocol=https\nhost=github.com\n\n' | git credential fill | sed -n 's/^password=//p')
  gh issue list --repo trietlu/WatchVault
  ```
  `GH_TOKEN` bypasses `gh auth login`'s strict scope check, so the existing credential (`repo, workflow`) works even though it lacks `read:org`.
- **Cleaner long-term option:** create a classic PAT with `repo` + `read:org` (+ `workflow`) scopes and run `gh auth login` once interactively. Then `gh` works without the `GH_TOKEN` shim.
- The REST API with the same keychain credential is always a fallback (used to bootstrap issue #2 and these labels).

## Ground rules for agents

- Read `CLAUDE.md` and the relevant root `*.md` docs before starting.
- Never develop directly on `main`; use a short-lived feature branch → `staging`.
- Keep infrastructure/env/API docs in sync with code changes in the same PR (repo convention).
- Do not cross environment boundaries (e.g. staging must never write to production chains/data).
