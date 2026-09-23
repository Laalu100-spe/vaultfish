import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const CONNECTOR_ID = "google_drive";

export const GOOGLE_DRIVE_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  // Read access to every file in the account. drive.file would only ever return
  // files this app itself created, which is why the first sync found 0 files.
  "https://www.googleapis.com/auth/drive.readonly",
];

/** Each extra Google account of the same user gets its own gateway app-user id + storage slot. */
function slotKeys(userId: string, slot: number) {
  return {
    appUserId: slot <= 1 ? userId : `${userId}-gd${slot}`,
    connectorKey: slot <= 1 ? CONNECTOR_ID : `${CONNECTOR_ID}#${slot}`,
  };
}

/** Start OAuth consent for a new (or reconnecting) Google account. */
export const startDriveConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input?: { accountId?: string }) => input ?? {})
  .handler(async ({ context, data }) => {
    const clientAPIKey = process.env['GOOGLE_DRIVE_APP_USER_CONNECTOR_CLIENT_API_KEY'];
    if (!clientAPIKey) throw new Error("Google Drive connector is not configured yet.");

    const { authorizeAppUserOAuth, GATEWAY_BASE_URL } = await import(
      "@/integrations/lovable/appUserConnector"
    );
    const { getConnectionKeyForUser } = await import("@/server/appUserConnections.server");

    let slot = 1;
    if (data.accountId) {
      const { data: row } = await context.supabase
        .from("connected_accounts")
        .select("connector_slot")
        .eq("id", data.accountId)
        .maybeSingle();
      slot = (row as any)?.connector_slot ?? 1;
    } else {
      const { data: rows } = await context.supabase
        .from("connected_accounts")
        .select("connector_slot")
        .eq("user_id", context.userId)
        .eq("platform", "google_drive");
      const used = new Set((rows ?? []).map((r: any) => r.connector_slot ?? 1));
      while (used.has(slot)) slot += 1;
    }

    const { appUserId, connectorKey } = slotKeys(context.userId, slot);

    const request = getRequest();
    if (!request) throw new Error("OAuth must start from an app request.");
    const url = new URL(request.url);
    const sandboxHost = url.hostname === "localhost" ? request.headers.get("x-forwarded-host") : null;
    const returnUrl = new URL(
      "/oauth/google-drive/return",
      sandboxHost ? `https://${sandboxHost}` : url.origin,
    ).toString();

    const existingKey = await getConnectionKeyForUser(context.userId, connectorKey);

    const { authorizationUrl } = await authorizeAppUserOAuth({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectorId: CONNECTOR_ID,
      appUserId,
      clientAPIKey,
      returnUrl,
      connectionAPIKey: existingKey ?? undefined,
      credentialsConfiguration: { scopes: GOOGLE_DRIVE_SCOPES },
    });

    return { authorizationUrl, slot };
  });

/** Exchange the one-time code, store the key, create/update the account row. */
export const completeDriveConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string; slot: number }) => input)
  .handler(async ({ context, data }) => {
    const { exchangeAppUserOAuthCode, callAsAppUser, GATEWAY_BASE_URL } = await import(
      "@/integrations/lovable/appUserConnector"
    );
    const { saveConnectionKeyForUser } = await import("@/server/appUserConnections.server");

    const slot = data.slot > 0 ? data.slot : 1;
    const { connectorKey } = slotKeys(context.userId, slot);

    const { connectionAPIKey, connectorId } = await exchangeAppUserOAuthCode(
      GATEWAY_BASE_URL,
      data.code,
    );
    if (connectorId !== CONNECTOR_ID) throw new Error("OAuth completion returned the wrong service.");
    await saveConnectionKeyForUser(context.userId, connectorKey, connectionAPIKey);

    const res = await callAsAppUser({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectionAPIKey,
      connectorId: CONNECTOR_ID,
      path: "/drive/v3/about?fields=user(emailAddress,displayName),storageQuota(limit,usage)",
      requiredScopes: GOOGLE_DRIVE_SCOPES,
    });
    if (!res.ok) throw new Error(`Google Drive account lookup failed (${res.status})`);
    const about = (await res.json()) as {
      user?: { emailAddress?: string; displayName?: string };
      storageQuota?: { limit?: string; usage?: string };
    };

    const email = about.user?.emailAddress ?? "Google account";
    const row = {
      user_id: context.userId,
      platform: "google_drive" as const,
      email,
      display_name: about.user?.displayName ?? null,
      storage_used: Number(about.storageQuota?.usage ?? 0),
      storage_total: Number(about.storageQuota?.limit ?? 0),
      is_active: true,
      connector_slot: slot,
      sync_status: "syncing",
      sync_error: null,
    };

    const { data: existing } = await context.supabase
      .from("connected_accounts")
      .select("id")
      .eq("user_id", context.userId)
      .eq("platform", "google_drive")
      .eq("connector_slot" as any, slot)
      .maybeSingle();

    let accountId: string;
    if (existing?.id) {
      accountId = existing.id;
      const { error } = await context.supabase
        .from("connected_accounts")
        .update(row as any)
        .eq("id", accountId);
      if (error) throw error;
    } else {
      const { data: inserted, error } = await context.supabase
        .from("connected_accounts")
        .insert(row as any)
        .select("id")
        .single();
      if (error) throw error;
      accountId = inserted.id;
    }

    return { accountId, email, slot };
  });

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  trashed?: boolean;
};

/** Pull the Drive file list into the unified files table. */
export const syncDriveAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { accountId: string }) => input)
  .handler(async ({ context, data }) => {
    const { callAsAppUser, appUserReconnectRequired, GATEWAY_BASE_URL } = await import(
      "@/integrations/lovable/appUserConnector"
    );
    const { getConnectionKeyForUser } = await import("@/server/appUserConnections.server");

    const { data: account, error: accErr } = await context.supabase
      .from("connected_accounts")
      .select("id, connector_slot, user_id")
      .eq("id", data.accountId)
      .maybeSingle();
    if (accErr) throw accErr;
    if (!account) throw new Error("That account is no longer connected.");

    const { connectorKey } = slotKeys(context.userId, (account as any).connector_slot ?? 1);
    const connectionAPIKey = await getConnectionKeyForUser(context.userId, connectorKey);
    if (!connectionAPIKey) {
      await context.supabase
        .from("connected_accounts")
        .update({ sync_status: "reconnect", sync_error: null } as any)
        .eq("id", account.id);
      return { synced: 0, reconnectRequired: true };
    }

    await context.supabase
      .from("connected_accounts")
      .update({ sync_status: "syncing", sync_error: null } as any)
      .eq("id", account.id);

    try {
      const collected: DriveFile[] = [];
      let pageToken: string | undefined;
      for (let page = 0; page < 10; page++) {
        const params = new URLSearchParams({
          pageSize: "100",
          q: "trashed = false and mimeType != 'application/vnd.google-apps.folder'",
          orderBy: "modifiedTime desc",
          spaces: "drive",
          corpora: "user",
          includeItemsFromAllDrives: "false",
          supportsAllDrives: "false",
          fields: "nextPageToken, files(id,name,mimeType,size,modifiedTime,webViewLink)",
        });
        if (pageToken) params.set("pageToken", pageToken);
        const res = await callAsAppUser({
          gatewayBaseUrl: GATEWAY_BASE_URL,
          connectionAPIKey,
          connectorId: CONNECTOR_ID,
          path: `/drive/v3/files?${params.toString()}`,
          requiredScopes: GOOGLE_DRIVE_SCOPES,
        });
        if (await appUserReconnectRequired(res)) {
          await context.supabase
            .from("connected_accounts")
            .update({ sync_status: "reconnect" } as any)
            .eq("id", account.id);
          return { synced: 0, reconnectRequired: true };
        }
        if (!res.ok) throw new Error(`Google Drive listing failed (${res.status})`);
        const body = (await res.json()) as { files?: DriveFile[]; nextPageToken?: string };
        collected.push(...(body.files ?? []));
        pageToken = body.nextPageToken;
        if (!pageToken) break;
      }

      const { data: existingRows } = await context.supabase
        .from("files")
        .select("id, external_id")
        .eq("user_id", context.userId)
        .eq("source_account_id", account.id);
      const existing = new Map(
        ((existingRows ?? []) as any[])
          .filter((r) => r.external_id)
          .map((r) => [r.external_id as string, r.id as string]),
      );

      const toInsert: any[] = [];
      for (const f of collected) {
        const shared = {
          filename: f.name,
          size_bytes: Number(f.size ?? 0),
          file_type: f.mimeType ?? null,
          last_modified: f.modifiedTime ?? new Date().toISOString(),
          external_url: f.webViewLink ?? `https://drive.google.com/file/d/${f.id}/view`,
          deleted_at: null,
        };
        const id = existing.get(f.id);
        if (id) {
          await context.supabase.from("files").update(shared as any).eq("id", id);
          existing.delete(f.id);
        } else {
          toInsert.push({
            ...shared,
            user_id: context.userId,
            source_account_id: account.id,
            source_provider: "google_drive",
            external_id: f.id,
            cloud_path: f.name,
          });
        }
      }
      for (let i = 0; i < toInsert.length; i += 200) {
        const { error } = await context.supabase.from("files").insert(toInsert.slice(i, i + 200) as any);
        if (error) throw error;
      }
      // Anything left in `existing` is gone from Drive.
      const stale = [...existing.values()];
      if (stale.length) {
        await context.supabase.from("files").delete().in("id", stale);
      }

      await context.supabase
        .from("connected_accounts")
        .update({
          sync_status: "idle",
          sync_error: null,
          last_synced_at: new Date().toISOString(),
        } as any)
        .eq("id", account.id);

      return { synced: collected.length, reconnectRequired: false };
    } catch (e: any) {
      await context.supabase
        .from("connected_accounts")
        .update({ sync_status: "error", sync_error: e?.message ?? "Sync failed" } as any)
        .eq("id", account.id);
      throw e;
    }
  });

/** Revoke the Google grant, remove synced files and the account row. */
export const disconnectDriveAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { accountId: string }) => input)
  .handler(async ({ context, data }) => {
    const { disconnectAppUser, GATEWAY_BASE_URL } = await import(
      "@/integrations/lovable/appUserConnector"
    );
    const { getConnectionKeyForUser, deleteConnectionKeyForUser } = await import(
      "@/server/appUserConnections.server"
    );

    const { data: account } = await context.supabase
      .from("connected_accounts")
      .select("id, connector_slot")
      .eq("id", data.accountId)
      .maybeSingle();
    if (!account) return { ok: true };

    const { connectorKey } = slotKeys(context.userId, (account as any).connector_slot ?? 1);
    const connectionAPIKey = await getConnectionKeyForUser(context.userId, connectorKey);
    if (connectionAPIKey) {
      try {
        await disconnectAppUser({
          gatewayBaseUrl: GATEWAY_BASE_URL,
          connectionAPIKey,
          connectorId: CONNECTOR_ID,
        });
      } catch {
        // Grant may already be revoked on Google's side; continue cleaning up.
      }
      await deleteConnectionKeyForUser(context.userId, connectorKey);
    }

    await context.supabase
      .from("files")
      .delete()
      .eq("user_id", context.userId)
      .eq("source_account_id", account.id);
    await context.supabase.from("connected_accounts").delete().eq("id", account.id);

    return { ok: true };
  });
