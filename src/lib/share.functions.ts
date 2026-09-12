import { createServerFn } from "@tanstack/react-start";

export type ResolvedShare =
  | { ok: true; filename: string; size_bytes: number; file_type: string | null; provider: string; url: string; expires_at: string }
  | { ok: false; reason: "not_found" | "expired" | "revoked" | "unavailable" };

/** Public resolver for a time-limited share link. Access stops working after expires_at. */
export const resolveShare = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string }) => {
    const token = (input?.token ?? "").trim();
    if (!token || token.length > 128) throw new Error("Invalid link");
    return { token };
  })
  .handler(async ({ data }): Promise<ResolvedShare> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: share } = await supabaseAdmin
      .from("file_shares")
      .select("id,file_id,expires_at,revoked")
      .eq("token", data.token)
      .maybeSingle();

    if (!share) return { ok: false, reason: "not_found" };
    if (share.revoked) return { ok: false, reason: "revoked" };
    if (new Date(share.expires_at).getTime() <= Date.now()) return { ok: false, reason: "expired" };

    const { data: file } = await supabaseAdmin
      .from("files")
      .select("filename,size_bytes,file_type,source_provider,storage_path,deleted_at")
      .eq("id", share.file_id)
      .maybeSingle();

    if (!file || file.deleted_at || !file.storage_path) return { ok: false, reason: "unavailable" };

    const remaining = Math.max(60, Math.min(3600, Math.floor((new Date(share.expires_at).getTime() - Date.now()) / 1000)));
    const { data: signed } = await supabaseAdmin.storage
      .from("user-files")
      .createSignedUrl(file.storage_path, remaining);
    if (!signed?.signedUrl) return { ok: false, reason: "unavailable" };

    return {
      ok: true,
      filename: file.filename,
      size_bytes: Number(file.size_bytes ?? 0),
      file_type: file.file_type,
      provider: file.source_provider,
      url: signed.signedUrl,
      expires_at: share.expires_at,
    };
  });
