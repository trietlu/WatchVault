# Plan: on-chain event anchoring for watch lifecycle

- **Status:** Draft — pending human-operator review
- **Tracking issue:** [#2](https://github.com/trietlu/WatchVault/issues/2)
- **Goal:** Reliably anchor watch-lifecycle events on-chain, with fully isolated staging (Base Sepolia, `84532`) and production (Base Mainnet, `8453`) chains, and expose independently-verifiable proof.

> This is a planning document. Each task below is written to become its own `agent-ready` GitHub issue after this plan is approved.

---

## 1. Current state (what already exists)

The skeleton is largely built. This plan **hardens** it; it does not start from scratch.

| Area | Exists today | File |
| --- | --- | --- |
| Contract | `WatchRegistry` with `recordEvent(...)` **and** the richer `anchorProof(watchCommitment, eventId, eventType, payloadHash, documentHash, uriHash, schemaVersion)`; `authorizedWriters` access control + `setAuthorizedWriter`; events `EventRecorded`, `ProofAnchored`, `WriterAuthorizationChanged` | `contracts/contracts/WatchRegistry.sol` |
| Deploy | Deploys to Hardhat's default network only | `contracts/scripts/deploy.js`, `contracts/hardhat.config.js` |
| Chain wiring | ABI + `getContract()` (signer from `CHAIN_PRIVATE_KEY`) + `assertConfiguredChain()` (checks the RPC's real chainId == `env.chainId`) | `backend/src/config/contract.ts` |
| Env resolution | `preview` → Base Sepolia `84532`, `production` → Base Mainnet `8453`; validates chainId per env when `BLOCKCHAIN_ENABLED` | `backend/src/config/env.ts` |
| Anchoring service | `EVENT_TYPE_ID` map (12 types), `initialAnchorStatus`, `anchorEventProof` (SUBMITTED → submit `anchorProof` → wait → ANCHORED with `txHash/blockNumber/logIndex/anchoredAt`, or FAILED_RETRYABLE on error) | `backend/src/services/onchain.service.ts` |
| Call sites | Anchoring runs **inline** in the HTTP handlers for `MINT` (createWatch), `addEvent`, and `CONTRACT_UPLOADED` | `backend/src/controllers/watch.controller.ts` |
| Data model | `WatchEvent` carries the full anchor state machine (`anchorStatus`, `anchorAttempts`, `anchorError`, `chainId`, `contractAddress`, `txHash`, `blockNumber`, `logIndex`, `anchoredAt`, `payloadHash`, `documentHash`, `uriHash`, `schemaVersion`, `eventUid`) | `backend/prisma/schema.prisma` |

### Key gaps (what the tasks target)

1. **No repeatable per-chain deploy** — `hardhat.config.js` defines **no networks**; the contract address is set by hand.
2. **No contract tests** — `contracts` test script is a stub.
3. **Anchoring blocks the request** — `await tx.wait()` runs inside the HTTP handler; on serverless this risks function timeout leaving events stuck in `SUBMITTED`.
4. **No retries** — `FAILED_RETRYABLE` is written but nothing ever re-processes it; there is no attempt cap or `FAILED_FINAL` escalation.
5. **Nonce races** — a single signer key with concurrent requests can collide on nonce.
6. **No reconciliation** — a crash between submit and receipt leaves an event `SUBMITTED` (the tx may already be on-chain).
7. **Writer authorization is manual/undocumented** — the backend signer must be added via `setAuthorizedWriter`.
8. **No public verification surface** — the passport/API don't expose tx/explorer proof.
9. **No observability** — no alerting on failures or on signer wallet balance.

---

## 2. Decisions to confirm during review

These shape several tasks; please rule on them:

- **D1 — `recordEvent` vs `anchorProof`.** The backend only uses `anchorProof`. Deprecate/remove `recordEvent`, or keep it? (Affects T1.)
- **D2 — Privacy of `watchCommitment`.** Today `watchCommitment == serialNumberHash`. Anyone who knows a watch's serial can compute the hash and correlate its on-chain events. Acceptable (verifiability), or should the on-chain commitment be salted/separated from the serial hash? (Affects T8/T9.)
- **D3 — Async mechanism.** Vercel Cron polling `PENDING`/`FAILED_RETRYABLE`, or an external queue (e.g. QStash/SQS)? Cron is simplest given the current Vercel-only footprint. (Affects T5/T6.)
- **D4 — Anchoring policy per event type.** `initialAnchorStatus` currently marks `NOTE`, `AUTH_REQUEST`, `TRANSFER_INITIATED` as `NOT_REQUIRED`. Confirm which of the 12 `EVENT_TYPE_ID` types must anchor. (Affects T8.)
- **D5 — Key model.** One key as both deployer and writer, or a separate low-privilege writer key authorized by the deployer/owner? (Affects T2/T3.)

---

## 3. Task breakdown

Priority: **P0** = required for a correct/safe MVP, **P1** = required before production, **P2** = hardening/ops.
Dependency notation: `after Tx`.

### T1 — Finalize `WatchRegistry` + Hardhat tests · P0 · after: none
**Description.** Review `WatchRegistry.sol`; confirm the on-chain `eventType` numbering matches `EVENT_TYPE_ID` in `onchain.service.ts`; add NatSpec; resolve D1. Enable the contract test suite (`contracts/test/`, wire a real `test` script).
**Affected.** `contracts/contracts/WatchRegistry.sol`, `contracts/test/`, `contracts/package.json`.
**Acceptance criteria.**
- [ ] Hardhat tests cover: successful `anchorProof`, `Unauthorized` revert for a non-writer, and `setAuthorizedWriter` toggling access.
- [ ] `npx hardhat test` passes; `contracts` `test` script runs it (no longer a stub).
- [ ] The `eventType` enum is documented and matches `EVENT_TYPE_ID` exactly.
- [ ] D1 resolved: `recordEvent` either removed or explicitly retained with a documented reason.

### T2 — Hardhat network config + repeatable deploy/verify · P0 · after: T1
**Description.** Add `baseSepolia` (84532) and `baseMainnet` (8453) networks to `hardhat.config.js`, sourcing RPC URL + deployer key from env (no secrets committed). Parameterize `deploy.js` to emit and persist the deployed address per network. Add Basescan verification. Write a deploy runbook.
**Affected.** `contracts/hardhat.config.js`, `contracts/scripts/deploy.js`, `docs/`.
**Acceptance criteria.**
- [ ] `npx hardhat run scripts/deploy.js --network baseSepolia` deploys and prints the address; same for `baseMainnet`.
- [ ] Deployed addresses are recorded in a tracked location (e.g. `docs/plans/onchain-anchoring.md` or a `deployments/` file).
- [ ] Contract verification on Basescan is documented and reproducible.
- [ ] No private keys or RPC secrets are committed.

### T3 — Authorize the backend signer as a writer · P0 · after: T2
**Description.** Provide a script + runbook to call `setAuthorizedWriter(backendSigner, true)` on each deployed contract. Resolve D5 (deployer==writer vs separate writer key).
**Affected.** `contracts/scripts/`, `docs/`.
**Acceptance criteria.**
- [ ] A script authorizes the backend signer on a target network; documented.
- [ ] On staging, the backend signer successfully anchors; an unauthorized key reverts with `Unauthorized`.
- [ ] D5 decision recorded.

### T4 — Harden per-environment config + isolation guardrails · P0 · after: none
**Description.** Extend `env.ts`/`contract.ts` so a misconfigured environment fails fast: refuse to boot when `BLOCKCHAIN_ENABLED` but RPC/key/contract missing; assert `CHAIN_ENV`/`VERCEL_ENV` consistency; guarantee a staging deploy can never carry a mainnet chainId/contract (and vice versa). Run `assertConfiguredChain()` before the first anchor. Add unit tests for the matrix.
**Affected.** `backend/src/config/env.ts`, `backend/src/config/contract.ts`, tests (`*.test.ts`).
**Acceptance criteria.**
- [ ] Staging config carrying `chainId 8453` (or a mainnet contract) refuses to start; production carrying `84532` refuses to start.
- [ ] `assertConfiguredChain()` runs before anchoring; an RPC whose real chainId differs from `env.chainId` is rejected.
- [ ] Unit tests cover the staging/prod × chainId matrix and the missing-config cases.
- [ ] The per-environment env-var set is documented (extends `Architecture.md` §10).

### T5 — Move anchoring off the request path + nonce safety · P0 · after: T4
**Description.** Persist events as `PENDING` and return the HTTP response immediately (no `await tx.wait()` in the handler) for `createWatch`, `addEvent`, `uploadContractDocument`. Submission moves to the async processor (T6). Serialize submissions per signer to avoid nonce collisions.
**Affected.** `backend/src/controllers/watch.controller.ts`, `backend/src/services/onchain.service.ts`.
**Acceptance criteria.**
- [ ] Event-creation responses no longer block on chain confirmation (measured latency drops accordingly).
- [ ] Newly created anchor-eligible events are left `PENDING` and are picked up asynchronously.
- [ ] Two concurrent event creations do not produce a nonce collision / dropped tx.
- [ ] Behavior with `BLOCKCHAIN_ENABLED=false` is unchanged (events `NOT_REQUIRED`).

### T6 — Anchoring worker: retry with backoff + FINAL escalation · P0 · after: T5, D3
**Description.** Implement the processor that claims `PENDING`/`FAILED_RETRYABLE` events and (re)submits via `anchorProof`, with: exponential backoff, an attempt cap → `FAILED_FINAL`, retryable-vs-final classification (network/nonce/underpriced = retryable; revert/unauthorized = final), and idempotency (never double-submit one event). Trigger per D3 (default: Vercel Cron).
**Affected.** `backend/src/services/onchain.service.ts`, a new worker/cron route (`backend/api/...`), `backend/vercel.json`.
**Acceptance criteria.**
- [ ] A simulated transient failure is retried and eventually reaches `ANCHORED`.
- [ ] Exceeding the attempt cap sets `FAILED_FINAL` with `anchorError` populated.
- [ ] No event produces two on-chain `ProofAnchored` records.
- [ ] The trigger (cron schedule or queue) is configured and documented.

### T7 — Reconcile stuck `SUBMITTED` events · P1 · after: T6
**Description.** Recover events left `SUBMITTED` (process died between submit and receipt). Reconcile by stored `txHash` if present, else by scanning `ProofAnchored` logs keyed by the `eventId` hash (`sha256(eventUid)`); converge to `ANCHORED` or re-queue.
**Affected.** `backend/src/services/onchain.service.ts`, worker (T6).
**Acceptance criteria.**
- [ ] An event left `SUBMITTED` whose tx actually landed is reconciled to `ANCHORED` **without** re-submitting.
- [ ] An event left `SUBMITTED` with no landed tx is re-queued to `PENDING`/`FAILED_RETRYABLE`.
- [ ] Covered by a test or a documented simulation.

### T8 — Event coverage: registration, service/repair, transfer · P1 · after: T6, D2, D4
**Description.** Verify end-to-end anchoring for the required lifecycle events — registration (`MINT`), service/repair (`SERVICE`), sale/ownership transfer (`TRANSFER`) — including stable payload canonicalization so `payloadHash` recomputes to the on-chain value. Confirm the per-type anchoring policy (D4) and the commitment/privacy decision (D2).
**Affected.** `backend/src/controllers/watch.controller.ts`, `backend/src/services/onchain.service.ts`, serializers.
**Acceptance criteria.**
- [ ] Creating each of `MINT`, `SERVICE`, `TRANSFER` yields an `ANCHORED` event on staging with a verifiable tx.
- [ ] Recomputing `payloadHash` from stored `payloadJson` matches the on-chain value for each.
- [ ] The anchoring policy per event type is documented and matches D4.

### T9 — Public verification surface · P1 · after: T8
**Description.** Expose proof on the public passport and API: `txHash`, `blockNumber`, `chainId`, contract address, explorer link, plus the fields needed for independent verification (`watchCommitment`, `eventId` hash, `payloadHash`, `schemaVersion`). Apply the D2 privacy decision.
**Affected.** `backend/src/serializers/public-passport.ts`, `frontend/src/app/p/[publicId]/page.tsx`, native passport screen.
**Acceptance criteria.**
- [ ] The public passport shows anchored status + an explorer link per anchored event.
- [ ] The public API returns the proof fields (owner-sensitive data still excluded).
- [ ] A documented procedure lets a third party independently verify an event against the chain.

### T10 — Observability, alerting, wallet funding · P2 · after: T6
**Description.** Structured logs across the anchor lifecycle; alert (or queryable check + documented runbook) on `FAILED_FINAL` and on `PENDING`/`SUBMITTED` backlog age; monitor the signer wallet balance per chain and warn on low gas.
**Affected.** backend logging, `docs/`, optional alerting integration.
**Acceptance criteria.**
- [ ] `FAILED_FINAL` and stale-backlog conditions produce an alert or a documented queryable check.
- [ ] Signer wallet low-balance is surfaced per chain.
- [ ] A re-anchoring / incident runbook exists.

### T11 — Rollout: staging validation → production enable · P1 · after: T7, T8, T9
**Description.** Enable on staging (Base Sepolia) behind `BLOCKCHAIN_ENABLED`, validate all event types + worker + reconciliation for a defined period, estimate mainnet gas cost, then enable production (Base Mainnet). Verify rollback (flag off).
**Affected.** env config (Vercel), `docs/`.
**Acceptance criteria.**
- [ ] Staging runs the full flow green over the agreed validation window.
- [ ] A go/no-go checklist is documented and completed.
- [ ] Production is enabled behind the flag and validated with a real anchored event.
- [ ] Rollback verified: flag off → new events stay `NOT_REQUIRED`/`PENDING`, no runtime errors.

---

## 4. Suggested execution order

```
T1 → T2 → T3            (contract + deploy + authorization)
T4 → T5 → T6            (config hardening + async + worker)   [T4 can start in parallel with T1]
        → T7            (reconciliation)
        → T8 → T9       (coverage + verification surface)
T10                     (ops, parallel once T6 lands)
T11                     (rollout, last)
```

## 5. Review log

_To be completed with the human operator (satisfies issue #2's acceptance criteria)._

- **Reviewed on:** _pending_
- **Decisions (D1–D5):** _pending_
- **Scope/priority changes:** _pending_
- **Approved to create implementation issues:** _pending_
