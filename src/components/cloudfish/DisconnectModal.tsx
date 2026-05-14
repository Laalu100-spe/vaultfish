import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FolderInput, Copy, LogOut } from "lucide-react";
import { PlatformIcon } from "./PlatformIcons";
import { ACCOUNTS } from "./data";

export type DisconnectTarget = { id: string; email: string; gb: number; platform: string };

export function DisconnectModal({
  target,
  onClose,
  onConfirm,
}: {
  target: DisconnectTarget | null;
  onClose: () => void;
  onConfirm?: (id: string, choice: "move" | "copy" | "disconnect", dest?: string) => void;
}) {
  const [choice, setChoice] = useState<"move" | "copy" | "disconnect">("move");
  const [dest, setDest] = useState<string>("");
  const otherAccounts = ACCOUNTS.filter((a) => a.id !== target?.id);

  useEffect(() => {
    if (target) {
      setChoice("move");
      setDest(otherAccounts[0] ? `${otherAccounts[0].platform} · ${otherAccounts[0].email}` : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.id]);

  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [target, onClose]);

  if (!target) return null;
  const cta = choice === "move" ? "Move & Disconnect" : choice === "copy" ? "Copy & Disconnect" : "Disconnect";

  if (typeof document === "undefined") return null;

  const content = (
    <div
      onClick={onClose}
      style={{
        position: "fixed", top: 0, left: 0,
        width: "100vw", height: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        zIndex: 9999, padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative", width: "90%", maxWidth: 380,
          maxHeight: "90vh", overflowY: "auto",
          background: "rgba(14,17,24,0.97)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: 24,
          fontFamily: '"Inter", sans-serif',
          boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <PlatformIcon name={target.platform} size={20} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{target.email}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>· {target.gb} GB</span>
          </div>
        </div>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 12, lineHeight: 1.45 }}>
          This account has {target.gb} GB of files. What would you like to do with them?
        </p>

        <div style={{ marginTop: 16 }}>
          {([
            { id: "move" as const, t: "Move files", d: "Transfer to another connected account", Icon: FolderInput, color: "#4d90fe", titleColor: "#fff" },
            { id: "copy" as const, t: "Copy files (keep original)", d: "Duplicate to another cloud, original stays", Icon: Copy, color: "#a78bfa", titleColor: "#fff" },
            { id: "disconnect" as const, t: "Just disconnect", d: "Files stay in the cloud but leave VaultFish", Icon: LogOut, color: "#6b7280", titleColor: "rgba(255,255,255,0.7)" },
          ]).map((o) => {
            const selected = choice === o.id;
            return (
              <div
                key={o.id}
                onClick={() => setChoice(o.id)}
                style={{
                  background: selected ? "rgba(77,144,254,0.08)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selected ? "#4d90fe" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 12, padding: "14px 16px", marginBottom: 8,
                  cursor: "pointer", transition: "all 150ms ease",
                  display: "flex", gap: 12, alignItems: "flex-start",
                }}
              >
                <o.Icon size={18} strokeWidth={1.5} color={o.color} style={{ marginTop: 1, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: o.titleColor }}>{o.t}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{o.d}</div>
                  {selected && (o.id === "move" || o.id === "copy") && otherAccounts.length > 0 && (
                    <select
                      value={dest}
                      onChange={(e) => setDest(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        marginTop: 10, width: "100%",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8, padding: "8px 12px",
                        fontSize: 12, color: "#fff",
                        fontFamily: '"Inter", sans-serif',
                      }}
                    >
                      {otherAccounts.map((a) => {
                        const v = `${a.platform} · ${a.email}`;
                        return <option key={a.id} value={v} style={{ background: "#0e1118" }}>{v}</option>;
                      })}
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, height: 44, borderRadius: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)",
              fontFamily: '"Inter", sans-serif', cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm?.(target.id, choice, dest);
              onClose();
            }}
            style={{
              flex: 1, height: 44, borderRadius: 10,
              background: choice === "disconnect" ? "#ef4444" : "#4d90fe",
              border: "none",
              fontSize: 13, fontWeight: 600, color: "#fff",
              fontFamily: '"Inter", sans-serif', cursor: "pointer",
              transition: "background 150ms ease",
            }}
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
