---
name: Implementation task (agent-ready)
about: A single, scoped unit of work an autonomous agent can complete end to end
title: "<concise imperative title>"
labels: ["agent-ready"]
---

## Description

<What to build/change and why. Be specific enough that an agent can start without further clarification.>

## Affected areas

<Files, directories, or subsystems expected to change (e.g. `backend/src/controllers/watch.controller.ts`, `contracts/`). Note new files to add.>

## Dependencies / order

<Issues that must be done first (e.g. "Blocked by #NN"), and anything this unblocks.>

## Implementation notes

<Approach hints, constraints, gotchas, relevant existing patterns to follow. Reference `CLAUDE.md` and the root `*.md` docs where useful.>

## Acceptance criteria

- [ ] <Objectively verifiable outcome 1>
- [ ] <Objectively verifiable outcome 2>
- [ ] Tests/verification: <how correctness is demonstrated — unit test, manual flow, etc.>

## Definition of done

- [ ] Change implemented on a short-lived feature branch and merged into `staging` (never developed directly on `main`).
- [ ] Verified on the `staging` preview stack.
- [ ] Docs updated when infrastructure/env/API behavior changes (repo convention).
