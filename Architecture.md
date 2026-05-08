# WatchVault Architecture

## 1. Purpose

This document defines the current WatchVault architecture and operating model. It covers:

- System components and responsibilities
- Data model and API boundaries
- End-to-end data flow for core user journeys
- Security, deployment, environment, and scale considerations

## 2. Product Context

WatchVault is a digital passport platform for luxury watches. It lets users:

- Authenticate into the platform
- Create a watch record with a hashed serial number
- Add lifecycle events such as service, transfer, authentication, and notes
- Upload watch images
- Share a public passport via QR URL
- Optionally anchor event hashes to Ethereum

## 3. High-Level Architecture

```text
Clients
  - Web App (Next.js)
  - Mobile App (React Native / Expo)
           |
           | HTTPS
           v
Frontend Hosting (Vercel, web only)
  - Production: mywatchvault.app
  - Preview: branch-specific Vercel URL
           |
           | NEXT_PUBLIC_API_BASE_URL
           v
Backend API (Node.js + Express + TypeScript, separate Vercel project)
  - Auth routes/controllers
  - Watch routes/controllers
  - Public passport route/controller
  - File upload route/controller
           |
           +--> Prisma ORM --> Neon Postgres (shared)
           |
           +--> Clerk token verification and user lookup
           |
           +--> Local uploads in dev / Vercel /tmp in hosted runtime
           |
           +--> EVM RPC via ethers.js (optional blockchain anchoring)
```

## 4. Current Codebase Components

### 4.1 Frontend (Web, Next.js App Router)

Location: `frontend/src`

- `app/`
  - Public pages: `/` and `/p/[publicId]`
  - Auth-related routes and gated pages such as `/dashboard`, `/watches/new`, `/watches/[id]`, and `/watches/[id]/add-event`
- `components/`
  - Shared UI, auth controls, watch cards, and loading states
- `stores/`
  - `useAuthStore.ts`
  - `useWatchStore.ts`
- `lib/`
  - `api.ts` Axios client and auth header handling
  - `config.ts` app/API URL helpers

State and session:

- Clerk is the primary web session source.
- Legacy JWT state still exists for backward compatibility and non-Clerk flows.
- The frontend prefers Clerk bearer tokens when present and only falls back to older persisted tokens when needed.

### 4.2 Backend (Express API)

Location: `backend/src`

- Entry and app wiring:
  - `index.ts` boots the local dev server
  - `app.ts` configures middleware and route mounts
  - `../api/index.ts` is the Vercel entrypoint for the hosted API
- Routes:
  - `auth.routes.ts` -> `/auth/*`
  - `watch.routes.ts` -> `/watches/*`
  - `public.routes.ts` -> `/passports/*`
  - `file.routes.ts` -> `/files/*`
- Controllers:
  - `auth.controller.ts`
  - `watch.controller.ts`
  - `public.controller.ts`
  - `file.controller.ts`
- Middleware:
  - `auth.middleware.ts` for JWT validation, Clerk token verification, and local user resolution
  - `upload.middleware.ts` for Multer image constraints
- Infra/config:
  - `config/env.ts` for env parsing and validation
  - `config/contract.ts` for blockchain client wiring
  - `lib/uploads.ts` for runtime-aware upload path handling

### 4.3 Database and ORM

- Prisma schema: `backend/prisma/schema.prisma`
- Datasource: PostgreSQL
- Current managed database: Neon Postgres project with separate production and preview branches
- Core models:
  - `User`
  - `Watch`
  - `WatchEvent`
  - `FileRecord`

### 4.4 Smart Contract

Location: `contracts/contracts/WatchRegistry.sol`

- Event registry contract
- Main function: `recordEvent(bytes32 watchHash, uint8 eventType, bytes32 payloadHash)`
- Emits `EventRecorded`

### 4.5 Mobile App (React Native, implemented)

Location: `native/src`

- Framework/runtime:
  - Expo SDK 54 + React Native 0.81
  - TypeScript strict mode
- Navigation:
  - Native stack navigator with split unauthenticated/authenticated stacks
  - Deep link mapping for auth, dashboard, watch detail/event routes, and public passport routes
- Auth/session state:
  - Zustand persisted store
  - Secure token persistence through Expo SecureStore
- API integration:
  - Uses the same backend resources as web
- UI system:
  - Shared primitives such as `Screen`, `Card`, `PrimaryButton`, and `SecondaryButton`
  - Central color tokens and branded assets

## 5. API Surface

### 5.1 Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google`
- `POST /auth/facebook`

### 5.2 Watches

- `POST /watches`
- `GET /watches`
- `GET /watches/:id`
- `POST /watches/:id/events`
- `POST /watches/:id/images`
- `DELETE /watches/:id/images/:fileId`

### 5.3 Public and Files

- `GET /passports/:publicId`
- `POST /files/upload`
- `GET /uploads/*`
- `GET /health`

## 6. Data Model and Domain Rules

### 6.1 User

- Unique email
- Can support password auth, provider identifiers, and Clerk-based resolution

### 6.2 Watch

- Owned by one user
- Raw serial number is never persisted
- `serialNumberHash` is stored and unique
- `publicId` is used for public passport URLs

### 6.3 WatchEvent

- Event types include `MINT`, `SERVICE`, `TRANSFER`, `AUTH`, and `NOTE`
- `payloadJson` and derived `payloadHash` are persisted
- `txHash` and `blockNumber` are populated when blockchain anchoring succeeds

### 6.4 FileRecord

- Associates uploaded images with watches and/or events
- Current storage URL pattern: `/uploads/watches/<filename>`
- Storage is durable only in local development today. The hosted Vercel runtime writes uploads to `/tmp`, which is ephemeral.

## 7. End-to-End Data Flows

### 7.1 Legacy Email/JWT Flow

1. Client submits credentials to `/auth/register` or `/auth/login`.
2. Backend validates request and user state.
3. Backend signs a WatchVault JWT and returns `{ token, user }`.
4. Client stores token/user in persisted auth state.
5. Subsequent requests use `Authorization: Bearer <token>`.

### 7.2 Web Login Flow (Current Hosted Path: Clerk)

1. Web client signs in through Clerk.
2. Clerk issues a session token for the frontend.
3. The frontend sends that bearer token to the backend API.
4. `auth.middleware.ts` verifies the Clerk token.
5. The backend resolves the Clerk user to a local `User` row by primary email.
6. Authorized watch requests execute under the resolved local user identity.

### 7.3 Native Login Flow

1. Native client uses its configured auth flow and receives a usable bearer token or provider payload.
2. Backend validates the request and returns or accepts a WatchVault token.
3. Client stores session in native persisted state.
4. All subsequent requests call the same API resources as the web app.

### 7.4 Create Watch Flow

1. Authenticated client posts multipart form data to `/watches`.
2. Backend validates ownership and required fields.
3. Backend hashes the serial number and enforces uniqueness.
4. Backend creates the `Watch` row.
5. If an image is provided, backend stores the file and inserts a `FileRecord`.
6. Backend generates the public passport URL/QR metadata.
7. Backend inserts the initial `MINT` event.
8. Backend returns the created watch.

### 7.5 Add Event and Blockchain Anchoring Flow

1. Authenticated client posts `{ eventType, payload }` to `/watches/:id/events`.
2. Backend verifies watch ownership.
3. Backend persists the event and payload hash.
4. If `BLOCKCHAIN_ENABLED=false`, backend returns immediately.
5. If blockchain anchoring is enabled:
   - Backend calls `recordEvent(...)`
   - Waits for the receipt
   - Updates the event with `txHash` and `blockNumber`
6. If chain submission fails, the off-chain event still exists in the database.

### 7.6 Public Passport View Flow

1. Public client requests `/passports/:publicId`.
2. Backend fetches the watch and event timeline by `publicId`.
3. Serializer removes owner-sensitive fields.
4. Client renders the public provenance timeline.

## 8. Security and Privacy Architecture

- Authentication:
  - Clerk-backed bearer tokens for the hosted web path
  - Legacy JWT bearer tokens for compatibility paths
  - Route-level auth middleware
- Data minimization:
  - Serial numbers are hashed before persistence
  - Public endpoints exclude owner data and internal payload details
- Upload controls:
  - MIME and extension checks
  - File size limit
- Current gaps and tradeoffs:
  - CORS is still permissive
  - No explicit token revocation strategy
  - Hosted upload storage is not durable yet
  - Preview and production still share the same Clerk instance, so auth configuration remains coupled even though database state is now isolated by Neon branch

## 9. Native App Design (Current Implementation)

### 9.1 Visual Design Language

- Clean, card-based UI with a neutral grayscale palette
- Rounded controls and containers
- Shared theme tokens in `native/src/theme/tokens.ts`
- WatchVault branding applied to icon, splash, and auth screens

### 9.2 Information Architecture and Navigation

- Unauthenticated experience:
  - `Home`
  - `Login`
  - `Register`
  - `PublicPassport`
- Authenticated experience:
  - `Dashboard`
  - `NewWatch`
  - `WatchDetail`
  - `AddEvent`
  - `PublicPassport`

### 9.3 Screen-Level Design Patterns

- Landing screen with product message and public passport lookup
- Shared auth card layout with explicit helper/error states
- Consistent button hierarchy and inline validation feedback

### 9.4 Native Auth UX and Platform Constraints

- Email/password uses backend auth endpoints
- Google sign-in exists in native flow
- Expo Go is intentionally unsupported for Google OAuth in local dev
- Facebook backend support exists, but the native client does not currently expose a first-class Facebook login flow

### 9.5 Design and Architecture Follow-Ups

- Optional custom typography and motion layer
- Offline caching and submission queue
- Push notification surfaces for watch events
- Native iOS-specific refinements if a dedicated Swift client is pursued

## 10. Deployment Architecture

### 10.1 Current Dev Topology

- Web frontend: local Next.js dev server on `:3000`
- Backend API: local Express on `:3001`
- Database: Neon Postgres
- Files: local filesystem under the configured uploads directory
- Blockchain: optional local Hardhat node

### 10.2 Current Hosted Topology

- Frontend:
  - Separate Vercel project
  - Production on `mywatchvault.app`
  - Preview on branch-specific Vercel domains
  - Current `newstyle` branch alias: `watch-vault-git-newstyle-trietlus-projects.vercel.app`
- Backend:
  - Separate Vercel project
  - Production on `api.mywatchvault.app`
  - Hosted through `backend/api/index.ts` plus `backend/vercel.json`
  - Current preview deployment example: `watch-vault-ghuqcotee-trietlus-projects.vercel.app`
- Database:
  - Shared Neon project with separate production and preview branches
- Files:
  - Local disk in development
  - `/tmp` in the Vercel runtime today
- Secrets/config:
  - Local env files in development
  - Vercel environment variables in hosted environments
- Observability:
  - Vercel deployment/build/runtime logs
  - `/health` endpoint for basic API health verification

### 10.3 Configuration and Environment Model

- Local development:
  - Backend reads `backend/.env`
  - Frontend reads `frontend/.env.local`
  - Default local origins are `http://localhost:3001` and `http://localhost:3000`
- Hosted frontend:
  - `NEXT_PUBLIC_API_BASE_URL` selects the API host
  - `NEXT_PUBLIC_APP_BASE_URL` selects the public web origin
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` points the web app at Clerk
- Hosted backend:
  - `DATABASE_URL` and `DIRECT_URL` point Prisma/runtime at Neon
  - `APP_BASE_URL` is the expected frontend origin
  - `API_BASE_URL` is the public API origin
  - `CLERK_SECRET_KEY` enables server-side Clerk verification
- Environment separation:
  - Vercel `Production` and `Preview` are deployment contexts, not separate codebases
  - Clerk is intentionally shared between production and preview
  - Neon is now split by branch: production backend uses the production branch and preview backend uses the `preview` branch (`br-quiet-recipe-akt7rocp`)
  - The frontend project is Git-connected and can use branch-specific preview envs such as `Preview (newstyle)`
  - The backend project is not Git-connected, so its preview configuration is project-wide within the backend Vercel project rather than branch-specific

### 10.4 Current Wiring

- Production frontend:
  - `NEXT_PUBLIC_API_BASE_URL=https://api.mywatchvault.app`
  - `NEXT_PUBLIC_APP_BASE_URL=<production frontend origin>`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<shared Clerk publishable key>`
- Production backend:
  - `DATABASE_URL` / `DIRECT_URL` -> production Neon branch
  - `APP_BASE_URL=<production frontend origin>`
  - `API_BASE_URL=https://api.mywatchvault.app`
  - `CLERK_SECRET_KEY=<shared Clerk secret>`
- Preview frontend for `newstyle`:
  - `NEXT_PUBLIC_API_BASE_URL=https://watch-vault-ghuqcotee-trietlus-projects.vercel.app`
  - `NEXT_PUBLIC_APP_BASE_URL=https://watch-vault-git-newstyle-trietlus-projects.vercel.app`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<same shared Clerk publishable key>`
- Preview backend:
  - `DATABASE_URL` / `DIRECT_URL` -> Neon `preview` branch
  - `APP_BASE_URL=https://watch-vault-git-newstyle-trietlus-projects.vercel.app`
  - `API_BASE_URL=https://watch-vault-ghuqcotee-trietlus-projects.vercel.app`
  - `CLERK_SECRET_KEY=<same shared Clerk secret>`

Effectively:

- the same Clerk user can authenticate in both production and preview
- production resolves that user in the production Neon branch
- preview resolves that user in the preview Neon branch
- frontend preview isolation only works because it calls the preview backend instead of `api.mywatchvault.app`

### 10.5 Operational Model: MCP Over Consoles

The preferred operational path is MCP-backed automation through tools like Codex rather than manual vendor-console edits.

- Vercel MCP is used to:
  - Inspect projects, domains, deployments, logs, and environment variables
  - Redeploy frontend and backend services
  - Verify health and domain attachment
- Neon MCP is used to:
  - Inspect projects and branches
  - Run SQL
  - Compare schemas and prepare safer migrations
- Clerk-related operations are managed primarily through:
  - Repository configuration
  - Vercel environment variables
  - App-level integration changes

Operational rule:

- Prefer Codex + MCP for repeatable, auditable infrastructure work.
- Use vendor dashboards only when the same capability is not available through the active automation surface.

## 11. Scaling and Reliability Plan

- API:
  - Add pagination and filtering for watch/event lists
  - Add rate limiting and abuse protection
- Data:
  - Add indexes for ownership, public ID lookup, and event ordering
- Files:
  - Replace Vercel `/tmp` uploads with durable object storage
- Background jobs:
  - Move blockchain anchoring to queue-based async workers
- Environments:
  - Decide whether preview should continue sharing the production Clerk instance
  - Add a stable preview API domain or Git-connect the backend Vercel project so backend preview envs can be branch-specific instead of project-wide

## 12. Architecture Decision Summary

- Keep one backend API for web and native clients.
- Run frontend and backend as separate Vercel projects so domains and deployment cadence can differ cleanly.
- Use Neon Postgres plus Prisma as the shared data layer.
- Use Clerk as the primary hosted web auth path while retaining legacy compatibility routes where needed.
- Prefer MCP-based operations over manual console changes for reproducibility.
- Prioritize durable upload storage and tighter environment isolation before public scale.

## 13. Key File Reference

- Repo-local MCP config: `.codex/config.toml`
- Web layout: `frontend/src/app/layout.tsx`
- Web routes: `frontend/src/app/**/page.tsx`
- Web runtime config: `frontend/src/lib/config.ts`
- Web API client: `frontend/src/lib/api.ts`
- Frontend env example: `frontend/.env.local.example`
- API app wiring: `backend/src/app.ts`
- Vercel API entrypoint: `backend/api/index.ts`
- Backend Vercel config: `backend/vercel.json`
- Auth middleware: `backend/src/middleware/auth.middleware.ts`
- Watch controller: `backend/src/controllers/watch.controller.ts`
- Upload path handling: `backend/src/lib/uploads.ts`
- Prisma schema: `backend/prisma/schema.prisma`
- Backend env example: `backend/.env.example`
- Contract: `contracts/contracts/WatchRegistry.sol`
- Native app config: `native/app.json`
- Native navigator: `native/src/navigation/AppNavigator.tsx`
- Native theme tokens: `native/src/theme/tokens.ts`
