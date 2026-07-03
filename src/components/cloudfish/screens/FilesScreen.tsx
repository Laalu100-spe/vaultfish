import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Card, SectionTitle } from "../ui";
import {
  Image as ImageIcon, Video, FileText, Package, Download, ChevronRight,
  Trash2, Share2, UploadCloud, File as FileIcon, ExternalLink, X,
} from "lucide-react";
import {
  useFiles, categorizeFile, formatBytes, timeAgo,
  softDeleteFile, createSignedUrl, type FileCategory, type FileRow,
} from "@/hooks/useFiles";

const TABS: { id: "all" | FileCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "photos", label: "Photos" },
  { id: "videos", label: "Videos" },
  { id: "documents", label: "Documents" },
  { id: "apk", label: "APK" },
  { id: "downloads", label: "Downloads" },
  { id: "other", label: "Other" },
];

const CAT_ICON: Record<FileCategory, any> = {
  photos: ImageIcon,
  videos: Video,
  documents: FileText,
  apk: Package,
  downloads: Download,
  other: FileIcon,
};

export function FilesScreen() {
  const { files, loading } = useFiles();
  const [tab, setTab] = useState<"all" | FileCategory>("all");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: files.length };
    for (const f of files) {
      const c = categorizeFile(f);
      m[c] = (m[c] ?? 0) + 1;
    }
    return m;
  }, [files]);

  const visible = useMemo(
    () => (tab === "all" ? files : files.filter((f) => categorizeFile(f) === tab)),
    [files, tab],
  );

  const download = async (f: FileRow) => {
    if (!f.storage_path) return toast.error("No storage path");
    const url = await createSignedUrl(f.storage_path, 300);
    if (!url) return toast.error("Could not create download link");
    const a = document.createElement("a");
    a.href = url; a.download = f.file_name; document.body.appendChild(a); a.click(); a.remove();
  };

  const share = async (f: FileRow) => {
    if (!f.storage_path) return toast.error("No storage path");
    const url = await createSignedUrl(f.storage_path, 60 * 60 * 24 * 7);
    if (!url) return toast.error("Could not create link");
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  const startRename = (f: FileRow) => { setRenameId(f.id); setRenameVal(f.file_name); setMenuFor(null); };
  const commitRename = async () => {
    if (renameId && renameVal.trim()) {
      await renameFile(renameId, renameVal.trim());
      toast.success("Renamed");
    }
    setRenameId(null);
  };

  const del = async (f: FileRow) => {
    setMenuFor(null);
    await softDeleteFile(f.id, f.storage_path);
    toast.success("Deleted");
  };

  return (
    <div className="space-y-5">
      <SectionTitle>Files</SectionTitle>

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "6px 14px", borderRadius: 999, whiteSpace: "nowrap",
                fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: active ? 600 : 500,
                background: active ? "#4d90fe" : "rgba(255,255,255,0.05)",
                border: active ? "1px solid transparent" : "1px solid rgba(255,255,255,0.08)",
                color: active ? "#fff" : "rgba(255,255,255,0.6)",
              }}
            >
              {t.label} {counts[t.id] ? <span style={{ opacity: 0.7 }}>· {counts[t.id]}</span> : null}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-muted text-sm">Loading files…</div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16">
          <div style={{ width: 72, height: 72, borderRadius: 999, background: "rgba(77,144,254,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UploadCloud size={30} strokeWidth={1.5} color="#4d90fe" />
          </div>
          <div style={{ marginTop: 16, fontFamily: '"Inter", sans-serif', fontSize: 16, fontWeight: 600, color: "#fff" }}>No files yet</div>
          <div style={{ marginTop: 6, fontFamily: '"Inter", sans-serif', fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            Upload your first file to get started
          </div>
        </div>
      ) : (
        <Card className="divide-y divide-border">
          {visible.map((f) => {
            const cat = categorizeFile(f);
            const Icon = CAT_ICON[cat];
            return (
              <div key={f.id} className="flex items-center gap-3 p-3 relative">
                <div className="flex items-center justify-center shrink-0" style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Icon size={18} strokeWidth={1.5} color="#9ca3af" />
                </div>
                <div className="flex-1 min-w-0">
                  {renameId === f.id ? (
                    <input
                      autoFocus
                      value={renameVal}
                      onChange={(e) => setRenameVal(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenameId(null); }}
                      className="w-full bg-transparent outline-none text-sm font-semibold"
                      style={{ borderBottom: "1px solid #4d90fe", color: "#fff" }}
                    />
                  ) : (
                    <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {f.file_name}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {formatBytes(f.file_size)} · {timeAgo(f.created_at)}
                  </div>
                </div>
                <button
                  onClick={() => setMenuFor(menuFor === f.id ? null : f.id)}
                  className="p-2 rounded-lg text-muted hover:text-white"
                  aria-label="File options"
                >
                  <MoreVertical size={16} />
                </button>
                {menuFor === f.id && (
                  <div
                    className="absolute right-2 top-12 z-20"
                    style={{
                      background: "rgba(18,21,28,0.98)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10, padding: 6, minWidth: 160,
                      boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
                    }}
                    onMouseLeave={() => setMenuFor(null)}
                  >
                    {[
                      { l: "Download", i: Download, fn: () => download(f) },
                      { l: "Rename", i: Pencil, fn: () => startRename(f) },
                      { l: "Share", i: Share2, fn: () => share(f) },
                      { l: "Delete", i: Trash2, fn: () => del(f), danger: true },
                    ].map((it) => (
                      <button
                        key={it.l}
                        onClick={it.fn}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left"
                        style={{ fontSize: 13, color: it.danger ? "#f87171" : "rgba(255,255,255,0.85)" }}
                      >
                        <it.i size={14} strokeWidth={1.5} /> {it.l}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
