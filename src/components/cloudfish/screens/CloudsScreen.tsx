import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Card, SectionTitle } from "../ui";
import { PlatformIcon, PLATFORM_COLORS } from "../PlatformIcons";
import { useConnectedAccounts, PLATFORM_LABEL, GB, type ConnectedAccount } from "@/hooks/useConnectedAccounts";

type PlatformKey = ConnectedAccount["platform"];
const PLATFORM_KEYS: PlatformKey[] = ["google_drive", "dropbox", "onedrive"];

function ComingSoonModal({ platform, onClose }: { platform: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.8)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        zIndex: 9999, padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 360, width: "100%",
          background: "rgba(14,17,24,0.95)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20, padding: 32, textAlign: "center",
          fontFamily: '"Inter", sans-serif',
        }}
      >
        <div className="flex justify-center mb-4"><PlatformIcon name={platform} size={48} /></div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Connect {platform}</div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginTop: 10 }}>
          Full {platform} integration is coming in the next update. You will be notified when it is ready.
        </p>
        <button
          onClick={onClose}
          className="w-full mt-6 text-white font-semibold"
          style={{ background: "#4d90fe", borderRadius: 10, padding: "12px", fontSize: 13 }}
        >
          Got it
        </button>
        <div style={{ marginTop: 14, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
          Meanwhile upload files directly using the Upload button
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function CloudsScreen() {
  const { accounts, loading } = useConnectedAccounts();
  const [modal, setModal] = useState<string | null>(null);

  if (loading) return <div className="text-muted text-sm">Loading…</div>;

  return (
    <div className="space-y-6">
      <SectionTitle sub="Connect and manage your cloud accounts">Connected Clouds</SectionTitle>

      {accounts.length === 0 ? (
        <Card className="p-8 text-center">
          <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>No clouds connected yet</div>
          <div className="text-muted text-sm mt-2">Pick a provider to explore integrations.</div>
          <div className="mt-5 flex flex-col gap-2">
            {PLATFORM_KEYS.map((p) => {
              const label = PLATFORM_LABEL[p];
              return (
                <button
                  key={p}
                  onClick={() => setModal(label)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
                  style={{ background: "rgba(77,144,254,0.12)", border: "1px solid rgba(77,144,254,0.3)", color: "#4d90fe", fontSize: 13, fontWeight: 600 }}
                >
                  <PlatformIcon name={label} size={16} /> Connect {label}
                </button>
              );
            })}
          </div>
        </Card>
      ) : (
        <>
          {accounts.map((a) => {
            const label = PLATFORM_LABEL[a.platform];
            const used = Math.round(Number(a.storage_used) / GB);
            const total = Math.round(Number(a.storage_total) / GB);
            const pct = total > 0 ? Math.round((used / total) * 100) : 0;
            return (
              <Card key={a.id} className="p-4 flex items-center gap-4">
                <PlatformIcon name={label} size={20} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: PLATFORM_COLORS[label] }}>{a.email}</div>
                  <div className="mt-1.5 w-full" style={{ background: "rgba(255,255,255,0.06)", height: 4, borderRadius: 999 }}>
                    <div style={{ width: `${pct}%`, height: 4, borderRadius: 999, background: PLATFORM_COLORS[label] }} />
                  </div>
                  <div className="flex justify-between text-xs text-muted mt-1">
                    <span>{used} GB / {total} GB</span>
                    <span>Connected {new Date(a.connected_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
            );
          })}
          <div className="flex flex-col gap-2 pt-2">
            {PLATFORM_KEYS.map((p) => {
              const label = PLATFORM_LABEL[p];
              return (
                <button
                  key={p}
                  onClick={() => setModal(label)}
                  className="w-full border-2 border-dashed border-border rounded-xl py-3 text-sm text-muted hover:text-foreground flex items-center justify-center gap-2"
                >
                  <PlatformIcon name={label} size={16} /> Add {label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {modal && <ComingSoonModal platform={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
