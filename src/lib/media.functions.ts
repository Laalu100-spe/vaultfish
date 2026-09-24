import { createHmac } from "crypto";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MEDIA_TOKEN_TTL_SECONDS = 15 * 60;

function signMediaToken(userId: string, fileId: string, expiresAt: number, secret: string) {
  const payload = `${userId}.${fileId}.${expiresAt}`;
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

export const getMediaAccessUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { fileId: string }) => input)
  .handler(async ({ context, data }) => {
    const { data: file, error } = await context.supabase
      .from("files")
      .select("id, source_provider, external_id, source_account_id, deleted_at")
      .eq("id", data.fileId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw error;
    if (!file || file.deleted_at) throw new Error("File not found.");
    if (file.source_provider !== "google_drive" || !file.external_id || !file.source_account_id) {
      throw new Error("This cloud file cannot be previewed inside VaultFish yet.");
    }

    const secret = process.env['APP_USER_CONNECTION_KEY_SECRET'];
    if (!secret) throw new Error("Media preview is not configured.");
    const expiresAt = Math.floor(Date.now() / 1000) + MEDIA_TOKEN_TTL_SECONDS;
    const token = signMediaToken(context.userId, file.id, expiresAt, secret);
    return { url: `/api/public/media/${encodeURIComponent(file.id)}?token=${encodeURIComponent(token)}` };
  });