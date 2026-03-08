WatchVault Business Requirements Document (BRD) — Mobile-First MVP

Version: 1.1
Audience: Product, Engineering, Design, QA
Primary Platforms: iOS + Android (mobile app is the product)
Public Surface: Minimal read-only “passport view” reachable via QR (can be in-app webview or lightweight public endpoint)

1) Executive Summary

WatchVault is a mobile-first digital passport service for luxury watches that enables collectors, dealers, buyers, and service centers to create and maintain a verifiable history of a timepiece. The platform captures watch metadata, photos, documents, authenticity checks, service events, and ownership transfers into an append-only timeline. Integrity is ensured by anchoring event hashes into an immutable ledger (blockchain or equivalent append-only log), while rich event details and media remain off-chain for usability and cost efficiency. The product’s purpose is to reduce counterfeit risk and improve trust in high-value watch transactions by providing fast, credible provenance verification at the point of sale via a scannable QR.

2) Problem Statement

Luxury watch collectors and buyers face three recurring problems: counterfeit risk, missing or fragmented documentation, and unverifiable provenance. Records are scattered across dealers, service centers, private emails, and paper documents that are easy to lose and hard to validate. Secondary market transactions rely on trust and informal due diligence, creating disputes and financial loss. WatchVault addresses this by creating a durable, portable digital identity for each watch and a tamper-evident chain of custody and maintenance history that can be verified quickly from a mobile device.

3) Goals and Non-Goals

WatchVault’s MVP goal is to support the end-to-end lifecycle of a watch passport on mobile: register a watch, attach evidence, record events, perform and record authenticity checks, transfer ownership, and provide a QR-based public verification experience. The MVP is not intended to be a marketplace, an escrow/payment service, or a complete public web product. The MVP should be designed so that additional features (insurance integrations, valuation, marketplace partnerships) can be layered on later without reworking the core event model.

4) Definitions and Core Concepts

A Watch Passport is the canonical record for a watch in WatchVault, consisting of metadata, media, and a timeline of immutable events. A Watch Event is a structured, append-only entry describing something that happened to the watch (registration, service, authenticity check, transfer). A Ledger Proof is a cryptographic commitment to an event (typically a hash) recorded in an immutable ledger so the event’s integrity can be verified later. A Trusted Issuer is an approved entity (dealer, service center, expert authenticator) authorized to post certain event types (e.g., authenticity verdicts) under their identity.

5) Users, Personas, and Roles

WatchVault supports multiple roles, each with distinct permissions. A Collector registers watches, uploads documents, and initiates transfers. A Dealer may assist with verification and transfer processes and can post provenance events if approved. A Service Center/Watchmaker logs service events and may attach service documentation. An Expert Authenticator posts authenticity verdicts and supporting evidence. An Admin manages approvals for trusted issuers, handles disputes, and responds to fraud signals.

The MVP must enforce permissions server-side. Client-side UI should reflect permissions but must not be the security boundary.

6) Primary User Journeys (MVP)

Register a watch and create a passport: A collector opens the app, registers a watch by entering metadata and serial number (serial is not stored in plaintext), uploads photos/documents, and the system creates a passport with a unique WatchVault ID and QR code. The registration produces a first immutable event in the timeline.

Verify provenance during a sale: A buyer scans the QR code on the seller’s phone or printed card. The public passport view loads quickly, showing watch summary info, key events, and proof indicators. The buyer can see which events are issued by trusted entities and which are self-reported.

Record a service event: A service center logs a service event with date, description, and attached invoice. The event is appended to the watch timeline and later anchored to the ledger.

Authenticate a watch: A collector or dealer submits an authentication request event. An approved authenticator posts an authenticity verdict event with notes, confidence, and attachments. This verdict is visible in the timeline and in the public view.

Transfer ownership: The current owner initiates a transfer to a recipient. The recipient accepts in-app. Ownership is updated and a transfer event is permanently recorded. The public view reflects the updated status without exposing private parties.

7) Functional Requirements
7.1 Account and Authentication

The system must allow users to create accounts, authenticate securely, and manage sessions within a mobile-first experience. Authentication must support secure password-based login in the MVP, with optional future support for passkeys/OAuth. Session tokens must be stored using platform-secure storage. Users must be able to reset passwords and verify email/phone. The backend must support role assignment and role changes, with admin-only controls for granting trusted issuer capabilities.

7.2 Watch Passport Creation and Metadata

Users must be able to create a passport for a watch they own. Required metadata includes brand, model, reference, and a serial number input. The serial number must never be stored in plaintext; it must be salted/peppered and stored as a hash, enabling duplicate detection without exposing the raw identifier. The system must generate a stable public identifier (WatchVault ID) used for lookups and QR URLs. The passport must have a status that reflects verification posture (e.g., pending, verified, flagged) and must support updates via new events rather than overwriting historical claims.

7.3 Media and Document Management

Users must be able to upload photos and documents and associate them with a watch passport and optionally with a specific event. Uploads must be mobile-friendly, support common image formats and PDFs, and store media in object storage with signed URLs for access. The system must store file metadata (type, size, checksum, timestamp, owner, visibility rules). Access to private documents must be restricted; public passport view must show only explicitly public-safe media or thumbnails, if any.

7.4 Immutable Event Timeline

Every watch passport must maintain an append-only event timeline. Events must be immutable once committed; modifications are expressed as new events referencing prior ones when necessary. Each event must include an event type, timestamps, issuer identity, payload data, and integrity proof fields. At minimum, the MVP must support the following event types: registration/mint, service, authentication request, authentication verdict, ownership transfer, and note. Event payloads must be structured and validated server-side to ensure consistent, canonical hashing.

7.5 Ownership and Permissions Model

Each watch passport must have a single current owner at any moment, represented as a user account. The owner may grant limited sharing access to others (MVP: public QR view + owner-only private view; optional “shared with” list). Only the owner (or admin) may initiate ownership transfers. Dealers or service centers may append service/authentication events only if approved. The system must maintain audit logs for permission changes and sensitive operations.

7.6 Ownership Transfer Workflow

Ownership transfer must be a two-party confirmation flow. The current owner initiates a transfer by specifying the recipient (existing user account; optional invitation flow later). The system issues a single-use transfer token. The recipient accepts the transfer from within the app. The acceptance must be transactional and idempotent, preventing double-spend scenarios. On completion, the system updates the watch’s owner and appends an ownership transfer event with proof anchoring.

7.7 Authentication / Verification Workflow

The MVP must support both self-reported and trusted verification. A collector or dealer can create an authentication request event. A trusted issuer can create an authenticity verdict event that includes a verdict status, confidence score, methodology notes, and attachments. The UI must clearly differentiate trusted issuer events from owner self-reports. The system must support an issuer registry and the ability to revoke issuer privileges. Administrators must be able to flag suspicious activity and resolve disputes.

7.8 QR-Based Public Passport View

Each watch passport must produce a scannable QR code that routes to a minimal public verification view. The public view must load quickly on mobile networks and display a safe subset of information: watch summary, status badge, key timeline events, and proof indicators. No personally identifiable information (owner name, email, address) may be displayed. For each event, the public view must show whether it has a ledger proof anchored and which issuer posted it. The public view must be resilient to scraping and include rate-limiting protections.

7.9 Search and Lookup

Users must be able to find their watches and view passports via mobile search. Search must support watch brand/model/reference and direct lookup by WatchVault ID. The system may provide limited internal search for dealers (based on permissions). Serial-based lookup must be privacy-preserving; at minimum, the system must detect duplicates (same serial hash) and flag them for review rather than exposing results publicly.

7.10 Notifications (MVP-Lite)

The system must notify users of critical actions such as transfer initiation, transfer acceptance, and verification verdict posted. In the MVP, this can be implemented as in-app notifications and optionally push notifications later. Notifications must not leak sensitive details.

7.11 Admin and Trust Controls

The MVP must include administrative capabilities (API or internal tool) to approve or revoke trusted issuers, review flagged watches, and investigate disputes. Admin actions must be audited. The system must support basic fraud signals such as duplicate serial hash detection, unusual transfer velocity, or repeated failed verification attempts.

8) Ledger and Integrity Requirements

WatchVault must implement tamper-evident integrity for event histories. Event payloads must be canonically serialized to JSON and hashed using a stable algorithm. The system must store the hash with the event record and anchor it to an immutable ledger asynchronously to avoid blocking UX. The ledger entry must minimally include a watch identifier commitment and the event hash commitment. The backend must track anchoring status and the corresponding ledger transaction reference. The product must display “proof pending” vs “proof verified” states clearly. The system must be designed so that the ledger can be swapped (EVM chain vs append-only log) without changing the event model.

9) Data Requirements and Privacy

The platform must treat serial numbers and ownership identity as sensitive. Serial numbers must be hashed with a server-side secret (pepper) so they cannot be reverse engineered if leaked. The public passport view must never display owner identity or private documents. The system must support visibility controls on events and attachments, with defaults that protect privacy. The system must retain an audit trail for sensitive actions, including ownership changes and issuer role changes.

10) Non-Functional Requirements

Mobile-first performance: Passport views should render quickly on mobile networks; event lists must paginate and images should use responsive sizes.
Reliability: Event creation and transfer acceptance must be idempotent and resilient to retries. Ledger anchoring must be retryable with clear failure states.
Security: TLS everywhere, token-based auth, RBAC, signed URLs, rate limiting on public endpoints, and secure storage on device.
Scalability: Backend services must be stateless and horizontally scalable. Storage must support growth in media.
Observability: Structured logging, error tracking, metrics (latency, failure rates), and tracing for key flows (transfer, verification, anchoring).
Compliance readiness: While the MVP may not require formal compliance, the system should be built with good security hygiene, least privilege, and auditability.

11) Acceptance Criteria (MVP)

The MVP is considered complete when a collector can register a watch, upload supporting media, and see a passport with a timeline and QR code; when a second user can scan the QR and view a public safe passport summary; when a trusted issuer can post a verification verdict; when a service center can post service events; and when an ownership transfer can be initiated and accepted with the watch owner updated and a transfer event recorded. The system must support proof states for events (pending/verified) and must preserve event immutability.

12) Success Metrics

Initial success is measured by watch registrations, the percentage of passports with supporting evidence, the number of trusted issuer events posted, completed ownership transfers without disputes, QR scans during transactions, and reduced fraud/dispute reports relative to baseline expectations from secondary market experiences. Product engagement metrics include repeat views of passports and the number of watches per collector.

13) Risks and Mitigations

Fraudulent issuers or compromised accounts are mitigated by issuer registry approval, revocation, and audit logs. Duplicate serials are mitigated by serial hash collision detection and review workflows. Ledger cost/latency is mitigated by asynchronous anchoring and potentially batching. Disputes are mitigated by immutable logs, issuer identity, and admin escalation processes. Privacy leakage is mitigated by strict public view redaction and signed URL access controls.

14) MVP Deliverables

The MVP deliverables include mobile applications (iOS/Android), backend API services, database schemas, object storage integration for media, event hashing and anchoring pipeline, QR generation and public passport view, role-based permissions, and basic admin issuer controls. The deliverables must include developer documentation for event payload schemas and a clear set of API endpoints for mobile implementation.

# Appendix

# WatchVault Detailed Requirements Document (DRD)

## 1. Document Purpose
Define the business problem, target users, use cases, and requirements for WatchVault as a production product delivered on web and mobile (React Native and/or native iOS).

## 2. Executive Summary
Luxury watch ownership depends on trust: provenance, service history, and authenticity are often fragmented across paper records and private channels. WatchVault provides a digital passport for each watch, combining:
- Secure ownership records
- Event timeline (mint, service, transfer, authentication)
- Public verification via shareable passport links/QR
- Optional blockchain anchoring for tamper-evident proofs

Business outcome: improve trust and liquidity in secondary watch markets while giving collectors better control of documentation.

## 3. Problem Statement
Current pain points:
- Provenance records are inconsistent and easy to lose.
- Buyers have limited confidence in service/authenticity claims.
- Owners have no centralized lifecycle history.
- Cross-party verification is slow and manual.

WatchVault solves this by creating a persistent digital record with privacy-preserving serial handling and verifiable event hashing.

## 4. Business Objectives
- Increase buyer and seller trust through verifiable watch history.
- Reduce manual verification time for transfers and authenticity checks.
- Provide owners a simple system of record for watch lifecycle events.
- Establish a platform foundation that can scale across web and mobile.

## 5. Success Metrics (KPIs)
- Account conversion:
  - Visitor to registered user conversion rate
- Activation:
  - % of new users who mint at least one watch within 7 days
- Engagement:
  - Average events recorded per watch per month
- Trust/utilization:
  - % of watches with public passport views
  - % of events anchored on-chain when enabled
- Reliability:
  - API success rate
  - Median/95th percentile API latency

## 6. Personas
- Collector/Owner:
  - Wants a durable, private, easy record of ownership and service history
- Buyer:
  - Wants confidence in provenance and authenticity before purchase
- Service Provider / Authenticator:
  - Needs to record and verify service/authentication events
- Admin/Operator (future):
  - Oversees platform integrity, abuse prevention, and operations

## 7. Core Use Cases

### UC-1: Create account and sign in
- User registers with email/password or signs in via Google/Facebook.
- System returns authenticated session and secure account access.

### UC-2: Mint a watch passport
- Authenticated owner submits brand/model/serial number and optional image.
- System hashes serial number, creates watch passport, and records initial MINT event.

### UC-3: Add lifecycle event
- Owner records service, transfer, authentication, or note event.
- System stores payload and payload hash.
- If blockchain mode is enabled, event is anchored and tx metadata stored.

### UC-4: Manage watch image
- Owner uploads/deletes watch image.
- System enforces type and size limits.

### UC-5: Share and verify public passport
- Owner shares QR/public URL.
- Public viewer sees sanitized timeline with verification metadata.

## 8. Scope

### 8.1 In Scope (MVP -> V1)
- Authentication:
  - Email/password
  - Google and Facebook sign-in
- Watch management:
  - Create/list/view watch records
  - One watch image upload and delete
- Event management:
  - Add and display timeline events
  - Optional blockchain anchoring
- Public passport:
  - Read-only public watch passport by public ID
- Platforms:
  - Existing web app
  - React Native and/or iOS mobile client

### 8.2 Out of Scope (for now)
- Marketplace transactions and escrow
- On-platform payments
- Multi-owner legal title workflow
- Enterprise fleet/retailer tooling
- Advanced analytics dashboards

## 9. Functional Requirements

### 9.1 Identity and Access
- FR-1: System shall support user registration with email/password.
- FR-2: System shall support login with email/password.
- FR-3: System shall support social sign-in (Google, Facebook).
- FR-4: Protected actions shall require valid JWT.

### 9.2 Watch Passport Lifecycle
- FR-5: System shall create a watch passport with `brand`, `model`, and `serialNumber`.
- FR-6: System shall hash and store serial number; raw serial shall not be persisted.
- FR-7: System shall generate a public passport identifier and URL.
- FR-8: System shall create a default MINT event during passport creation.

### 9.3 Timeline Events
- FR-9: System shall allow owners to add events with type and payload.
- FR-10: Event payload shall be stored with derived cryptographic hash.
- FR-11: When blockchain mode is enabled, system shall attempt to anchor event hash and store tx metadata.
- FR-12: If anchoring fails, event shall still be saved as non-anchored/pending.

### 9.4 Media
- FR-13: System shall allow image upload for watches.
- FR-14: System shall validate image file type and size.
- FR-15: System shall allow deleting existing watch image.

### 9.5 Public Verification
- FR-16: System shall expose a public endpoint for passport view by public ID.
- FR-17: Public response shall exclude owner-sensitive/private internal data.

### 9.6 Mobile Expansion
- FR-18: Mobile clients shall use the same backend API contract.
- FR-19: Mobile clients shall support secure token storage.
- FR-20: Mobile clients shall support watch create/view/event flows parity with web.

## 10. Non-Functional Requirements
- NFR-1 Security: enforce authenticated access for private resources.
- NFR-2 Privacy: no plaintext serial persistence; sanitize public payloads.
- NFR-3 Availability: provide health endpoint and production uptime target.
- NFR-4 Performance: responsive UX for core list/detail flows.
- NFR-5 Scalability: architecture shall support migration from local SQLite/filesystem to managed services.
- NFR-6 Maintainability: modular route/controller/store architecture and typed models.

## 11. Assumptions and Dependencies
- Users accept account-based model for ownership records.
- OAuth providers remain available and properly configured.
- Blockchain anchoring is optional and environment-controlled.
- Mobile app relies on stable backend API contract.

Dependencies:
- Backend API service
- Database and storage infrastructure
- OAuth provider credentials
- Optional EVM RPC endpoint and contract deployment

## 12. Risks and Mitigations
- Risk: Data/storage stack (SQLite + local files) not production-ready.
  - Mitigation: migrate to managed Postgres + object storage before public scale.
- Risk: Open CORS and limited production hardening.
  - Mitigation: strict origin allowlist, rate limiting, audit logging.
- Risk: Blockchain network failures or latency.
  - Mitigation: asynchronous retry queue and pending status model.
- Risk: Mobile parity drift from web behavior.
  - Mitigation: shared API contract tests and release checklist parity gates.

## 13. Release Plan (Suggested)
- Phase 1: Production hardening
  - Postgres migration, cloud file storage, security hardening
- Phase 2: Mobile MVP
  - React Native app with auth, watch list/detail, event creation, public passport links
- Phase 3: Trust and growth features
  - Better verification UX, notifications, transfer workflows, admin controls

## 14. Acceptance Criteria (Business)
- A new user can register/login and mint a watch in under 5 minutes.
- A watch owner can add at least one lifecycle event and view it in timeline.
- A public user can open shared passport URL and verify history metadata.
- Mobile app can complete core flows with parity to web.

## 15. Open Questions
- Should Sign in with Apple be required for iOS launch?
- What legal/compliance obligations apply for ownership transfer claims?
- What SLA and support model are expected for public launch?
- Should blockchain anchoring be synchronous (current) or queued async by default?
