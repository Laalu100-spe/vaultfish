import { useEffect, useState } from "react";
import { Card, SectionTitle, Bar } from "../ui";
import { ACCOUNTS } from "../data";
import { Plus, X, FolderInput, Copy, LogOut } from "lucide-react";
import { PlatformIcon, PLATFORM_COLORS } from "../PlatformIcons";


type Modal = { id: string; email: string; gb: number } | null;

export function CloudsScreen() {
  const [modal, setModal] = useState<Modal>(null);
  const [choice, setChoice] = useState<"move"|"copy"|"disconnect">("move");
  const acct = modal ? ACCOUNTS.find(a => a.id === modal.id) : undefined;
  const platform = acct?.platform ?? "Google Drive";
  const otherAccounts = ACCOUNTS.filter(a => a.id !== modal?.id);
  const [dest, setDest] = useState<string>("");

  useEffect(() => {
    if (modal) {
      setChoice("move");
      setDest(otherAccounts[0] ? `${otherAccounts[0].platform} · ${otherAccounts[0].email}` : "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal?.id]);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setModal(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modal]);

  const platforms = ["Google Drive", "Dropbox", "OneDrive"];
  const cta = choice === "move" ? "Move & Disconnect" : choice === "copy" ? "Copy & Disconnect" : "Disconnect";


  return (
    <div className="space-y-6">
      <SectionTitle sub="Add your cloud accounts and bring everything together">Connected Clouds</SectionTitle>

      {platforms.map(p => {
        const accs = ACCOUNTS.filter(a => a.platform === p);
        return (
          <div key={p}>
            <h2 className="flex items-center gap-2 mb-3">
              <PlatformIcon name={p} size={18} />
              <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 500, color: PLATFORM_COLORS[p] }}>{p}</span>
            </h2>
            <div className="space-y-2">
              {accs.map(a => {
                const pct = Math.round((a.used/a.total)*100);
                return (
                  <Card key={a.id} className="p-4 flex items-center gap-4">
                    <div className="shrink-0 flex items-center justify-center" style={{ width: 24, height: 24 }}>
                      <PlatformIcon name={p} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{a.email}</div>
                      <div className="mt-1.5"><Bar pct={pct} color="" height="h-1.5" /></div>
                      <div className="flex justify-between text-xs text-muted mt-1">
                        <span>{a.used} GB / {a.total} GB</span>
                        <span>{pct}%</span>
                      </div>
                    </div>
                    <button onClick={() => setModal({ id: a.id, email: a.email, gb: a.used })} className="p-2 rounded-lg hover:bg-background text-muted hover:text-foreground">
                      <X size={18} strokeWidth={1.5} />
                    </button>
                  </Card>
                );
              })}
              <button className="w-full border-2 border-dashed border-border rounded-2xl py-3 text-sm text-muted hover:text-foreground hover:border-[color:var(--accent-blue)] transition-colors flex items-center justify-center gap-2">
                <Plus size={18} strokeWidth={1.5} /> Add another {p}
              </button>
            </div>
          </div>
        );
      })}

      {modal && (
        <>
          <div
            className="vf-modal-backdrop"
            onClick={() => setModal(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", zIndex: 9998 }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="vf-modal-card"
            style={{
              position: "fixed", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 9999, width: "90%", maxWidth: 360,
              background: "rgba(14,17,24,0.97)",
              backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20, padding: 24,
              fontFamily: '"Inter", sans-serif',
              boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
            }}
          >
            {/* Account info row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <PlatformIcon name={platform} size={20} />
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{modal.email}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>· {modal.gb} GB</span>
              </div>
            </div>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 12, lineHeight: 1.45 }}>
              This account has {modal.gb} GB of files. What would you like to do with them?
            </p>

            <div style={{ marginTop: 16 }}>
              {([
                { id: "move" as const, t: "Move files", d: "Transfer to another connected account", Icon: FolderInput, color: "#4d90fe", titleColor: "#fff" },
                { id: "copy" as const, t: "Copy files (keep original)", d: "Duplicate to another cloud, original stays", Icon: Copy, color: "#a78bfa", titleColor: "#fff" },
                { id: "disconnect" as const, t: "Just disconnect", d: "Files stay in the cloud but leave VaultFish", Icon: LogOut, color: "#6b7280", titleColor: "rgba(255,255,255,0.7)" },
              ]).map(o => {
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
                          {otherAccounts.map(a => {
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
                onClick={() => setModal(null)}
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
                onClick={() => setModal(null)}
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
        </>
      )}

    </div>
  );
}
