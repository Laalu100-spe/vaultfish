import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { SectionTitle, Card } from "../ui";
import { FILES, ACCOUNTS, type FileItem } from "../data";
import { PlatformIcon } from "../PlatformIcons";
import {
  MoreVertical, Eye, Download, FolderInput, Copy, Pencil, Share2, Trash2, X,
  Search, SlidersHorizontal, Check, ChevronDown,
} from "lucide-react";

const FILTERS = ["All Clouds", "saran@gmail", "college", "work", "dropbox"];
const SORTS = ["Newest First", "Oldest First", "Name A-Z", "Name Z-A", "Largest First", "Smallest First"] as const;
type Sort = typeof SORTS[number];

type Action = "view" | "download" | "move" | "copy" | "rename" | "share" | "delete";

const MENU: { id: Action; label: string; Icon: any; danger?: boolean; sep?: boolean }[] = [
  { id: "view", label: "View", Icon: Eye },
  { id: "download", label: "Download", Icon: Download },
  { id: "move", label: "Move to…", Icon: FolderInput },
  { id: "copy", label: "Copy to…", Icon: Copy },
  { id: "rename", label: "Rename", Icon: Pencil },
  { id: "share", label: "Share", Icon: Share2 },
  { id: "delete", label: "Delete", Icon: Trash2, danger: true, sep: true },
];

const TYPE_LABEL_COLORS: Record<FileItem["type"], string> = {
  pdf: "#f87171", doc: "#60a5fa", xls: "#4ade80", mp4: "#a78bfa", png: "#fb923c",
};

const TYPE_NAMES: Record<FileItem["type"], string> = {
  pdf: "PDF Document", doc: "Word Document", xls: "Spreadsheet", mp4: "Video", png: "Image",
};

const ACCOUNT_TO_PLATFORM: Record<string, string> = {
  "saran@gmail": "Google Drive",
  college: "Google Drive",
  work: "Google Drive",
  dropbox: "Dropbox",
};

function platformOf(file: FileItem) {
  return ACCOUNT_TO_PLATFORM[file.account] ?? "Google Drive";
}

function sizeToMB(s: string) {
  const n = parseFloat(s);
  if (s.includes("GB")) return n * 1024;
  if (s.includes("KB")) return n / 1024;
  return n;
}

function timeRank(t: string) {
  // smaller = newer
  if (t.includes("m ago")) return parseInt(t);
  if (t.includes("h ago")) return parseInt(t) * 60;
  if (t.includes("d ago")) return parseInt(t) * 60 * 24;
  return 999999;
}

function FileTypeIcon({ type, width = 36, height = 44 }: { type: FileItem["type"]; width?: number; height?: number }) {
  const fold = Math.round(width * 0.28);
  return (
    <div
      style={{
        position: "relative", width, height, borderRadius: 6,
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden",
      }}
    >
      <svg width={fold} height={fold} viewBox="0 0 10 10" style={{ position: "absolute", top: 0, right: 0 }} aria-hidden>
        <path d="M0 0 L10 0 L10 10 Z" fill="rgba(255,255,255,0.1)" />
      </svg>
      <span style={{
        fontFamily: '"Inter", sans-serif',
        fontSize: width >= 48 ? 11 : 9, fontWeight: 700, letterSpacing: "0.06em",
        color: TYPE_LABEL_COLORS[type],
      }}>{type.toUpperCase()}</span>
    </div>
  );
}

/* ---------------- Portal Dropdown ---------------- */

function PortalMenu({
  anchor, onClose, children, width = 180,
}: { anchor: DOMRect; onClose: () => void; children: ReactNode; width?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const top = anchor.bottom + 4;
  const left = Math.max(8, Math.min(window.innerWidth - width - 8, anchor.right - width));

  return createPortal(
    <div
      ref={ref}
      style={{
        position: "fixed", top, left, zIndex: 200, width,
        background: "rgba(18,21,28,0.97)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 6,
        boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {children}
    </div>,
    document.body
  );
}

function FileMenuItems({ onPick }: { onPick: (a: Action) => void }) {
  return (
    <>
      {MENU.map((m) => (
        <div key={m.id}>
          {m.sep && <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />}
          <button
            onClick={() => onPick(m.id)}
            className="w-full flex items-center gap-2.5 file-menu-item"
            style={{
              padding: "8px 12px", borderRadius: 6,
              fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 500,
              letterSpacing: "-0.01em",
              color: m.danger ? "#f87171" : "rgba(255,255,255,0.85)",
              textAlign: "left",
            }}
          >
            <m.Icon size={14} strokeWidth={1.5} />
            {m.label}
          </button>
        </div>
      ))}
    </>
  );
}

/* ---------------- Filter chip ---------------- */

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 16px", borderRadius: 999,
        fontFamily: '"Inter", sans-serif', fontSize: 12,
        fontWeight: active ? 600 : 500, whiteSpace: "nowrap",
        background: active ? "#4d90fe" : "rgba(255,255,255,0.05)",
        border: active ? "1px solid transparent" : "1px solid rgba(255,255,255,0.08)",
        color: active ? "#fff" : "rgba(255,255,255,0.5)",
        transition: "all 150ms ease",
      }}
    >{children}</button>
  );
}

function CircleIconBtn({ children, onClick, label }: { children: ReactNode; onClick?: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 34, height: 34, borderRadius: 999,
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(255,255,255,0.7)", flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

/* ---------------- Sort dropdown ---------------- */

function SortMenu({ value, onChange }: { value: Sort; onChange: (s: Sort) => void }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  return (
    <>
      <button
        ref={btnRef}
        onClick={() => {
          if (btnRef.current) setRect(btnRef.current.getBoundingClientRect());
          setOpen((o) => !o);
        }}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 10px", borderRadius: 8,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.7)",
          fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 500,
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.4)" }}>Sort by</span>
        <span>{value}</span>
        <ChevronDown size={14} strokeWidth={1.5} />
      </button>
      {open && rect && (
        <PortalMenu anchor={rect} onClose={() => setOpen(false)} width={180}>
          {SORTS.map((s) => (
            <button
              key={s}
              onClick={() => { onChange(s); setOpen(false); }}
              className="w-full flex items-center justify-between file-menu-item"
              style={{
                padding: "8px 12px", borderRadius: 6,
                fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 500,
                color: s === value ? "#4d90fe" : "rgba(255,255,255,0.85)",
                textAlign: "left",
              }}
            >
              <span>{s}</span>
              {s === value && <Check size={14} strokeWidth={1.5} />}
            </button>
          ))}
        </PortalMenu>
      )}
    </>
  );
}

/* ---------------- View Modal ---------------- */

function ViewModal({
  file, onClose, onAction,
}: { file: FileItem; onClose: () => void; onAction: (a: Action) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const platform = platformOf(file);
  const label: React.CSSProperties = {
    fontFamily: '"Inter", sans-serif', fontSize: 10, fontWeight: 600,
    textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)",
  };
  const value: React.CSSProperties = {
    fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 500,
    color: "rgba(255,255,255,0.85)", marginTop: 4,
    fontVariantNumeric: "tabular-nums",
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[150] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", animation: "previewFade 200ms ease-out" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 520,
          background: "rgba(12,15,22,0.97)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: 24,
          fontFamily: '"Inter", sans-serif',
          animation: "previewIn 200ms cubic-bezier(0.4,0,0.2,1)",
          maxHeight: "92vh", overflowY: "auto",
        }}
      >
        {/* Top bar */}
        <div className="flex items-start gap-3">
          <FileTypeIcon type={file.type} width={40} height={48} />
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", wordBreak: "break-word" }}>
              {file.name}
            </div>
            <span
              style={{
                display: "inline-block", marginTop: 6,
                padding: "3px 8px", borderRadius: 999,
                background: file.accountColor, color: "#fff",
                fontSize: 10, fontWeight: 600, letterSpacing: "-0.01em",
              }}
            >{file.account}</span>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ color: "rgba(255,255,255,0.5)", padding: 4 }}>
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Preview area */}
        <div
          style={{
            width: "100%", height: 200, marginTop: 18,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 12,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 10,
          }}
        >
          <Eye size={48} strokeWidth={1} color="rgba(255,255,255,0.1)" />
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
            Preview available in full app
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-4 mt-6">
          <div><div style={label}>Size</div><div style={value}>{file.size}</div></div>
          <div><div style={label}>Modified</div><div style={value}>{file.time}</div></div>
          <div><div style={label}>Type</div><div style={value}>{TYPE_NAMES[file.type]}</div></div>
          <div><div style={label}>Location</div><div style={value}>/{file.account}</div></div>
          <div><div style={label}>Account</div><div style={value}>{file.account}</div></div>
          <div><div style={label}>Storage</div><div style={value}>{platform}</div></div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-6">
          <button
            onClick={() => {
              toast(`Opening in ${platform}`, {
                icon: <PlatformIcon name={platform} size={16} />,
              });
              onClose();
            }}
            style={{
              gridColumn: "span 2", height: 40, borderRadius: 10,
              background: "#4d90fe", color: "#fff",
              fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <PlatformIcon name={platform} size={14} />
            View in Cloud
          </button>
          {[
            { l: "Download", a: "download" as Action, I: Download },
            { l: "Move", a: "move" as Action, I: FolderInput },
            { l: "Share", a: "share" as Action, I: Share2 },
          ].map(({ l, a, I }) => (
            <button
              key={a}
              onClick={() => onAction(a)}
              style={{
                height: 40, borderRadius: 10,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.85)",
                fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <I size={14} strokeWidth={1.5} /> {l}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ---------------- Generic centered modal ---------------- */

function CenterModal({
  open, onClose, children, width = 420,
}: { open: boolean; onClose: () => void; children: ReactNode; width?: number }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[150] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", animation: "previewFade 180ms ease-out" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: width,
          background: "rgba(14,17,24,0.97)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18, padding: 22,
          fontFamily: '"Inter", sans-serif',
          animation: "previewIn 200ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >{children}</div>
    </div>,
    document.body
  );
}

function ModalTitle({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>{children}</div>;
}

function btn(variant: "primary" | "ghost" | "danger"): React.CSSProperties {
  const base: React.CSSProperties = {
    fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 600,
    padding: "9px 16px", borderRadius: 10, transition: "all 150ms ease",
  };
  if (variant === "primary") return { ...base, background: "#4d90fe", color: "#fff", border: "1px solid transparent" };
  if (variant === "danger") return { ...base, background: "#ef4444", color: "#fff", border: "1px solid transparent" };
  return { ...base, background: "transparent", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" };
}

/* ---------------- Files Screen ---------------- */

export function FilesScreen() {
  const [filterAcc, setFilterAcc] = useState("All Clouds");
  const [sort, setSort] = useState<Sort>("Newest First");
  const [menuFor, setMenuFor] = useState<{ idx: number; rect: DOMRect } | null>(null);
  const [view, setView] = useState<FileItem | null>(null);
  const [renameIdx, setRenameIdx] = useState<number | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [deleteFor, setDeleteFor] = useState<FileItem | null>(null);
  const [moveFor, setMoveFor] = useState<{ file: FileItem; mode: "move" | "copy" } | null>(null);
  const [moveDest, setMoveDest] = useState<string | null>(null);
  const [shareFor, setShareFor] = useState<FileItem | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareExp, setShareExp] = useState("7 days");
  const [files, setFiles] = useState(FILES);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    const list = filterAcc === "All Clouds" ? files : files.filter((x) => x.account === filterAcc);
    const arr = [...list];
    switch (sort) {
      case "Newest First": arr.sort((a, b) => timeRank(a.time) - timeRank(b.time)); break;
      case "Oldest First": arr.sort((a, b) => timeRank(b.time) - timeRank(a.time)); break;
      case "Name A-Z": arr.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "Name Z-A": arr.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "Largest First": arr.sort((a, b) => sizeToMB(b.size) - sizeToMB(a.size)); break;
      case "Smallest First": arr.sort((a, b) => sizeToMB(a.size) - sizeToMB(b.size)); break;
    }
    return arr;
  }, [files, filterAcc, sort]);

  const allSelected = visible.length > 0 && visible.every((f) => selected.has(f.name));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allSelected) visible.forEach((f) => next.delete(f.name));
    else visible.forEach((f) => next.add(f.name));
    setSelected(next);
  };
  const toggleOne = (name: string) => {
    const next = new Set(selected);
    next.has(name) ? next.delete(name) : next.add(name);
    setSelected(next);
  };

  const startAction = (a: Action, file: FileItem) => {
    setMenuFor(null);
    if (a === "view") setView(file);
    else if (a === "download") toast.success(`Downloading ${file.name}`);
    else if (a === "rename") {
      const idx = files.indexOf(file);
      setRenameIdx(idx);
      setRenameVal(file.name);
      setView(null);
    } else if (a === "delete") { setDeleteFor(file); setView(null); }
    else if (a === "move" || a === "copy") {
      setMoveFor({ file, mode: a });
      setMoveDest(null);
      setView(null);
    } else if (a === "share") { setShareFor(file); setShareCopied(false); setView(null); }
  };

  const confirmRename = () => {
    if (renameIdx === null) return;
    const v = renameVal.trim();
    if (v) {
      const next = [...files];
      next[renameIdx] = { ...next[renameIdx], name: v };
      setFiles(next);
      toast.success("File renamed");
    }
    setRenameIdx(null);
  };

  const confirmDelete = () => {
    if (!deleteFor) return;
    setFiles(files.filter((f) => f !== deleteFor));
    toast.success(`Deleted ${deleteFor.name}`);
    setDeleteFor(null);
  };

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: '"Inter", sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: "-0.025em", color: "rgba(255,255,255,0.95)" }}>
            All Files
          </h1>
          <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
            Viewing across 5 accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CircleIconBtn label="Search" onClick={() => toast("Search coming soon")}>
            <Search size={16} strokeWidth={1.5} />
          </CircleIconBtn>
          <CircleIconBtn label="Filters" onClick={() => toast("Advanced filters coming soon")}>
            <SlidersHorizontal size={16} strokeWidth={1.5} />
          </CircleIconBtn>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((x) => (
          <FilterChip key={x} active={filterAcc === x} onClick={() => setFilterAcc(x)}>{x}</FilterChip>
        ))}
      </div>

      {/* Select all + Sort */}
      <div className="flex items-center justify-between">
        <button onClick={toggleAll} className="flex items-center gap-2">
          <span
            style={{
              width: 16, height: 16, borderRadius: 4,
              border: `1.5px solid ${allSelected ? "#4d90fe" : "rgba(255,255,255,0.2)"}`,
              background: allSelected ? "#4d90fe" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 150ms ease",
            }}
          >
            {allSelected && <Check size={11} strokeWidth={2.5} color="#fff" />}
          </span>
          <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>
            Select All
          </span>
        </button>
        <SortMenu value={sort} onChange={setSort} />
      </div>

      {/* List */}
      <div key={`${filterAcc}-${sort}`} className="space-y-2" style={{ animation: "listFade 200ms ease-out", transition: "opacity 200ms ease" }}>
        {visible.map((file, i) => {
          const isSel = selected.has(file.name);
          const realIdx = files.indexOf(file);
          return (
            <Card
              key={file.name + i}
              className="p-3 flex items-center gap-3 file-row"
            >
              <button
                onClick={(e) => { e.stopPropagation(); toggleOne(file.name); }}
                style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: `1.5px solid ${isSel ? "#4d90fe" : "rgba(255,255,255,0.18)"}`,
                  background: isSel ? "#4d90fe" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                aria-label="Select file"
              >
                {isSel && <Check size={11} strokeWidth={2.5} color="#fff" />}
              </button>
              <div
                onClick={() => renameIdx !== realIdx && setView(file)}
                className="flex-1 min-w-0 flex items-center gap-3 cursor-pointer"
                style={{
                  background: isSel ? "rgba(77,144,254,0.08)" : "transparent",
                  borderLeft: isSel ? "2px solid #4d90fe" : "2px solid transparent",
                  paddingLeft: 8, marginLeft: -8,
                  borderRadius: 6,
                  transition: "background 150ms ease",
                }}
              >
                <FileTypeIcon type={file.type} />
                <div className="flex-1 min-w-0">
                  {renameIdx === realIdx ? (
                    <input
                      autoFocus
                      value={renameVal}
                      onChange={(e) => setRenameVal(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.currentTarget.select()}
                      onBlur={confirmRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmRename();
                        if (e.key === "Escape") setRenameIdx(null);
                      }}
                      style={{
                        width: "100%", background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(77,144,254,0.5)", borderRadius: 6,
                        padding: "4px 8px", color: "#fff",
                        fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 500,
                      }}
                    />
                  ) : (
                    <div className="text-sm font-medium truncate" style={{ color: "rgba(255,255,255,0.92)" }}>{file.name}</div>
                  )}
                  <div className="text-xs flex items-center gap-2 mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                    <span
                      className="px-1.5 py-0.5 rounded-md text-[10px] font-medium text-white"
                      style={{ background: file.accountColor }}
                    >{file.account}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{file.size}</span>
                    <span>•</span>
                    <span>{file.time}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const r = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                  setMenuFor(menuFor?.idx === realIdx ? null : { idx: realIdx, rect: r });
                }}
                className="p-2 text-muted hover:text-foreground"
                aria-label="File actions"
              >
                <MoreVertical size={18} strokeWidth={1.5} />
              </button>
            </Card>
          );
        })}
        {visible.length === 0 && (
          <div className="text-center text-muted py-12 text-sm">No files for this filter.</div>
        )}
      </div>

      {/* Portal Dropdown */}
      {menuFor && (
        <PortalMenu anchor={menuFor.rect} onClose={() => setMenuFor(null)}>
          <FileMenuItems onPick={(a) => startAction(a, files[menuFor.idx])} />
        </PortalMenu>
      )}

      {/* View Modal */}
      {view && <ViewModal file={view} onClose={() => setView(null)} onAction={(a) => startAction(a, view)} />}

      {/* Delete confirm */}
      <CenterModal open={!!deleteFor} onClose={() => setDeleteFor(null)} width={400}>
        <ModalTitle>Delete this file?</ModalTitle>
        <div style={{ marginTop: 10, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
          <b style={{ color: "#fff" }}>{deleteFor?.name}</b>
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: "rgba(248,113,113,0.8)" }}>
          This will delete the file from {deleteFor && platformOf(deleteFor)} permanently.
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setDeleteFor(null)} style={btn("ghost")}>Cancel</button>
          <button onClick={confirmDelete} style={btn("danger")}>Delete</button>
        </div>
      </CenterModal>

      {/* Move / Copy modal */}
      <CenterModal open={!!moveFor} onClose={() => setMoveFor(null)} width={440}>
        <ModalTitle>{moveFor?.mode === "move" ? "Move to…" : "Copy to…"}</ModalTitle>
        <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          Choose a destination account
        </div>
        <div className="mt-4 space-y-1.5 max-h-[320px] overflow-y-auto">
          {ACCOUNTS.map((a) => {
            const sel = moveDest === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setMoveDest(a.id)}
                className="w-full flex items-center gap-3 text-left"
                style={{
                  padding: "10px 12px", borderRadius: 10,
                  background: sel ? "rgba(77,144,254,0.1)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${sel ? "rgba(77,144,254,0.4)" : "rgba(255,255,255,0.06)"}`,
                  transition: "all 150ms ease",
                }}
              >
                <PlatformIcon name={a.platform} size={18} />
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>{a.email}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontVariantNumeric: "tabular-nums" }}>
                    {a.platform} · {Math.max(0, a.total - a.used)} GB available
                  </div>
                </div>
                {sel && <Check size={16} strokeWidth={2} color="#4d90fe" />}
              </button>
            );
          })}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setMoveFor(null)} style={btn("ghost")}>Cancel</button>
          <button
            onClick={() => {
              if (!moveDest || !moveFor) return;
              toast.success(`${moveFor.mode === "move" ? "Moved" : "Copied"} ${moveFor.file.name}`);
              setMoveFor(null);
            }}
            style={{ ...btn("primary"), opacity: moveDest ? 1 : 0.5 }}
          >
            {moveFor?.mode === "move" ? "Move" : "Copy"}
          </button>
        </div>
      </CenterModal>

      {/* Share modal */}
      <CenterModal open={!!shareFor} onClose={() => setShareFor(null)} width={440}>
        <ModalTitle>Share file</ModalTitle>
        <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          {shareFor?.name}
        </div>
        <div style={{ marginTop: 16, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)" }}>
          Share link
        </div>
        <div className="flex gap-2 mt-1.5">
          <input
            readOnly
            value={`https://vaultfish.app/s/${shareFor?.name.replace(/\s+/g, "-").toLowerCase() ?? ""}`}
            onFocus={(e) => e.currentTarget.select()}
            style={{
              flex: 1, background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
              padding: "9px 12px", color: "rgba(255,255,255,0.85)",
              fontFamily: '"Inter", sans-serif', fontSize: 12,
            }}
          />
          <button
            onClick={() => {
              navigator.clipboard?.writeText(`https://vaultfish.app/s/${shareFor?.name}`);
              setShareCopied(true);
              toast.success("Link copied");
              setTimeout(() => setShareCopied(false), 1800);
            }}
            style={{
              ...btn("primary"),
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {shareCopied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.5} />}
            {shareCopied ? "Copied" : "Copy Link"}
          </button>
        </div>
        <div style={{ marginTop: 16, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)" }}>
          Expiry
        </div>
        <select
          value={shareExp}
          onChange={(e) => setShareExp(e.target.value)}
          style={{
            marginTop: 6, width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
            padding: "9px 12px", color: "#fff",
            fontFamily: '"Inter", sans-serif', fontSize: 13,
          }}
        >
          <option>24 hours</option>
          <option>7 days</option>
          <option>30 days</option>
          <option>Never</option>
        </select>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setShareFor(null)} style={btn("ghost")}>Done</button>
        </div>
      </CenterModal>
    </div>
  );
}
