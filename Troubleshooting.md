# Troubleshooting

Common local and hosted issues for WatchVault and how to resolve them. See also the `Troubleshooting` section in [README.md](README.md) for setup-time problems (backend/frontend won't start, empty collection, image upload limits).

## Watch images do not load locally (blank thumbnails)

### Symptoms

- The dashboard and watch detail pages show blank/placeholder image boxes instead of the uploaded photos.
- Backend log shows repeated:
  ```
  Get image content error: BlobError: Vercel Blob: Failed to fetch blob: 403 Forbidden
      at async getWatchImageContent (backend/src/controllers/watch.controller.ts)
  ```
- Frontend console shows `Failed to load image AxiosError: Request failed with status code 500` from `AuthenticatedImage.tsx`.

### Cause

Watch images are stored as **private** objects in Vercel Blob (`storageProvider = 'vercel_blob'`). The frontend loads each image through the authenticated proxy `GET /watches/:id/images/:fileId/content`, which calls `getBlob(..., 'private')` in [watch.controller.ts](backend/src/controllers/watch.controller.ts).

Local Blob access is configured in `backend/.env.local` using `BLOB_STORE_ID` plus a **`VERCEL_OIDC_TOKEN`** (OIDC-based auth), not a long-lived read/write token. `VERCEL_OIDC_TOKEN` is short-lived (~12 hours). Once it expires, private-blob reads return **403 Forbidden**, the proxy route returns 500, and images render blank.

Environment loading precedence is defined in [load-env.ts](backend/src/config/load-env.ts): `.env` is loaded first, then `.env.local` with override. So `.env.local` is the file that actually governs local Blob credentials.

### Fix (refresh the OIDC token)

The backend is linked to the `watch-vault-api` Vercel project (`backend/.vercel/project.json`).

1. Pull a fresh development env to a temp file and confirm the token changed and the database host is unchanged (so you do not silently switch databases):
   ```bash
   cd backend
   npx vercel env pull /tmp/wv-pull.env --environment=development --yes
   ```
2. Swap **only** the `VERCEL_OIDC_TOKEN` line into `.env.local` (do not overwrite the whole file — it also holds keys the dev-env pull does not include):
   ```bash
   cd backend
   newline=$(grep '^VERCEL_OIDC_TOKEN=' /tmp/wv-pull.env)
   awk -v repl="$newline" '/^VERCEL_OIDC_TOKEN=/{print repl; next} {print}' .env.local > .env.local.tmp \
     && mv .env.local.tmp .env.local
   rm -f /tmp/wv-pull.env
   ```
3. Restart the backend so it reloads env at process start:
   ```bash
   npm run dev
   ```

Verify the credential works (independent of the browser) with a quick `list()` against the store, or just reload the dashboard and confirm the backend log no longer shows `403 Forbidden`.

> If you back up `.env.local` first, do not name the backup `*.bak` in the repo — the gitignore patterns only cover names ending in `.local`, so a `.env.local.bak` would be committable and would leak live database credentials. Keep backups outside the repo (e.g. `/tmp`).

### Durable fix (avoid the ~12h expiry)

The code prefers a long-lived read/write token over OIDC ([blob-storage.ts](backend/src/lib/blob-storage.ts)). Create a **Read/Write token** in the Vercel Blob store settings and add it to `backend/.env.local`:

```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

With a read/write token present, local Blob reads work indefinitely and you no longer need to re-pull the OIDC token.

### Note

These are **preview-environment** blobs (local dev points `DATABASE_URL`/`DIRECT_URL` at the Neon preview branch). You are viewing watches that were created against the preview stack; the local backend must be able to authenticate to the same Blob store that holds their images.

## Vercel operations from the tooling

This repo is intended to be operated through MCP-backed automation (see the MCP sections in [README.md](README.md) and [Architecture.md](Architecture.md)).

- Both **Claude Code** (`.mcp.json`) and **Codex** (`.codex/config.toml`) declare the same remote servers: `vercel` (`https://mcp.vercel.com`) and `neon` (`https://mcp.neon.tech/mcp`).
- These are remote HTTP servers that authenticate via OAuth on first connect. If the Vercel or Neon tools are not available in a Claude Code session, run `/mcp` to trust the server and complete the one-time OAuth (this cannot be done in a non-interactive session).
- The Vercel CLI (`npx vercel ...`) is always available as a fallback and does not require MCP. For Neon, the CLI (`neonctl`) or a direct `psql`/`DATABASE_URL` connection are equivalent fallbacks.
- Clerk has no management MCP: the official Clerk MCP (`https://mcp.clerk.com/mcp`) only serves read-only SDK documentation snippets. Manage Clerk through its dashboard, repo config, and Vercel env vars.
