# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

WatchVault is a digital passport platform for luxury watches: users register a watch (with a **hashed** serial number), append lifecycle events (service, transfer, authentication, notes), upload images, share a public passport via QR URL, and optionally anchor event hashes to an EVM chain.

The repo is a **monorepo with no root package.json**. Each surface is an independent npm package with its own dependencies and scripts:

- `backend/` — Express 5 + TypeScript API (ESM), Prisma → Neon Postgres
- `frontend/` — Next.js 16 App Router, Clerk, Zustand, Tailwind
- `native/` — Expo SDK 54 / React Native app (shares the same backend)
- `contracts/` — Hardhat / Solidity (`WatchRegistry.sol`)

Deeper docs live at the repo root: `Architecture.md` (system design + full deployment/env wiring), `Developer.md` (branch/env workflow), `Troubleshooting.md` (recurring bugs), `README.md` (setup), `Gaps.md`, `BRD.md`.

## Commands

Run all commands from inside the relevant package directory.

**Backend** (`backend/`):
```bash
npm run dev              # nodemon + tsx, serves http://localhost:3001
npm run build            # tsc
npm start                # node on built output
npm run prisma:generate  # regenerate Prisma client (into src/generated/prisma) — run after schema changes
npm run prisma:push      # push schema to the DB (no migration files; this repo uses db push, not migrate)
npm test                 # node --test over src/**/*.test.ts (tsx loader, JWT_SECRET injected)
# single test file:
JWT_SECRET=test-secret node --import tsx --test src/lib/hash.test.ts
```

**Frontend** (`frontend/`):
```bash
npm run dev      # next dev, http://localhost:3000
npm run build    # next build --webpack
npm run lint     # eslint
```

**Native** (`native/`):
```bash
npm run dev          # expo start
npm run typecheck    # tsc --noEmit  (no test/lint scripts defined)
npm run ios / android
```

**Contracts** (`contracts/`): `npx hardhat compile`, `npx hardhat node`, `npx hardhat run scripts/deploy.js --network localhost`.

## Architecture Notes (the non-obvious parts)

### Auth resolution — two token types on one middleware
[backend/src/middleware/auth.middleware.ts](backend/src/middleware/auth.middleware.ts) is the single gate. It first tries to verify the bearer token as a **legacy WatchVault JWT** (`jwt.verify` → `{ userId }`). On failure it falls back to **Clerk** token verification. Clerk users are mapped to a local `User` row by email, not by Clerk ID:
- It collects *all* of the Clerk user's email addresses and finds every matching local `User`.
- When multiple rows match, it picks the one owning the **most watches** (tie-break: primary email, then lowest id). This is deliberate account-merge behavior — be careful changing it.
- If no row exists, it creates one from the primary email.

Clerk `authorizedParties` defaults to `APP_BASE_URL`, so that env var must match the active frontend origin per environment or Clerk auth fails.

Frontend attaches tokens via an Axios interceptor in [frontend/src/lib/api.ts](frontend/src/lib/api.ts): a registered `tokenResolver` (Clerk) is preferred, falling back to `localStorage.getItem('token')` (legacy).

### Data model (`backend/prisma/schema.prisma`) is ahead of the docs
The Prisma schema carries more than the older docs describe. `WatchEvent` supports event types `MINT, SERVICE, TRANSFER, AUTH, NOTE, CONTRACT_UPLOADED, CONTRACT_SIGNED` and a full anchoring state machine: `anchorStatus` (`NOT_REQUIRED, PENDING, SUBMITTED, ANCHORED, FAILED_RETRYABLE, FAILED_FINAL`), `anchorAttempts`, `anchorError`, plus `chainId/contractAddress/txHash/blockNumber/logIndex/anchoredAt`. Trust the schema over prose.

Key invariants: `Watch.serialNumberHash` is unique and the **raw serial is never persisted** (hashed in [backend/src/lib/hash.ts](backend/src/lib/hash.ts)); `Watch.publicId` (uuid) drives public passport URLs; public serializers ([backend/src/serializers/](backend/src/serializers/)) strip owner-sensitive fields.

### Config & env loading
[backend/src/config/load-env.ts](backend/src/config/load-env.ts) loads `.env` first, then `.env.local` **with override** — so `.env.local` wins locally (this is where local Blob/DB credentials live). [backend/src/config/env.ts](backend/src/config/env.ts) parses and validates all env into a typed `env` object; when `BLOCKCHAIN_ENABLED=true` it enforces chain constraints (Base Sepolia `84532` for preview, Base Mainnet `8453` for production) and requires chain key/contract. Chain env is chosen by `CHAIN_ENV` (falling back to `VERCEL_ENV`).

### File uploads / images
Images are stored in **Vercel Blob as private objects** and served through an authenticated proxy route `GET /watches/:id/images/:fileId/content` (not directly). Storage abstraction: [backend/src/lib/blob-storage.ts](backend/src/lib/blob-storage.ts) prefers a long-lived `BLOB_READ_WRITE_TOKEN`, else short-lived OIDC (`VERCEL_OIDC_TOKEN`, ~12h). Locally, blank thumbnails almost always mean an expired OIDC token — see `Troubleshooting.md`. New uploads always go to Blob (`storageProvider = 'vercel_blob'`); the local-disk / `/uploads/*` path is a legacy fallback only (and per `Gaps.md` it would serve without auth if any `local` record existed — dead in practice).

### Backend entry points
`backend/src/index.ts` boots the local dev server; `backend/api/index.ts` (+ `backend/vercel.json`) is the Vercel serverless entrypoint. Both wrap the same Express app in [backend/src/app.ts](backend/src/app.ts). Note CORS is currently wide open (`app.use(cors())`).

## Deployment & Environments (critical for changes touching config)

Frontend and backend are **separate Vercel projects**, each with its own env vars. There are three lanes:

- `main` → production (`mywatchvault.app` / `api.mywatchvault.app`, Neon **production** branch)
- `staging` → shared preview (`*-git-staging-*.vercel.app`, Neon **preview** branch `br-quiet-recipe-akt7rocp`)
- short-lived feature branches → merge into `staging`, then `staging` → `main`

**Clerk is shared** across preview and production; **Neon is split by branch**. So the same signed-in user resolves against different databases depending on which backend served the request. Local backend dev points `DATABASE_URL`/`DIRECT_URL` at the Neon **preview** branch to avoid touching production.

Env vars that most commonly cause breakage when mismatched: `NEXT_PUBLIC_API_BASE_URL` (frontend calling the wrong backend → empty collections), `APP_BASE_URL` (Clerk `authorizedParties` mismatch → auth failures), `DATABASE_URL`/`DIRECT_URL` (wrong Neon branch → mixed data). `DIRECT_URL` is the direct connection for Prisma CLI; `DATABASE_URL` is the pooled runtime connection.

Do not develop directly on `main`. When changing infra/env behavior, update the corresponding root `.md` doc in the same change (existing convention).

## Operations

Prefer MCP-backed automation over manual vendor-console edits. `.mcp.json` (Claude Code) and `.codex/config.toml` (Codex) both declare two remote MCP servers — `vercel` (`https://mcp.vercel.com`) and `neon` (`https://mcp.neon.tech/mcp`) — that OAuth on first connect (run `/mcp` to trust + authenticate; this can't be done in a non-interactive session). CLI fallbacks: `npx vercel …` and `neonctl`/`psql`. Clerk is **not** wired as a management MCP — the official Clerk MCP is read-only docs only — so Clerk is managed via repo config + Vercel env vars.

## API Surface (backend)

Auth: `POST /auth/{register,login,google,facebook}` (legacy paths; Clerk is the primary hosted web path).
Watches: `POST /watches`, `GET /watches`, `GET /watches/:id`, `POST /watches/:id/events`, `POST /watches/:id/contracts`, `POST /watches/:id/images`, `GET /watches/:id/images/:fileId/content`, `DELETE /watches/:id/images/:fileId`.
Public/util: `GET /passports/:publicId`, `GET /uploads/*`, `GET /health`.
