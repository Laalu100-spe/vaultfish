import { createHmac, timingSafeEqual } from "crypto";
import { createFileRoute } from "@tanstack/react-router";

function verifyToken(token: string, fileId: string, secret: string) {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(".");
    if (parts.length !== 4) return null;
    const [userId, signedFileId, expiryText, signature] = parts;
    if (!userId || !signedFileId || !expiryText || !signature || signedFileId !== fileId) return null;
    const expiresAt = Number(expiryText);
    if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return null;
    const expected = createHmac("sha256", secret)
      .update(`${userId}.${signedFileId}.${expiryText}`)
      .digest("base64url");
    const suppliedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (suppliedBuffer.length !== expectedBuffer.length) return null;
    if (!timingSafeEqual(suppliedBuffer, expectedBuffer)) return null;
    return userId;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/public/media/$fileId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        const secret = process.env['APP_USER_CONNECTION_KEY_SECRET'];
        if (!token || !secret) return new Response("Unauthorized", { status: 401 });
        const userId = verifyToken(token, params.fileId, secret);
        if (!userId) return new Response("Preview link expired", { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: file } = await supabaseAdmin
          .from("files")
          .select("id,user_id,source_provider,source_account_id,external_id,file_type,filename,deleted_at")
          .eq("id", params.fileId)
          .eq("user_id", userId)
          .maybeSingle();
        if (!file || file.deleted_at || file.source_provider !== "google_drive" || !file.source_account_id || !file.external_id) {
          return new Response("File not found", { status: 404 });
        }

        const { data: account } = await supabaseAdmin
          .from("connected_accounts")
          .select("connector_slot")
          .eq("id", file.source_account_id)
          .eq("user_id", userId)
          .maybeSingle();
        if (!account) return new Response("Account not found", { status: 404 });

        const connectorKey = (account.connector_slot ?? 1) <= 1
          ? "google_drive"
          : `google_drive#${account.connector_slot}`;
        const { getConnectionKeyForUser } = await import("@/server/appUserConnections.server");
        const connectionAPIKey = await getConnectionKeyForUser(userId, connectorKey);
        if (!connectionAPIKey) return new Response("Reconnect Google Drive", { status: 401 });

        const { callAsAppUser, GATEWAY_BASE_URL } = await import("@/integrations/lovable/appUserConnector");
        const upstream = await callAsAppUser({
          gatewayBaseUrl: GATEWAY_BASE_URL,
          connectionAPIKey,
          connectorId: "google_drive",
          path: `/drive/v3/files/${encodeURIComponent(file.external_id)}?alt=media`,
          requiredScopes: ["https://www.googleapis.com/auth/drive.readonly"],
          init: { headers: request.headers.get("range") ? { Range: request.headers.get("range") ?? "" } : undefined },
        });
        if (!upstream.ok && upstream.status !== 206) {
          const detail = await upstream.text();
          console.error(`[media] Google Drive content failed [${upstream.status}]: ${detail.slice(0, 500)}`);
          return new Response("Google Drive preview unavailable", { status: upstream.status });
        }

        const headers = new Headers();
        headers.set("Content-Type", upstream.headers.get("content-type") ?? file.file_type ?? "application/octet-stream");
        headers.set("Cache-Control", "private, max-age=300");
        headers.set("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(file.filename)}`);
        for (const name of ["content-length", "content-range", "accept-ranges"]) {
          const value = upstream.headers.get(name);
          if (value) headers.set(name, value);
        }
        return new Response(upstream.body, { status: upstream.status, headers });
      },
    },
  },
});