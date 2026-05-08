import { useEffect, useRef, useState } from "react";
import { SectionTitle, Card } from "../ui";
import { FILES, type FileItem } from "../data";
import { MoreVertical, Download, FolderInput, Copy, Pencil, Share2, Trash2, X } from "lucide-react";
import { Modal, ModalButton } from "../Modal";

const FILTERS = ["All Clouds", "saran@gmail", "college", "work", "dropbox"];

type Action = "download" | "move" | "copy" | "rename" | "share" | "delete";

const MENU: { id: Action; label: string; Icon: any; danger?: boolean }[] = [
  { id: "download", label: "Download", Icon: Download },
  { id: "move", label: "Move to…", Icon: FolderInput },
  { id: "copy", label: "Copy to…", Icon: Copy },
  { id: "rename", label: "Rename", Icon: Pencil },
  { id: "share", label: "Share", Icon: Share2 },
  { id: "delete", label: "Delete", Icon: Trash2, danger: true },
];

const TYPE_LABEL_COLORS: Record<FileItem["type"], string> = {
  pdf: "#f87171",
  doc: "#60a5fa",
  xls: "#4ade80",
  mp4: "#a78bfa",
  png: "#fb923c",
};

function FileTypeIcon({ type, width = 36, height = 44 }: { type: FileItem["type"]; width?: number; height?: number }) {
  const fold = Math.round(width * 0.28);
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: 6,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <svg
        width={fold}
        height={fold}
        viewBox="0 0 10 10"
        style={{ position: "absolute", top: 0, right: 0 }}
        aria-hidden
      >
        <path d={`M0 0 L10 0 L10 10 Z`} fill="rgba(255,255,255,0.1)" />
      </svg>
      <span
        style={{
          fontFamily: '"Inter", sans-serif',
          fontSize: width >= 48 ? 11 : 9,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: TYPE_LABEL_COLORS[type],
        }}
      >
        {type.toUpperCase()}
      </span>
    </div>
  );
}

function FileMenu({
  onPick,
  onClose,
}: {
  onPick: (a: Action) => void;
  onClose: () => void;
}) {
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
  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% + 4px)",
        right: 0,
        zIndex: 50,
        minWidth: 180,
        background: "rgba(18,21,28,0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        padding: 6,
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
      }}
    >
      {MENU.map((m) => (
        <button
          key={m.id}
          onClick={() => {
            onPick(m.id);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 file-menu-item"
          style={{
            padding: "8px 14px",
            borderRadius: 6,
            fontFamily: '"Inter", sans-serif',
            fontSize: 13,
            fontWeight: 400,
            letterSpacing: "-0.01em",
            color: m.danger ? "#f87171" : "rgba(255,255,255,0.85)",
            textAlign: "left",
          }}
        >
          <m.Icon size={14} strokeWidth={1.5} />
          {m.label}
        </button>
      ))}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 16px",
        borderRadius: 999,
        fontFamily: '"Inter", sans-serif',
        fontSize: 12,
        fontWeight: active ? 600 : 500,
        whiteSpace: "nowrap",
        background: active ? "#4d90fe" : "rgba(255,255,255,0.05)",
        border: active ? "1px solid transparent" : "1px solid rgba(255,255,255,0.08)",
        color: active ? "#fff" : "rgba(255,255,255,0.5)",
        transition: "all 150ms ease",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
          e.currentTarget.style.color = "rgba(255,255,255,0.8)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          e.currentTarget.style.color = "rgba(255,255,255,0.5)";
        }
      }}
    >
      {children}
    </button>
  );
}

const TYPE_NAMES: Record<FileItem["type"], string> = {
  pdf: "PDF Document",
  doc: "Word Document",
  xls: "Spreadsheet",
  mp4: "Video",
  png: "Image",
};

function PreviewModal({ file, onClose, onAction }: { file: FileItem; onClose: () => void; onAction: (a: Action) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const labelStyle: React.CSSProperties = {
    fontFamily: '"Inter", sans-serif',
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.3)",
  };
  const valueStyle: React.CSSProperties = {
    fontFamily: '"Inter", sans-serif',
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", animation: "previewFade 200ms ease-out" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "rgba(14,17,24,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: 28,
          fontFamily: '"Inter", sans-serif',
          animation: "previewIn 200ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="flex items-start gap-4">
          <FileTypeIcon type={file.type} width={48} height={56} />
          <div className="flex-1 min-w-0">
            <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", wordBreak: "break-word" }}>
              {file.name}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ color: "rgba(255,255,255,0.5)", padding: 4 }}>
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-5 mt-6">
          <div>
            <div style={labelStyle}>Size</div>
            <div style={valueStyle}>{file.size}</div>
          </div>
          <div>
            <div style={labelStyle}>Modified</div>
            <div style={valueStyle}>{file.time}</div>
          </div>
          <div>
            <div style={labelStyle}>Location</div>
            <div style={{ marginTop: 6 }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 8px",
                  borderRadius: 6,
                  background: file.accountColor,
                  color: "#fff",
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              >
                {file.account}
              </span>
            </div>
          </div>
          <div>
            <div style={labelStyle}>Type</div>
            <div style={valueStyle}>{TYPE_NAMES[file.type]}</div>
          </div>
        </div>

        <div className="flex gap-2 mt-7">
          <button
            onClick={() => onAction("download")}
            style={{
              flex: 1, height: 40, borderRadius: 10, background: "#4d90fe", color: "#fff",
              fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 600,
            }}
          >
            Download
          </button>
          <button
            onClick={() => onAction("move")}
            style={{
              flex: 1, height: 40, borderRadius: 10,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.85)",
              fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 600,
            }}
          >
            Move
          </button>
          <button
            onClick={() => onAction("share")}
            style={{
              flex: 1, height: 40, borderRadius: 10,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.85)",
              fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 600,
            }}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

export function FilesScreen() {
  const [f, setF] = useState("All Clouds");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [preview, setPreview] = useState<FileItem | null>(null);
  const [action, setAction] = useState<{ type: Action; file: FileItem } | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const visible = f === "All Clouds" ? FILES : FILES.filter((x) => x.account === f);

  const startAction = (type: Action, file: FileItem) => {
    if (type === "rename") setRenameValue(file.name);
    setAction({ type, file });
    setPreview(null);
  };

  const close = () => setAction(null);

  const titles: Record<Action, string> = {
    download: "Download file",
    move: "Move to…",
    copy: "Copy to…",
    rename: "Rename file",
    share: "Share file",
    delete: "Delete file",
  };

  return (
    <div className="space-y-5">
      <SectionTitle sub="Viewing across 5 accounts">All Files</SectionTitle>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((x) => (
          <FilterChip key={x} active={f === x} onClick={() => setF(x)}>
            {x}
          </FilterChip>
        ))}
      </div>
      <div key={f} className="space-y-2" style={{ animation: "listFade 200ms ease-out" }}>
        {visible.map((file, i) => (
          <Card key={i} className="p-3 flex items-center gap-3 file-row" >
            <div
              onClick={() => setPreview(file)}
              className="flex-1 min-w-0 flex items-center gap-3 cursor-pointer"
            >
              <FileTypeIcon type={file.type} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{file.name}</div>
                <div className="text-xs text-muted flex items-center gap-2 mt-0.5">
                  <span
                    className="px-1.5 py-0.5 rounded-md text-[10px] font-medium text-white"
                    style={{ background: file.accountColor }}
                  >
                    {file.account}
                  </span>
                  <span>{file.size}</span>
                  <span>•</span>
                  <span>{file.time}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(openMenu === i ? null : i);
                }}
                className="p-2 text-muted hover:text-foreground"
                aria-label="File actions"
              >
                <MoreVertical size={18} strokeWidth={1.5} />
              </button>
              {openMenu === i && (
                <FileMenu
                  onClose={() => setOpenMenu(null)}
                  onPick={(a) => startAction(a, file)}
                />
              )}
            </div>
          </Card>
        ))}
        {visible.length === 0 && (
          <div className="text-center text-muted py-12 text-sm">No files for this filter.</div>
        )}
      </div>

      {preview && (
        <PreviewModal
          file={preview}
          onClose={() => setPreview(null)}
          onAction={(a) => startAction(a, preview)}
        />
      )}

      <Modal
        open={!!action}
        onClose={close}
        title={action ? titles[action.type] : ""}
        footer={
          action && (
            <>
              <ModalButton onClick={close}>Cancel</ModalButton>
              <ModalButton
                onClick={close}
                variant={action.type === "delete" ? "danger" : "primary"}
              >
                {action.type === "delete" ? "Delete" : "Confirm"}
              </ModalButton>
            </>
          )
        }
      >
        {action?.type === "delete" && (
          <>Permanently delete <b style={{ color: "#fff" }}>{action.file.name}</b>? This cannot be undone.</>
        )}
        {action?.type === "rename" && (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            style={{
              marginTop: 6,
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "10px 12px",
              color: "#fff",
              fontFamily: '"Inter", sans-serif',
              fontSize: 13,
            }}
          />
        )}
        {action?.type === "download" && <>Downloading <b style={{ color: "#fff" }}>{action.file.name}</b>…</>}
        {action?.type === "share" && <>Generate a shareable link for <b style={{ color: "#fff" }}>{action.file.name}</b>?</>}
        {(action?.type === "move" || action?.type === "copy") && (
          <div style={{ marginTop: 6 }}>
            <select
              defaultValue=""
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "10px 12px",
                color: "#fff",
                fontFamily: '"Inter", sans-serif',
                fontSize: 13,
              }}
            >
              <option value="" disabled>Select destination…</option>
              <option>Google Drive — saran@gmail.com</option>
              <option>Google Drive — work</option>
              <option>Dropbox</option>
              <option>OneDrive</option>
            </select>
          </div>
        )}
      </Modal>
    </div>
  );
}
