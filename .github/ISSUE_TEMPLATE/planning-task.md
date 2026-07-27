---
name: Planning task
about: A design/planning task that produces a reviewed plan and a set of implementation issues
title: "Plan: <what is being planned>"
labels: ["planning", "needs-review"]
---

## Summary

<One or two sentences: what plan is being produced and why. State that this is a planning task and implementation happens in the follow-up issues the plan produces.>

## Goal

<The outcome the eventual implementation should achieve.>

## Current state

<Ground the plan in what already exists. Reference concrete files/areas so the agent extends rather than rebuilds.>

## What the plan must cover

<Bulleted list of the areas the plan must decompose into tasks.>

## Deliverable

A plan document (e.g. `docs/plans/<name>.md`, or a comment on this issue) that lists each task with:

- **Title** (issue-ready)
- **Description** (scope, affected files/areas, dependencies/order)
- **Acceptance criteria** (objectively verifiable)

## Acceptance criteria (this issue)

- [ ] A plan is created that decomposes the work into discrete, issue-ready tasks.
- [ ] Each task in the plan has a description and its own acceptance criteria.
- [ ] The plan is reviewed with the human operator and feedback is incorporated (or explicitly deferred).

## Notes

<Constraints, links, suggested labels for the follow-up issues.>
