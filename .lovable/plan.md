# Real Google Drive connection for VaultFish

Goal: tapping "Connect Google Drive" opens the real Google consent screen, and after approval the account's Drive files appear in VaultFish's unified library. Preview only — nothing gets published.

## One important change to your spec

You asked to store each account's Google access and refresh tokens in a new `cloud_connections` table, encrypted. Lovable already has a safer built-in path for exactly this: the per-user Google Drive connection. Google tokens are stored encrypted outside the app, refreshed automatically, and never reach the browser or our database. So:

- No token columns anywhere in our database, and no hand-rolled encryption or refresh logic.
- We keep a small row per linked account (email, when it was linked, sync status) in the existing connected accounts table — no secrets in it.
- Everything else you asked for (multiple accounts, file sync, list UI, disconnect, refresh, syncing state) stays the same.

This needs one setup step from you: a Google OAuth app (client ID + secret) with the `drive.file` scope, added once in Lovable's connector settings. I'll open that card during the build and walk you through it.

## What gets built

**Connect flow**
- "Connect Google Drive" on the Clouds screen starts the Google consent flow with the `drive.file` scope only (no sensitive-scope review needed).
- On return, we read the account's email from Drive and save a row for it.
- Clicking connect again links an additional Google account — each is its own row, shown side by side.

**Initial sync**
- Right after connecting, a background sync pulls the file list from Drive (`files.list`, paged) and writes filename, size, mime type, modified time and the Drive file id into the existing unified `files` table, tagged as Google Drive and linked to that account row.
- The card shows a live "Syncing… N files" state with a spinner, then the final count. No blank or frozen UI.
- A "Sync now" action re-runs it later; re-syncs update existing rows instead of duplicating.

**Connected Clouds screen**
- Once at least one account is linked, the screen lists each Google account: email, file count, storage used, last synced, and a Disconnect option.
- Disconnect revokes the Google access, deletes that account's synced file rows from the unified view, and removes the row. Files themselves stay untouched in Google Drive.
- Dropbox and OneDrive buttons stay exactly as they are today.

**Everywhere else**
- Home, Files, Gallery, Smart Clean and Analytics automatically include the Drive files, since they all read the one unified table. Drive-sourced rows are labelled with their provider and open in Drive rather than pretending to be local uploads.
- Current dark theme untouched.

## Technical notes

- Drive API calls run only in server functions, authenticated as the signed-in VaultFish user, via the connector gateway (`/google_drive/drive/v3/files`) — no tokens in client code.
- New columns on `connected_accounts`: `sync_status`, `last_synced_at`, `connector_account_ref`. New column on `files`: `external_id` (Drive file id) with a unique index per account for idempotent re-sync.
- Sync is chunked over pages of 100 with `nextPageToken`, capped per run to stay inside the request timeout; progress is written back to the account row so the UI can poll it.
- Storage used comes from Drive's `about.get` (`storageQuota`), mapped into the existing used/total bars.
- Disconnect calls the gateway's disconnect for that user's Drive link, then deletes `files` rows where `source_account_id` matches.
