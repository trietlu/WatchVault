# Implementation Gaps

This document records gaps between the current WatchVault implementation and its stated requirements ([BRD.md](BRD.md) / DRD appendix) plus general security, correctness, and operational concerns found during code review. It doubles as a living remediation tracker.

- **Created:** 2026-07-05
- **Scope reviewed:** `backend/src` (controllers, middleware, services, config, serializers), `backend/prisma/schema.prisma`. Frontend/native not exhaustively reviewed.
- **Nature:** Findings and plans only — nothing here has been implemented.
- **Data assumption:** No existing customers or production data. Schema/hashing changes can drop-and-recreate the database — **no data migrations or backfills required.**

## Legends

- **Severity:** **High** exploitable / data-integrity · **Med** correctness or requirement gap · **Low** cleanup/hardening.
- **Priority:** **P0** do first · **P1** near-term hardening · **P2** planned · **P3** later.
- **Effort:** **S** < half day · **M** half–2 days · **L** multi-day / feature-sized.
- **Status:** `Open` · `In progress` · `Blocked` · `Done` · `Won't fix`.

## Tracker

| ID | Gap | Sev | Prio | Effort | Status | Owner |
|----|-----|-----|------|--------|--------|-------|
| 1.1 | Public passport leaks `serialNumberHash` | High | P0 | S | Open | _unassigned_ |
| 1.2 | Serial hash has no pepper/salt | High | P0 | S | Open | _unassigned_ |
| 1.3 | Social login tokens not audience-verified | High | P1 | M | Open | _unassigned_ |
| 1.4 | No rate limiting | High | P1 | S | Open | _unassigned_ |
| 1.5 | CORS fully open | Med | P1 | S | Open | _unassigned_ |
| 1.6 | No security headers / body cap | Med | P1 | S | Open | _unassigned_ |
| 1.7 | Weak legacy auth hygiene | Med | P2 | M | Open | _unassigned_ |
| 1.8 | No token revocation strategy | Low | P3 | M | Open | _unassigned_ |
| 2.1 | `addEvent` accepts arbitrary type/payload | Med | P1 | M | Open | _unassigned_ |
| 2.2 | Anchoring synchronous, never retried | Med | P2 | L | Open | _unassigned_ |
| 2.3 | Serial-uniqueness race → 500 | Med | P2 | S | Open | _unassigned_ |
| 2.4 | No payload/body size limits | Med | P1 | S | Open | _unassigned_ |
| 2.5 | Fragile Clerk→User resolution | Med | P1 | M | Open | _unassigned_ |
| 2.6 | Event immutability not enforced | Med | P2 | M | Open | _unassigned_ |
| 3.1 | Ownership transfer workflow absent | High | P2 | L | Open | _unassigned_ |
| 3.2 | Roles / RBAC / issuer registry absent | High | P2 | L | Open | _unassigned_ |
| 3.3 | Notifications / admin / fraud signals absent | Med | P3 | L | Open | _unassigned_ |
| 4.1 | No pagination or list indexes | Med | P2 | M | Open | _unassigned_ |
| 4.2 | No structured logging / metrics / tracing | Med | P2 | M | Open | _unassigned_ |
| 4.3 | Chain signer is a hot key in env | Med | P2 | M | Open | _unassigned_ |
| 4.4 | Legacy unauthenticated disk file path lingers | Low | P3 | S | Open | _unassigned_ |
| 4.5 | No automated tests for critical logic | Med | P2 | M | Open | _unassigned_ |

---

## 1. Security

### 1.1 Public passport leaks `serialNumberHash` — High · P0 · S · Open
[public.controller.ts](backend/src/controllers/public.controller.ts) fetches the full `Watch` row and [public-passport.ts](backend/src/serializers/public-passport.ts) only strips `ownerId` and each event's `payloadJson`; everything else — including `serialNumberHash` and internal numeric `id` — is spread into the public response via `...publicData`. BRD §9 requires serials to be non-recoverable; publishing the hash on an unauthenticated endpoint undermines that and compounds 1.2.

- **Fix:** replace spread-and-omit with an explicit field allowlist (`brand`, `model`, `publicId`, `createdAt`, sanitized events with proof metadata). Never include `serialNumberHash` or DB `id`.
- **Acceptance:** `GET /passports/:publicId` response contains no `serialNumberHash`, `ownerId`, or internal `id`; a test asserts the exact public field set.

### 1.2 Serial number hash has no pepper/salt — High · P0 · S · Open
[watch.controller.ts:14](backend/src/controllers/watch.controller.ts#L14) uses bare `sha256Hex(serial)`. BRD §7.2/§9 require a **server-side pepper**. Serial spaces are low-entropy/structured, so plain SHA-256 is enumerable — worse once the hash is public (1.1). No existing data, so this is a clean switch — drop/recreate the DB, no re-hashing needed.

- **Fix:** `HMAC-SHA256(normalizedSerial, SERIAL_PEPPER)` with a secret pepper from env; keep the uniqueness constraint on the new value.
- **Acceptance:** new watches store a peppered hash; pepper absent from all API responses; `SERIAL_PEPPER` documented in env examples.

### 1.3 Social login tokens are not audience-verified — High · P1 · M · Open
[auth.controller.ts:94-176](backend/src/controllers/auth.controller.ts#L94) — `googleLogin`/`facebookLogin` fetch profile info but never verify the token was issued **for this app** (Google `aud`/client-id; Facebook app id via `debug_token`/`appsecret_proof`). A token minted for another app with the same email can be replayed for a WatchVault session (confused deputy).

- **Fix:** verify Google `aud === GOOGLE_CLIENT_ID` (use tokeninfo/ID-token verification, not just userinfo); for Facebook use `debug_token` and confirm `app_id`. Or retire these endpoints in favor of Clerk.
- **Acceptance:** a token with a mismatched audience is rejected with 401; a valid same-app token still logs in; covered by a test with a stubbed provider response.

### 1.4 No rate limiting anywhere — High · P1 · S · Open
`app.ts` mounts no throttling; `POST /auth/login`, `POST /auth/register`, and public `GET /passports/:publicId` are unbounded (BRD §7.8/§10). No login lockout/backoff.

- **Fix:** add `express-rate-limit` — strict bucket on `/auth/*`, a separate scrape limit on `/passports/*`. Key by IP (and email for login).
- **Acceptance:** exceeding the auth limit returns 429; passport route has an independent limit; limits configurable via env.

### 1.5 CORS is fully open — Med · P1 · S · Open
[app.ts:10](backend/src/app.ts#L10) `app.use(cors())` reflects any origin. `APP_BASE_URL` is available but unused for CORS.

- **Fix:** configure `cors({ origin: [APP_BASE_URL, ...previewOrigins] })`; reject others.
- **Acceptance:** requests from a disallowed origin are blocked; the configured frontend origin(s) work in local, preview, and production.

### 1.6 No security headers / body cap — Med · P1 · S · Open
No `helmet`; `express.json()` has no `limit` (see 2.4).

- **Fix:** add `helmet()`; set `express.json({ limit: '1mb' })` (tune per needs).
- **Acceptance:** standard security headers present on responses; oversized JSON bodies rejected with 413.

### 1.7 Weak legacy auth hygiene — Med · P2 · M · Open
[auth.controller.ts](backend/src/controllers/auth.controller.ts) `register`/`login`: no password policy, no email format check, email stored as-is (case-sensitive), while the Clerk path lowercases email ([auth.middleware.ts:31](backend/src/middleware/auth.middleware.ts#L31)) — inconsistent uniqueness that can split one person into two rows (ties into 2.5).

- **Fix:** validate + normalize email to lowercase on all write paths; enforce a minimum password policy; add a case-insensitive uniqueness guarantee.
- **Acceptance:** mixed-case emails resolve to one user across legacy and Clerk paths; weak passwords rejected.

### 1.8 No token revocation strategy — Low · P3 · M · Open
1-day JWTs, no refresh/revocation (acknowledged in Architecture §8).

- **Fix:** introduce refresh + a revocation/deny-list (or lean fully on Clerk session revocation and shrink legacy JWT scope).
- **Acceptance:** a revoked session cannot call protected routes.

---

## 2. Correctness & Data Integrity

### 2.1 `addEvent` accepts arbitrary `eventType` and unvalidated `payload` — Med · P1 · M · Open
[watch.controller.ts:356-421](backend/src/controllers/watch.controller.ts#L356) stores any `eventType` string and any JSON with no schema validation; BRD §7.4 requires structured, server-validated payloads for consistent canonical hashing.

- **Fix:** allowlist `eventType`; validate payload per type (e.g. zod schemas keyed by event type) before hashing/persisting.
- **Acceptance:** unknown event types and malformed payloads return 400; valid events unaffected; schema versions recorded.

### 2.2 Blockchain anchoring is synchronous and never retried — Med · P2 · L · Open
[watch.controller.ts:399](backend/src/controllers/watch.controller.ts#L399) / [onchain.service.ts:87](backend/src/services/onchain.service.ts#L87) `await tx.wait()` blocks the request on a chain receipt (BRD §8 requires async). Failures set `FAILED_RETRYABLE` ([onchain.service.ts:113](backend/src/services/onchain.service.ts#L113)) but **nothing retries them** — it's a dead state. On serverless, `tx.wait()` risks function timeout.

- **Fix:** persist the event and return immediately; move anchoring to a queue/worker; add a scheduled drain of `PENDING`/`FAILED_RETRYABLE` with backoff and attempt caps.
- **Acceptance:** event creation returns without waiting on chain; a failed anchor is retried automatically and eventually reaches `ANCHORED` or `FAILED_FINAL`.

### 2.3 Serial-uniqueness check is race-prone and surfaces a 500 — Med · P2 · S · Open
[watch.controller.ts:50-56](backend/src/controllers/watch.controller.ts#L50) does `findUnique` then `create` separately; concurrent duplicates both pass, the DB unique constraint rejects the second, but the Prisma `P2002` isn't caught → generic **500** instead of `400 "Watch already registered"`.

- **Fix:** rely on the unique constraint; catch `P2002` and map to 400.
- **Acceptance:** concurrent duplicate submits yield exactly one watch and a 400 for the loser (no 500).

### 2.4 No payload/body size limits → DB bloat / abuse — Med · P1 · S · Open
`express.json()` uncapped and `payloadJson` persisted verbatim; with 1.4 this is a resource-exhaustion vector.

- **Fix:** cap JSON body (1.6) and enforce a max serialized payload size in `addEvent`.
- **Acceptance:** oversized payloads rejected with 413/400; normal events unaffected.

### 2.5 Fragile Clerk→User identity resolution — Med · P1 · M · Open
[auth.middleware.ts:11-73](backend/src/middleware/auth.middleware.ts#L11) `resolveClerkEmail` matches all local users sharing *any* Clerk email and picks the one with most watches (tie-break primary email, then id) — can misattribute and can silently create duplicates. No stable `clerkUserId` is stored (source of recent identity churn).

- **Fix:** add `User.clerkUserId @unique`; resolve by it first; use email only for a one-time link. (No existing rows to backfill.)
- **Acceptance:** a Clerk user always maps to the same `User` regardless of email aliases; no duplicate users created.

### 2.6 Event immutability not enforced — Med · P2 · M · Open
BRD §7.4/§8 require append-only immutable events; nothing prevents payload update/delete, and anchor updates share the same row as the payload.

- **Fix:** separate mutable anchor metadata from the immutable payload (or add DB-level guards/triggers); forbid payload updates in the app layer.
- **Acceptance:** attempts to modify a committed payload are rejected; anchor-field updates still work.

---

## 3. Missing BRD/DRD Functionality

### 3.1 Ownership transfer workflow absent — High · P2 · L · Open
BRD §6/§7.6: two-party, single-use-token, idempotent transfer that updates the owner. Enum ids exist (`TRANSFER_INITIATED`/`TRANSFER_ACCEPTED`, [onchain.service.ts:24](backend/src/services/onchain.service.ts#L24)) but there is **no endpoint, no acceptance flow, and `Watch.ownerId` is never reassigned**.

- **Fix:** design a transfer resource (initiate → single-use token → recipient accept, transactional/idempotent), reassign `ownerId`, append transfer events, anchor on completion.
- **Acceptance:** an owner can transfer to a recipient who accepts in-app; ownership updates atomically; double-accept is a no-op; transfer event recorded.

### 3.2 Roles / RBAC / trusted-issuer registry absent — High · P2 · L · Open
BRD §5/§7.7/§7.11: roles (Collector/Dealer/ServiceCenter/Authenticator/Admin), issuer approve/revoke, admin controls. `User` has no role; `WatchEvent` has no issuer attribution (only `FileRecord.uploadedById`). Consequences: public view can't distinguish trusted-issuer events from self-reports (BRD §7.8); auth-verdict workflow (§7.7) can't be trustworthy.

- **Fix:** add `User.role` + issuer registry; add issuer identity to `WatchEvent`; enforce event-type permissions server-side; expose issuer/trust markers in the public serializer.
- **Acceptance:** only approved issuers can post issuer-only event types; public view flags trusted vs self-reported; admin can grant/revoke.

### 3.3 Notifications, admin tooling, fraud signals absent — Med · P3 · L · Open
BRD §7.10/§7.11/§13: no notifications, no admin surface, no duplicate-serial review (duplicates return a flat 400), no velocity/failed-verification signals.

- **Fix:** add in-app notifications for transfer/verdict; an admin surface for issuer/dispute/flag review; convert duplicate-serial hits into a review/flag flow.
- **Acceptance:** critical actions notify the relevant users; admins can review flags; duplicates raise a review record rather than a silent 400.

---

## 4. Scalability, Reliability, Observability

### 4.1 No pagination or list indexes — Med · P2 · M · Open
[watch.controller.ts:153](backend/src/controllers/watch.controller.ts#L153) `getWatches` returns all watches with all events/files; event lists unbounded. No explicit `@@index` on `Watch.ownerId` or `WatchEvent.watchId` in `schema.prisma`.

- **Fix:** add pagination (cursor or limit/offset) to list endpoints; add indexes for ownership, `publicId`, and event ordering.
- **Acceptance:** list endpoints paginate with stable ordering; query plans use the new indexes.

### 4.2 No structured logging / metrics / tracing — Med · P2 · M · Open
Only `console.error` (BRD §10 requires structured logging, error tracking, tracing for transfer/verification/anchoring).

- **Fix:** adopt a structured logger + error tracking; add request/trace ids; instrument the key flows.
- **Acceptance:** logs are structured and correlated; errors reach a tracker; key-flow metrics exist.

### 4.3 Chain signer is a hot key in env — Med · P2 · M · Open
`CHAIN_PRIVATE_KEY` signs mainnet txns from inside the serverless function (key exposure, no KMS/signing service, no nonce management under concurrency).

- **Fix:** move signing to a KMS/managed signer or dedicated service; add nonce management; scope/rotate the key.
- **Acceptance:** production anchoring signs without a raw key in app env; concurrent anchors don't collide on nonce.

### 4.4 Legacy unauthenticated disk file path lingers — Low · P3 · S · Open
Uploads now go to private Vercel Blob (supersedes the ephemeral `/tmp` doc note), but `FileRecord.storageProvider` still defaults to `'local'`, and the `GET /uploads/*` static mount ([app.ts:16](backend/src/app.ts#L16)) plus disk branches in `getWatchImageContent`/`deleteWatchImage` would serve/act on files **without auth** if any `local` record existed. Dead in practice.

- **Fix:** remove the `/uploads` static mount and disk branches; change the `storageProvider` default to `vercel_blob` (or make it required).
- **Acceptance:** no unauthenticated file-serving path exists; image flows still work via the authenticated proxy.

### 4.5 No automated tests for critical logic — Med · P2 · M · Open
Only `lib/url.test.ts`; identity resolution, anchoring, uniqueness, and public redaction are untested (DRD §12 wants contract tests / parity gates).

- **Fix:** add tests for public redaction (1.1), identity resolution (2.5), uniqueness (2.3), event validation (2.1), and anchoring state transitions (2.2).
- **Acceptance:** the above paths have tests running in `npm test`; CI gate added.

---

## Suggested sequencing

1. **1.1 + 1.2** — serial exposure + pepper (privacy-critical; do together, decide migration path).
2. **1.3** — social-token audience verification (account-takeover class).
3. **1.4 / 1.5 / 1.6 / 2.4** — rate limiting, CORS, headers, body caps (broad, low effort).
4. **2.5** — stable `clerkUserId` (stops recurring identity churn).
5. **2.1 / 2.3** — event validation + uniqueness mapping.
6. **3.1 / 3.2** — transfer + roles (feature-sized; scope separately).
7. **2.2 / 4.x** — async anchoring, pagination/indexes, observability, tests.
