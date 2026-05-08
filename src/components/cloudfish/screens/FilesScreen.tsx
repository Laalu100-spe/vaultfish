import { useEffect, useRef, useState } from "react";
import { SectionTitle, Pill, Card } from "../ui";
import { FILES, TYPE_COLORS, type FileItem } from "../data";
import { MoreVertical, Download, FolderInput, Copy, Pencil, Share2, Trash2 } from "lucide-react";
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

export function FilesScreen() {
  const [f, setF] = useState("All Clouds");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [action, setAction] = useState<{ type: Action; file: FileItem } | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const visible = f === "All Clouds" ? FILES : FILES.filter((x) => x.account === f);

  const startAction = (type: Action, file: FileItem) => {
    if (type === "rename") setRenameValue(file.name);
    setAction({ type, file });
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
          <Pill key={x} active={f === x} onClick={() => setF(x)}>
            {x}
          </Pill>
        ))}
      </div>
      <div className="space-y-2">
        {visible.map((file, i) => (
          <Card key={i} className="p-3 flex items-center gap-3">
            <div
              className="h-11 w-11 rounded-xl flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ background: TYPE_COLORS[file.type] }}
            >
              {file.type.toUpperCase()}
            </div>
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
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === i ? null : i)}
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
