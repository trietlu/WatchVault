# WatchVault Architecture

## 1. Purpose
This document defines the current WatchVault architecture and the target architecture for expanding the product to React Native and iOS clients. It covers:
- System components and responsibilities
- Data model and API boundaries
- End-to-end data flow for core user journeys
- Security, deployment, and scale considerations

## 2. Product Context
WatchVault is a digital passport platform for luxury watches. It lets users:
- Register/login (email/password, Google, Facebook)
- Create a watch record with hashed serial number
- Add lifecycle events (service, transfer, authentication, notes)
- Upload a watch image
- Share a public passport via QR URL
- Optionally anchor event hashes to Ethereum

## 3. High-Level Architecture

```text
Clients
  - Web App (Next.js)
  - Mobile App (Target: React Native and/or Native iOS)
           |
           | HTTPS (REST + JWT)
           v
Backend API (Node.js + Express + TypeScript)
  - Auth routes/controllers
  - Watch routes/controllers
  - Public passport route/controller
  - File upload route/controller
           |
           +--> Prisma ORM --> SQLite (current) / Postgres (target prod)
           |
           +--> Local file storage (current) / Object storage (target prod)
           |
           +--> EVM RPC via ethers.js (optional blockchain anchoring)
```

## 4. Current Codebase Components

### 4.1 Frontend (Web, Next.js App Router)
Location: `frontend/src`

- `app/`
  - Public pages: `/` and `/p/[publicId]`
  - Auth pages: `/login`, `/register`
  - Authenticated pages: `/dashboard`, `/watches/new`, `/watches/[id]`, `/watches/[id]/add-event`
- `components/`
  - Shared UI (Header, cards, OAuth buttons, loading/empty states)
- `stores/`
  - `useAuthStore.ts` (persisted auth/session)
  - `useWatchStore.ts` (watch list/detail cache)
- `lib/`
  - `api.ts` Axios client + auth header interceptor
  - `config.ts` app/API URL helpers

State and session:
- JWT token is stored in `localStorage` and Zustand persisted state.
- Axios request interceptor injects `Authorization: Bearer <token>`.

### 4.2 Backend (Express API)
Location: `backend/src`

- Entry and app wiring:
  - `index.ts` boots server
  - `app.ts` configures middleware and route mounts
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
  - `auth.middleware.ts` (JWT validation)
  - `upload.middleware.ts` (Multer image upload constraints)
- Infra/config:
  - `config/env.ts` central env parsing/validation
  - `config/contract.ts` ethers contract client + ABI

### 4.3 Database and ORM
- Prisma schema: `backend/prisma/schema.prisma`
- Current datasource: SQLite (`provider = "sqlite"`)
- Core models:
  - `User`
  - `Watch`
  - `WatchEvent`
  - `FileRecord`

### 4.4 Smart Contract
Location: `contracts/contracts/WatchRegistry.sol`

- Event-only registry contract
- Function: `recordEvent(bytes32 watchHash, uint8 eventType, bytes32 payloadHash)`
- Emits `EventRecorded` event

### 4.5 Mobile App (React Native, implemented)
Location: `native/src`

- Framework/runtime:
  - Expo SDK 54 + React Native 0.81
  - TypeScript strict mode
- Navigation:
  - Native stack navigator with split unauthenticated/authenticated stacks
  - Deep link mapping for `/login`, `/register`, `/dashboard`, watch detail/event routes, and public passport route
- Auth/session state:
  - Zustand persisted store
  - Token persistence uses Expo SecureStore (`secureStorage`) on device
- API integration:
  - Shared backend contract via Axios client + Bearer token interceptor
  - Uses same API resources as web (`/auth/*`, `/watches/*`, `/passports/:publicId`)
- UI design system:
  - Shared primitives: `Screen`, `Card`, `PrimaryButton`, `SecondaryButton`
  - Central color tokens (`background`, `surface`, `text`, `mutedText`, `border`, `primary`, `danger`)
  - Rounded card-based layout with light theme and muted grayscale palette
- Branding:
  - Native app icon/splash/adaptive icon are mapped in `native/app.json`
  - Auth screens render WatchVault logo (`assets/watchvault-logo-v2.png`)
- Entry experience:
  - `HomeScreen` acts as landing page with brand messaging + CTA buttons (`Create Account`, `Sign In`)
  - Includes public passport lookup input for direct verification
- OAuth status in native:
  - Google sign-in hook is implemented (`useGoogleAuth`)
  - Expo Go is explicitly blocked for Google OAuth in local dev; requires development build (`npm run ios`/`npm run android`)

## 5. API Surface

### 5.1 Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google`
- `POST /auth/facebook`

### 5.2 Watches
- `POST /watches` (multipart: brand/model/serialNumber + optional image)
- `GET /watches`
- `GET /watches/:id`
- `POST /watches/:id/events`
- `POST /watches/:id/images`
- `DELETE /watches/:id/images/:fileId`

### 5.3 Public and Files
- `GET /passports/:publicId`
- `POST /files/upload`
- `GET /uploads/*` (static file serving)

## 6. Data Model and Domain Rules

### 6.1 User
- Unique email
- Can have password auth and/or linked social providers (Google/Facebook)

### 6.2 Watch
- Owned by one user
- Raw serial number is never persisted
- `serialNumberHash` (SHA-256) is stored and unique
- `publicId` used for public passport URL

### 6.3 WatchEvent
- Event types: `MINT`, `SERVICE`, `TRANSFER`, `AUTH`, `NOTE`
- `payloadJson` and derived `payloadHash` are persisted
- `txHash` and `blockNumber` populated when blockchain anchoring succeeds

### 6.4 FileRecord
- Associates uploaded image with watch and/or event
- Current storage URL pattern: `/uploads/watches/<filename>`

## 7. End-to-End Data Flows

### 7.1 Email Registration/Login Flow
1. Client submits credentials to `/auth/register` or `/auth/login`.
2. Backend validates request and user state, hashes password where needed.
3. Backend signs JWT (`userId`, 1-day expiry) and returns `{ token, user }`.
4. Client stores token/user in persisted state (`localStorage` on web, `Expo SecureStore` on native).
5. Subsequent API requests include Bearer token via Axios interceptor.

### 7.2 OAuth Login Flow (Current Native: Google)
1. Mobile client starts OAuth via `expo-auth-session` Google provider.
2. After provider redirect, client extracts access token and calls `POST /auth/google`.
3. Backend verifies token against Google userinfo API and upserts/links user.
4. Backend returns WatchVault JWT.
5. Client stores session in persisted auth store and continues with normal Bearer-authenticated API calls.
6. In Expo Go local development, Google OAuth is blocked by design and the app instructs users to run a dev build instead.

### 7.3 Create Watch Flow
1. Authenticated client posts multipart form to `/watches`.
2. Backend validates owner and required fields.
3. Backend hashes serial number and enforces uniqueness.
4. Backend creates `Watch`.
5. If image provided, backend stores file and inserts `FileRecord`.
6. Backend generates `qrCodeUrl` for public passport.
7. Backend inserts initial `MINT` event with hashed payload.
8. Backend returns created watch payload.

### 7.4 Add Event + Blockchain Anchoring Flow
1. Authenticated client posts `{ eventType, payload }` to `/watches/:id/events`.
2. Backend verifies watch ownership.
3. Backend writes event to DB first with payload hash.
4. If `BLOCKCHAIN_ENABLED=false`: return created event immediately.
5. If enabled:
   - Backend calls contract `recordEvent(...)`
   - Waits for tx receipt
   - Updates event with `txHash` and `blockNumber`
6. On chain failure, backend still returns DB event (pending/off-chain state).

### 7.5 Public Passport View Flow
1. Public client requests `/passports/:publicId`.
2. Backend fetches watch by `publicId` and event timeline.
3. Serializer strips owner-sensitive/internal fields.
4. Client displays provenance timeline and blockchain metadata (if present).

## 8. Security and Privacy Architecture

- Authentication:
  - JWT bearer tokens on protected endpoints
  - Route-level auth middleware
- Data minimization:
  - Serial numbers hashed before persistence
  - Public endpoint excludes owner info and raw event payload JSON
- Upload controls:
  - MIME/extension checks
  - 8 MB file limit
- Current security gaps to close for production:
  - CORS is currently open (`app.use(cors())`)
  - No token revocation strategy
  - Local file storage is not cloud-resilient
  - SQLite is not suitable for horizontal production scale

## 9. Native App Design (Current Implementation)

This section captures the implemented design and interaction model in `native/`.

### 9.1 Visual Design Language
- Style direction:
  - Clean, card-based UI with neutral grayscale palette and high-contrast text
  - Rounded controls and containers (`radius 10-12`) with subtle borders
- Tokenized theming:
  - All core colors are centralized in `src/theme/tokens.ts`
  - Navigation theme inherits token values for background/card/border consistency
- Branding application:
  - WatchVault logo appears on authentication screens
  - App icon, splash image, and Android adaptive icon are branded in Expo config

### 9.2 Information Architecture and Navigation
- Unauthenticated experience:
  - `Home` landing page
  - `Login`
  - `Register`
  - `PublicPassport` (lookup/view)
- Authenticated experience:
  - `Dashboard` (collection list)
  - `NewWatch` (mint flow)
  - `WatchDetail`
  - `AddEvent`
  - `PublicPassport` (shared with unauth flow)
- Navigation behavior:
  - Separate stacks for authenticated and unauthenticated users
  - Hydration gate shows loader until persisted auth state is ready

### 9.3 Screen-Level Design Patterns
- `HomeScreen`:
  - Product value proposition and primary CTAs
  - Quick public passport verification by public ID
- Auth screens:
  - Shared card layout, logo header, concise helper text, error region
  - Inputs explicitly disable autofill/autocorrect where needed to prevent blocked/yellow autofill states
- Form interaction:
  - Primary action button + secondary navigation button hierarchy
  - Inline validation errors with consistent danger color token

### 9.4 Native Auth UX and Platform Constraints
- Email/password:
  - Uses backend `/auth/register` and `/auth/login`
  - Session token persisted via SecureStore-backed Zustand storage
- Google sign-in:
  - Implemented through `expo-auth-session` + backend `/auth/google`
  - Not supported in Expo Go local dev; requires dev build runtime
- Facebook sign-in:
  - Backend endpoint exists, but native client does not currently expose Facebook login UI

### 9.5 Design and Architecture Follow-Ups
- Optional future visual enhancements:
  - Introduce custom typefaces (if font files are provided)
  - Add motion/transition layer for screen entry and card interactions
- Functional enhancements:
  - Offline caching and submission queue
  - Push-notification surfaces for transfer/auth events
  - Native iOS-specific UX refinements if a dedicated Swift client is pursued

## 10. Deployment Architecture

### 10.1 Current Dev Topology
- Web frontend: local Next.js dev server
- Backend API: local Express on `:3001`
- DB: local SQLite file
- Files: local filesystem under uploads dir
- Blockchain: optional local Hardhat node

### 10.2 Recommended Production Topology
- Frontend:
  - Web on Vercel
  - Mobile via App Store distribution
- Backend:
  - Containerized Express API on managed compute (App Runner/Cloud Run/ECS)
- Database:
  - Postgres (managed)
- Files:
  - Object storage + CDN
- Secrets/config:
  - Managed secret store + environment-specific config
- Observability:
  - Structured logs, request tracing, error tracking, health probes

## 11. Scaling and Reliability Plan

- API:
  - Add pagination/filtering for watch/event lists
  - Add rate limiting and abuse protection
- Data:
  - Move SQLite -> Postgres for concurrency and durability
  - Add indexes for `ownerId`, `publicId`, event time ordering
- Files:
  - Migrate local uploads to object storage
- Background jobs:
  - Move blockchain anchoring to queue-based async workers for resilience

## 12. Architecture Decision Summary

- Keep a single backend API for all clients (web, React Native, iOS).
- Reuse existing JWT and endpoint contracts to accelerate mobile delivery and preserve parity.
- Prioritize infrastructure migrations (Postgres + object storage) before public scale.
- React Native app is now implemented as the primary mobile client; native iOS-only implementation remains optional for deeper platform integration.

## 13. Key File Reference
- Web entry/layout: `frontend/src/app/layout.tsx`
- Web routes: `frontend/src/app/**/page.tsx`
- API client: `frontend/src/lib/api.ts`
- Auth state: `frontend/src/stores/useAuthStore.ts`
- Watch state: `frontend/src/stores/useWatchStore.ts`
- API app wiring: `backend/src/app.ts`
- Watch business logic: `backend/src/controllers/watch.controller.ts`
- Auth business logic: `backend/src/controllers/auth.controller.ts`
- Public serializer: `backend/src/serializers/public-passport.ts`
- Prisma schema: `backend/prisma/schema.prisma`
- Contract: `contracts/contracts/WatchRegistry.sol`
- Native app config: `native/app.json`
- Native navigator: `native/src/navigation/AppNavigator.tsx`
- Native landing screen: `native/src/screens/HomeScreen.tsx`
- Native auth screens: `native/src/screens/auth/LoginScreen.tsx`, `native/src/screens/auth/RegisterScreen.tsx`
- Native design tokens: `native/src/theme/tokens.ts`
- Native auth state storage: `native/src/stores/useAuthStore.ts`, `native/src/lib/storage.ts`
