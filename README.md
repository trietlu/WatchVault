# WatchVault

WatchVault is a digital passport platform for luxury watches. It combines a Next.js web app, an Express API, a Neon Postgres project with separate production and preview branches, Clerk-backed web authentication, and optional blockchain anchoring for provenance events.

## Features

- Blockchain-secured watch provenance on Ethereum
- Clerk-backed web authentication with legacy email/password and OAuth API paths still present in the backend
- Watch collection management with public passport URLs and QR codes
- Event timeline for service, authentication, transfer, and note records
- Optional image upload support
- Web, native, and smart contract code in one repository

## Current Architecture

WatchVault is one codebase with separate runtime surfaces:

- Frontend web app: Next.js
- Backend API: Express + TypeScript
- Database: Neon Postgres via Prisma
- Authentication: shared Clerk application for the hosted web app
- Smart contracts: optional Hardhat/Solidity package

Current hosted domains:

- Frontend production: `https://mywatchvault.app`
- Frontend preview branch alias (`newstyle`): `https://watch-vault-git-newstyle-trietlus-projects.vercel.app`
- Frontend preview deployment example: `https://watch-vault-digz9f3d1-trietlus-projects.vercel.app`
- Backend production: `https://api.mywatchvault.app`
- Backend preview deployment example: `https://watch-vault-ghuqcotee-trietlus-projects.vercel.app`

Important deployment notes:

- The frontend and backend are deployed as separate Vercel projects.
- Vercel `Production` and `Preview` are separate deployment contexts even when they run the same code.
- Preview and production share the same Clerk instance but no longer share the same Neon branch.
- The frontend project is Git-connected and supports branch-specific preview env overrides. The backend project is not Git-connected, so its preview envs are project-wide within the backend Vercel project.
- The backend currently stores uploads on local disk in development and in Vercel `/tmp` at runtime. `/tmp` is ephemeral and is not durable object storage.

## Tech Stack

### Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- Axios
- Clerk
- Zustand

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- Neon Postgres
- Multer
- JWT plus Clerk token verification

### Smart Contracts

- Hardhat
- Solidity
- Ethers.js

## Prerequisites

- Node.js 18+ and npm
- Git
- Neon project and database
- Clerk application
- Vercel account if you want the hosted topology

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/trietlu/WatchVault.git
cd WatchVault
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Set the backend environment variables in `backend/.env`, then run:

```bash
npm run prisma:generate
npm run prisma:push
npm run dev
```

The backend runs on `http://localhost:3001`.

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

The frontend runs on `http://localhost:3000`.

### 4. Smart contracts setup (optional)

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat node
```

In another terminal:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

## Authentication Setup

Clerk is the primary authentication surface for the hosted web app.

Minimum web auth configuration:

- Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `frontend/.env.local`
- Set `CLERK_SECRET_KEY` in `backend/.env`
- Keep frontend and backend pointed at the same Clerk application if you expect the same users and sessions to work across environments

The backend still contains legacy JWT and provider-specific auth endpoints for compatibility, but the current web deployment expects Clerk to be the main login path.

## Running the Application

### Local development

Start the services in separate terminals:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Blockchain (optional)
cd contracts
npx hardhat node
```

Open `http://localhost:3000`.

### Hosted mode

The intended hosted topology is:

- Web UI on `mywatchvault.app`
- API on `api.mywatchvault.app`
- Branch previews on Vercel preview URLs

The frontend discovers the backend through `NEXT_PUBLIC_API_BASE_URL`. If that value points at a dead host, the UI can appear empty because the upstream API requests fail.

### Local production-style builds

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

## Vercel Setup

The hosted deployment is intentionally split into separate frontend and backend Vercel projects:

- The frontend project serves the Next.js app on the public web domain.
- The backend project serves the Express API on `api.mywatchvault.app`.
- Frontend and backend can be redeployed independently.

Repo-local and local-only Vercel/Codex wiring:

- `.codex/config.toml`: repo-local Codex MCP configuration
- `frontend/.vercel/project.json`: local link between `frontend/` and the frontend Vercel project
- `backend/.vercel/project.json`: local link between `backend/` and the backend Vercel project

`*.vercel/project.json` files are local linkage metadata. Commit them only if you intentionally want reproducible repo-local Vercel linkage and your ignore rules allow it.

## Environment Variables

### Backend (`backend/.env`)

```bash
DATABASE_URL="postgresql://USER:PASSWORD@POOLER-HOST/DBNAME?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@DIRECT-HOST/DBNAME?sslmode=require"
HOST=0.0.0.0
PORT=3001
JWT_SECRET=replace-with-a-long-random-secret
API_BASE_URL="http://localhost:3001"
APP_BASE_URL="http://localhost:3000"
CLERK_SECRET_KEY=""
UPLOADS_DIR="uploads"
BLOCKCHAIN_ENABLED="false"
CHAIN_RPC_URL="http://127.0.0.1:8545"
CHAIN_PRIVATE_KEY=""
CHAIN_CONTRACT_ADDRESS=""
```

Notes:

- `DATABASE_URL` is the pooled Neon connection used by the runtime.
- `DIRECT_URL` is the direct Neon connection used by Prisma CLI workflows.
- `APP_BASE_URL` should match the frontend origin.
- `API_BASE_URL` should match the public API origin.
- `CLERK_SECRET_KEY` is required when the backend needs to verify Clerk tokens.

### Frontend (`frontend/.env.local`)

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"
NEXT_PUBLIC_APP_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
NEXT_PUBLIC_FACEBOOK_APP_ID=""
```

Notes:

- `NEXT_PUBLIC_API_BASE_URL` is the single most important frontend runtime setting. It determines which API host the app calls.
- `NEXT_PUBLIC_APP_BASE_URL` is used for public passport URL generation and other app-origin-aware features.
- The Google and Facebook IDs remain available for app compatibility, but Clerk is the primary hosted auth surface.

### Hosted Vercel environments

The hosted frontend and backend each have their own Vercel environment variables.

Expected production alignment:

- Frontend production:
  - `NEXT_PUBLIC_APP_BASE_URL` should match the public web host
  - `NEXT_PUBLIC_API_BASE_URL` should match `https://api.mywatchvault.app`
- Backend production:
  - `APP_BASE_URL` should match the frontend origin
  - `API_BASE_URL` should match `https://api.mywatchvault.app`
  - `DATABASE_URL` and `DIRECT_URL` should point at the production Neon branch

Preview note:

- Frontend preview for branch `newstyle` uses:
  - `NEXT_PUBLIC_APP_BASE_URL=https://watch-vault-git-newstyle-trietlus-projects.vercel.app`
  - `NEXT_PUBLIC_API_BASE_URL=https://watch-vault-ghuqcotee-trietlus-projects.vercel.app`
- Backend preview uses:
  - `APP_BASE_URL=https://watch-vault-git-newstyle-trietlus-projects.vercel.app`
  - `API_BASE_URL=https://watch-vault-ghuqcotee-trietlus-projects.vercel.app`
  - `DATABASE_URL` / `DIRECT_URL` pointed at the Neon preview branch
- Clerk remains shared between preview and production, so the same signed-in Clerk user is resolved against different database branches depending on whether the request goes to production or preview.
- The frontend preview env override is branch-specific because the frontend Vercel project is Git-connected.
- The backend preview env is project-wide `Preview` because the backend Vercel project is not Git-connected.

### Neon branch layout

The current Neon project layout is:

- Production branch: existing default production branch
- Preview branch: `preview` (`br-quiet-recipe-akt7rocp`)

Production backend envs point at the production branch. Preview backend envs point at the preview branch. The preview branch was created from production and then diverges.

## MCP-First Operations

This repo is intended to be operated through MCP-backed automation when possible instead of manually editing vendor consoles.

Preferred workflow:

- Use Codex plus **Vercel MCP** to inspect deployments, domains, logs, and environment variables, and to redeploy or verify services.
- Use Codex plus **Neon MCP** to inspect projects and branches, run SQL, compare schemas, and prepare safe migrations.
- Treat **Clerk** as shared external auth infrastructure and update its app-facing settings through repository changes and Vercel environment variables first. Use the Clerk dashboard only when the same capability is not exposed through the active toolchain.

This keeps infrastructure changes more reproducible, reviewable, and easier to document than ad hoc console edits.

## Project Structure

```text
WatchVault/
├── .codex/               # Repo-local Codex/MCP configuration
├── backend/              # Express API
│   ├── api/              # Vercel API entrypoint
│   ├── prisma/           # Database schema and migrations
│   ├── src/
│   │   ├── config/       # Runtime configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth, upload, etc.
│   │   ├── routes/       # API routes
│   │   └── lib/          # Shared backend helpers
│   ├── uploads/          # Local development uploads
│   └── vercel.json       # Backend Vercel routing config
├── frontend/             # Next.js application
│   ├── .vercel/          # Local Vercel project link
│   ├── public/           # Static assets
│   └── src/
│       ├── app/          # App Router pages
│       ├── components/   # Shared UI components
│       ├── lib/          # API client and config
│       └── stores/       # Client state
├── native/               # React Native app
└── contracts/            # Ethereum smart contracts
```

## API Endpoints

### Authentication

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google`
- `POST /auth/facebook`

### Watches

- `POST /watches`
- `GET /watches`
- `GET /watches/:id`
- `POST /watches/:id/images`
- `DELETE /watches/:id/images/:fileId`
- `POST /watches/:id/events`

### Public

- `GET /passports/:publicId`
- `GET /health`

## Testing

The repo currently relies mostly on manual and integration-style verification.

Suggested checks:

1. Sign in through the hosted or local web app.
2. Confirm the frontend is calling the intended API host.
3. Verify the backend resolves the same user in Neon.
4. Create a watch and confirm it appears in the collection.
5. Open the public passport URL and verify the event timeline.

## Troubleshooting

### Backend will not start

- Confirm `DATABASE_URL` points at a reachable Postgres/Neon database.
- Generate the Prisma client with `npm run prisma:generate`.
- Verify `backend/.env` exists and contains a valid `JWT_SECRET`.

### Frontend will not start

- Confirm `frontend/.env.local` exists.
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set for Clerk-backed login.
- Clear `.next` and retry if the build cache is stale.

### Hosted app shows an empty collection

- Verify `NEXT_PUBLIC_API_BASE_URL` points at the live backend.
- Confirm the backend is healthy at `/health`.
- Confirm the signed-in account maps to a user row that actually owns watches in Neon.

### Image upload fails

- Verify `backend/uploads/watches` exists in local development.
- Confirm the file is under the 8 MB limit and uses an allowed image format.
- On Vercel, remember uploads currently land in `/tmp` and are not durable.

### Auth behaves differently between preview and production

- Check the Vercel environment values for frontend and backend separately.
- Remember that preview and production are separate Vercel environments even if they currently share one Clerk and Neon environment.

## Contributing

1. Create a feature branch.
2. Make the code and doc changes together when you change infrastructure or environment behavior.
3. Verify the local and hosted configuration still match the documentation.
4. Open a pull request.
