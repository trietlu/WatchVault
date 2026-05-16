# Developer Guide

This document defines the day-to-day development workflow for WatchVault.

## Branch Model

WatchVault uses three branch roles:

- `main`: production code
- `staging`: integrated pre-production code
- short-lived feature branches: isolated work in progress

This matches the hosted deployment model:

- `main` deploys to production Vercel domains
- `staging` deploys to the shared preview Vercel domains
- feature branches are temporary and should be merged or deleted quickly

## Expected Workflow

1. Start new work on a short-lived branch.
2. Keep the branch focused on one feature, bug fix, or operational change.
3. Merge the feature branch into `staging` for integrated testing.
4. Verify the `staging` frontend and backend previews on Vercel.
5. Merge `staging` into `main` when the combined change set is ready for production.
6. Delete the short-lived branch after merge.

## What Not To Do

- Do not do random direct development on `main`.
- Do not use `staging` as a personal scratch branch forever.
- Do not let `staging` drift for long periods without either promoting it to `main` or cleaning it up.
- Do not make ad hoc console changes without documenting the corresponding repository or environment impact.

## Environment Model

WatchVault has one codebase but multiple runtime environments.

- Local:
  - frontend at `http://localhost:3000`
  - backend at `http://localhost:3001`
  - backend local env currently points at the Neon preview branch for safer testing
- Staging:
  - frontend at `https://watch-vault-git-staging-trietlus-projects.vercel.app`
  - backend at `https://watch-vault-api-git-staging-trietlus-projects.vercel.app`
  - Neon preview branch
- Production:
  - frontend at `https://mywatchvault.app`
  - backend at `https://api.mywatchvault.app`
  - Neon production branch

Clerk is shared between staging and production. That means the same signed-in Clerk user can authenticate in both, but the backend resolves that user against different Neon branches depending on which environment handled the request.

## Environment Variables That Matter Most

Frontend:

- `NEXT_PUBLIC_APP_BASE_URL`: frontend origin
- `NEXT_PUBLIC_API_BASE_URL`: backend origin
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk web app binding

Backend:

- `APP_BASE_URL`: expected frontend origin for auth and URL generation
- `API_BASE_URL`: public backend origin for file and public link generation
- `DATABASE_URL`: pooled Neon runtime connection
- `DIRECT_URL`: direct Neon connection for Prisma workflows
- `CLERK_SECRET_KEY`: Clerk server verification secret

If these values do not line up by environment, the most common failures are:

- empty watch lists because the frontend is calling the wrong backend
- auth failures because the backend `APP_BASE_URL` does not match the active frontend origin
- production and preview data mixing because the backend points at the wrong Neon branch

## Operational Rules

Prefer MCP-backed automation through Codex over direct console work when possible.

- Use Vercel MCP for deployments, domains, logs, and environment variables.
- Use Neon MCP for branch inspection, SQL, and schema checks.
- Manage Clerk-related app behavior through repository changes and Vercel environment variables first.

This keeps infrastructure changes reproducible and easier to review.

## Release Checklist

Before merging `staging` into `main`:

1. Confirm the frontend `staging` preview loads.
2. Confirm the backend `staging` preview is healthy.
3. Confirm `staging` points at the Neon preview branch, not production.
4. Confirm production env values are still pointed at production domains and the production Neon branch.
5. Merge `staging` into `main`.
6. Verify production frontend and backend after deployment.
