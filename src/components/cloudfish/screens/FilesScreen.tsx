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

const TABS: { id: "all" | FileCategory | "whatsapp"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "photos", label: "Photos" },
  { id: "videos", label: "Videos" },
  { id: "documents", label: "Documents" },
  { id: "whatsapp", label: "WhatsApp" },
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
  const [tab, setTab] = useState<"all" | FileCategory | "whatsapp">("all");
  const [sheetFor, setSheetFor] = useState<FileRow | null>(null);
  const [confirmDel, setConfirmDel] = useState<FileRow | null>(null);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: files.length, whatsapp: 0 };
    for (const f of files) {
      const c = categorizeFile(f);
      m[c] = (m[c] ?? 0) + 1;
      if (f.source === "whatsapp") m.whatsapp = (m.whatsapp ?? 0) + 1;
    }
    return m;
  }, [files]);

  const visible = useMemo(
    () =>
      tab === "all"
        ? files
        : tab === "whatsapp"
        ? files.filter((f) => f.source === "whatsapp")
        : files.filter((f) => categorizeFile(f) === tab),
    [files, tab],
  );

  const openInTab = async (f: FileRow) => {
    if (!f.storage_path) return toast.error("No storage path");
    const url = await createSignedUrl(f.storage_path, 3600);
    if (!url) return toast.error("Could not open file");
    window.open(url, "_blank", "noopener,noreferrer");
  };

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

  const del = async (f: FileRow) => {
    setConfirmDel(null); setSheetFor(null);
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
              <button
                key={f.id}
                onClick={() => setSheetFor(f)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-center shrink-0" style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Icon size={18} strokeWidth={1.5} color="#9ca3af" />
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.file_name}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {formatBytes(f.file_size)} · {timeAgo(f.created_at)}
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted shrink-0" />
              </button>
            );
          })}
        </Card>
      )}

      {sheetFor && (
        <FileSheet
          file={sheetFor}
          onClose={() => setSheetFor(null)}
          onOpen={() => openInTab(sheetFor)}
          onDownload={() => download(sheetFor)}
          onShare={() => share(sheetFor)}
          onDelete={() => { setConfirmDel(sheetFor); }}
        />
      )}
      {confirmDel && createPortal(
        <div
          onClick={() => setConfirmDel(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 340, width: "100%", background: "rgba(14,17,24,0.98)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 20, fontFamily: '"Inter", sans-serif' }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Delete this file?</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{confirmDel.file_name}</div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setConfirmDel(null)} className="flex-1" style={{ background: "rgba(255,255,255,0.06)", color: "#fff", padding: 10, borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Cancel</button>
              <button onClick={() => del(confirmDel)} className="flex-1" style={{ background: "#ef4444", color: "#fff", padding: 10, borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function FileSheet({
  file, onClose, onOpen, onDownload, onShare, onDelete,
}: {
  file: FileRow; onClose: () => void;
  onOpen: () => void; onDownload: () => void; onShare: () => void; onDelete: () => void;
}) {
  return createPortal(
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480,
          background: "rgba(14,17,24,0.97)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderRadius: "20px 20px 0 0", padding: 24,
          fontFamily: '"Inter", sans-serif',
          paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)", margin: "0 auto 16px" }} />
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.file_name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{file.file_type ?? "file"} · {formatBytes(file.file_size)}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, borderRadius: 999, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} color="#fff" />
          </button>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <SheetAction icon={ExternalLink} label="Open" onClick={onOpen} />
          <SheetAction icon={Download} label="Download" onClick={onDownload} />
          <SheetAction icon={Share2} label="Share" onClick={onShare} />
          <SheetAction icon={Trash2} label="Delete" danger onClick={onDelete} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

function SheetAction({ icon: Icon, label, danger, onClick }: { icon: any; label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3"
      style={{
        padding: "14px 16px", borderRadius: 12,
        background: danger ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${danger ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)"}`,
        color: danger ? "#f87171" : "#fff",
        fontSize: 14, fontWeight: 500, fontFamily: '"Inter", sans-serif',
      }}
    >
      <Icon size={18} strokeWidth={1.5} /> {label}
    </button>
  );
}

