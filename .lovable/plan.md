# Provider identity and in-app media viewer

## What will change

- Add a reusable provider badge to every file row, gallery thumbnail, viewer header, and viewer filmstrip thumbnail.
- Use the existing Google Drive, Dropbox, and OneDrive marks. Each badge will show the connected account email on tap, long-press, keyboard focus, or hover.
- When several accounts use the same provider, add a stable account color and initial so files remain distinguishable at a glance.
- Add an account filter to Files alongside the existing type filters. Users can select All accounts, VaultFish uploads, or one exact connected email.
- Replace cloud-media deep links with a shared full-screen VaultFish viewer for supported images and videos. Files and Gallery will open the same viewer.
- Show filename, size, provider, and connected account email in the viewer header, with Download and Share actions.
- Keep swipe navigation, pinch/double-click zoom, pan, keyboard navigation, filmstrip navigation, video controls, buffering feedback, retry, and graceful provider-link fallback for unsupported files.

## Secure media access

- Add an authenticated server-side Google Drive content fetch using the existing per-account connection. Provider credentials remain server-only.
- Request Drive download content by the file's real provider ID and its `source_account_id`; verify the signed-in user owns both the file and account before fetching.
- Generate short-lived preview access for the viewer rather than exposing provider credentials in the browser.
- Preserve local VaultFish uploads through their existing private signed links.
- Keep Dropbox and OneDrive badge/filter support ready from existing records; their media preview will fall back to the provider link until those connectors return direct content.

## Data and UI structure

- Extend the shared file type with existing external fields so screens stop using casts.
- Build shared account lookup utilities and reusable `ProviderBadge` and `MediaViewer` components, then use them in Files and Gallery.
- Lazy-load only the active media and nearby item; do not fetch every cloud file when the screen opens.
- Keep the current dark visual direction and preserve light-theme readability.

## Validation

- Check Files filtering by one exact connected account and verify counts/list contents agree.
- Check provider badges and email popovers with mouse, touch/long-press, and keyboard interaction.
- Open local and Google Drive photos/videos inside VaultFish; verify navigation, zoom, playback, loading, retry, Download, Share, and unsupported-file fallback.
- Test desktop and narrow mobile layouts, including long filenames/emails and multiple accounts of one provider.
- Run focused type checks and inspect browser errors/network failures. Preview only; do not publish.
