import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { RefreshCw, Unlink, Loader2 } from "lucide-react";
import { Card, SectionTitle } from "../ui";
import { PlatformIcon, PLATFORM_COLORS } from "../PlatformIcons";
import { useConnectedAccounts, PLATFORM_LABEL, GB, type ConnectedAccount } from "@/hooks/useConnectedAccounts";
import { useFiles, formatBytes } from "@/hooks/useFiles";
import {
  startDriveConnect,
  completeDriveConnect,
  syncDriveAccount,
  disconnectDriveAccount,
} from "@/lib/gdrive.functions";

const PLACEHOLDERS = ["Dropbox", "OneDrive"];

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
      </div>
    </div>,
    document.body,
  );
}

function waitForOAuthCompletion(popup: Window) {
  return new Promise<string | null>((resolve, reject) => {
    let poll: number | undefined;
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      if (poll !== undefined) window.clearInterval(poll);
    };
    const onMessage = (event: MessageEvent) => {
      const type = event.data?.type;
      if (
        event.origin !== window.location.origin ||
        event.source !== popup ||
        event.data?.connectorId !== "google_drive" ||
        (type !== "appUserConnectorOAuthComplete" && type !== "appUserConnectorOAuthFailed")
      ) return;
      cleanup();
      if (type === "appUserConnectorOAuthComplete") {
        resolve(typeof event.data?.code === "string" ? event.data.code : null);
        return;
      }
      popup.close();
      reject(new Error("Google did not complete the connection."));
    };
    window.addEventListener("message", onMessage);
    poll = window.setInterval(() => {
      if (!popup.closed) return;
      cleanup();
      reject(new Error("The Google window closed before finishing."));
    }, 500);
  });
}

export function CloudsScreen() {
  const { accounts, loading } = useConnectedAccounts();
  const { files } = useFiles();
  const [modal, setModal] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const driveAccounts = accounts.filter((a) => a.platform === "google_drive");

  const connectDrive = async (accountId?: string) => {
    setError(null);
    setBusy("connect");
    setStatus("Waiting for Google…");
    const popup = window.open("", "vaultfish-google-drive", "width=600,height=720");
    if (!popup) {
      setBusy(null);
      setStatus(null);
      setError("Your browser blocked the Google window. Allow pop-ups and try again.");
      return;
    }
    try {
      const { authorizationUrl, slot } = await startDriveConnect({ data: { accountId } });
      const completion = waitForOAuthCompletion(popup);
      popup.location.href = authorizationUrl;
      const code = await completion;
      if (!code) throw new Error("Google did not return a confirmation.");
      setStatus("Linking your account…");
      const { accountId: linkedId, email } = await completeDriveConnect({ data: { code, slot } });
      setStatus(`Syncing files from ${email}…`);
      const result = await syncDriveAccount({ data: { accountId: linkedId } });
      setStatus(
        result.reconnectRequired
          ? "Google access needs to be renewed."
          : `Connected ${email} — ${result.synced} files synced.`,
      );
    } catch (e: any) {
      popup.close();
      setError(e?.message ?? "Could not connect Google Drive.");
      setStatus(null);
    } finally {
      setBusy(null);
    }
  };

  const resync = async (a: ConnectedAccount) => {
    setError(null);
    setBusy(a.id);
    setStatus(`Syncing ${a.email}…`);
    try {
      const result = await syncDriveAccount({ data: { accountId: a.id } });
      setStatus(
        result.reconnectRequired
          ? `${a.email} needs to be reconnected.`
          : `${a.email} — ${result.synced} files synced.`,
      );
    } catch (e: any) {
      setError(e?.message ?? "Sync failed.");
      setStatus(null);
    } finally {
      setBusy(null);
    }
  };

  const disconnect = async (a: ConnectedAccount) => {
    setError(null);
    setBusy(a.id);
    setStatus(`Disconnecting ${a.email}…`);
    try {
      await disconnectDriveAccount({ data: { accountId: a.id } });
      setStatus(`${a.email} disconnected.`);
    } catch (e: any) {
      setError(e?.message ?? "Could not disconnect.");
      setStatus(null);
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <div className="text-muted text-sm">Loading…</div>;

  return (
    <div className="space-y-6">
      <SectionTitle sub="Connect and manage your cloud accounts">Connected Clouds</SectionTitle>

      {status && (
        <Card className="p-3">
          <div className="flex items-center gap-2 text-sm" style={{ color: "#4d90fe" }}>
            {busy && <Loader2 size={15} className="animate-spin" />} {status}
          </div>
        </Card>
      )}
      {error && (
        <Card className="p-3">
          <div className="text-sm" style={{ color: "#ef4444" }}>{error}</div>
        </Card>
      )}

      {driveAccounts.map((a) => {
        const label = PLATFORM_LABEL[a.platform];
        const accountFiles = files.filter((f) => f.source_account_id === a.id);
        const used = Number(a.storage_used);
        const total = Number(a.storage_total);
        const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
        const needsReconnect = (a as any).sync_status === "reconnect";
        return (
          <Card key={a.id} className="p-4">
            <div className="flex items-center gap-3">
              <PlatformIcon name={label} size={20} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: PLATFORM_COLORS[label] }}>{a.email}</div>
                <div className="text-xs text-muted mt-0.5">
                  {accountFiles.length} files · {(a as any).last_synced_at ? `synced ${new Date((a as any).last_synced_at).toLocaleString()}` : "not synced yet"}
                </div>
              </div>
            </div>
            <div className="mt-2.5 w-full" style={{ background: "rgba(255,255,255,0.06)", height: 4, borderRadius: 999 }}>
              <div style={{ width: `${pct}%`, height: 4, borderRadius: 999, background: PLATFORM_COLORS[label] }} />
            </div>
            <div className="flex justify-between text-xs text-muted mt-1">
              <span>{total > 0 ? `${formatBytes(used)} of ${(total / GB).toFixed(0)} GB used` : formatBytes(used) + " used"}</span>
              <span>Connected {new Date(a.connected_at).toLocaleDateString()}</span>
            </div>
            {needsReconnect && (
              <div className="text-xs mt-2" style={{ color: "#d97706" }}>
                Your Google access needs to be renewed.
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => (needsReconnect ? connectDrive(a.id) : resync(a))}
                disabled={busy !== null}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold"
                style={{ background: "rgba(77,144,254,0.12)", border: "1px solid rgba(77,144,254,0.3)", color: "#4d90fe", opacity: busy ? 0.6 : 1 }}
              >
                {busy === a.id ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {needsReconnect ? "Reconnect" : "Sync now"}
              </button>
              <button
                onClick={() => disconnect(a)}
                disabled={busy !== null}
                className="flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", opacity: busy ? 0.6 : 1 }}
              >
                <Unlink size={14} /> Disconnect
              </button>
            </div>
          </Card>
        );
      })}

      {driveAccounts.length === 0 && (
        <Card className="p-8 text-center">
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>No clouds connected yet</div>
          <div className="text-muted text-sm mt-2">Link a Google account to bring its files into VaultFish.</div>
        </Card>
      )}

      <div className="flex flex-col gap-2 pt-1">
        <button
          onClick={() => connectDrive()}
          disabled={busy !== null}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
          style={{ background: "rgba(77,144,254,0.12)", border: "1px solid rgba(77,144,254,0.3)", color: "#4d90fe", fontSize: 13, fontWeight: 600, opacity: busy ? 0.6 : 1 }}
        >
          {busy === "connect" ? <Loader2 size={16} className="animate-spin" /> : <PlatformIcon name="Google Drive" size={16} />}
          {driveAccounts.length === 0 ? "Connect Google Drive" : "Add another Google Drive"}
        </button>
        {PLACEHOLDERS.map((label) => (
          <button
            key={label}
            onClick={() => setModal(label)}
            className="w-full border-2 border-dashed border-border rounded-xl py-3 text-sm text-muted hover:text-foreground flex items-center justify-center gap-2"
          >
            <PlatformIcon name={label} size={16} /> Connect {label}
          </button>
        ))}
      </div>

      {modal && <ComingSoonModal platform={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
