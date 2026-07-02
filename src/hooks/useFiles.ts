import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type FileRow = {
  id: string;
  user_id: string;
  account_id: string | null;
  file_name: string;
  file_size: number;
  file_type: string | null;
  cloud_path: string | null;
  storage_path: string | null;
  last_modified: string;
  is_duplicate: boolean;
  thumbnail_url: string | null;
  created_at: string;
  deleted_at: string | null;
};

export type FileCategory = "photos" | "videos" | "documents" | "apk" | "downloads" | "other";

export function categorizeFile(f: Pick<FileRow, "file_type" | "file_name">): FileCategory {
  const t = (f.file_type ?? "").toLowerCase();
  const n = (f.file_name ?? "").toLowerCase();
  if (t.startsWith("image") || /\.(png|jpe?g|gif|webp|heic|bmp|svg)$/.test(n)) return "photos";
  if (t.startsWith("video") || /\.(mp4|mov|avi|mkv|webm|m4v)$/.test(n)) return "videos";
  if (
    t.includes("pdf") ||
    /(word|excel|powerpoint|officedocument|msword)/.test(t) ||
    /\.(pdf|docx?|xlsx?|pptx?|txt|rtf|csv|md)$/.test(n)
  )
    return "documents";
  if (t.includes("android.package-archive") || /\.apk$/.test(n)) return "apk";
  if (n.startsWith("download") || /\.(zip|rar|7z|tar|gz|dmg|iso)$/.test(n)) return "downloads";
  return "other";
}

export function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

export function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const s = Math.max(1, Math.floor((Date.now() - d) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

export function useFiles() {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFiles([]);
      setLoading(false);
      return;
    }
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("file_metadata")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (active) {
        setFiles((data as any) ?? []);
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel(`file_metadata:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "file_metadata", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { files, loading };
}

export async function softDeleteFile(id: string, storage_path: string | null) {
  if (storage_path) {
    await supabase.storage.from("user-files").remove([storage_path]).catch(() => {});
  }
  await supabase.from("file_metadata").update({ deleted_at: new Date().toISOString() }).eq("id", id);
}

export async function renameFile(id: string, newName: string) {
  await supabase.from("file_metadata").update({ file_name: newName }).eq("id", id);
}

export async function createSignedUrl(storage_path: string, expiresIn = 3600) {
  const { data } = await supabase.storage.from("user-files").createSignedUrl(storage_path, expiresIn);
  return data?.signedUrl ?? null;
}
