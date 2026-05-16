import { useState } from "react";
import { Card, SectionTitle, Bar } from "../ui";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { PlatformIcon, PLATFORM_COLORS } from "../PlatformIcons";
import { DisconnectModal, type DisconnectTarget } from "../DisconnectModal";
import { useConnectedAccounts, PLATFORM_LABEL, GB, type ConnectedAccount } from "@/hooks/useConnectedAccounts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

type PlatformKey = ConnectedAccount["platform"];

const PLATFORM_KEYS: PlatformKey[] = ["google_drive", "dropbox", "onedrive"];

const MOCK_DATA: Record<PlatformKey, { totalGb: number; usedGb: number }> = {
  google_drive: { totalGb: 100, usedGb: 24 },
  dropbox: { totalGb: 25, usedGb: 8 },
  onedrive: { totalGb: 25, usedGb: 10 },
};

export function CloudsScreen() {
  const { user } = useAuth();
  const { accounts, loading } = useConnectedAccounts();
  const [modal, setModal] = useState<DisconnectTarget | null>(null);
  const [connecting, setConnecting] = useState<PlatformKey | null>(null);

  const connect = async (platform: PlatformKey) => {
    if (!user) return;
    setConnecting(platform);
    const m = MOCK_DATA[platform];
    const email = `${user.email?.split("@")[0] ?? "you"}+${platform}@${platform.replace("_", "")}.com`;
    const { error } = await supabase.from("connected_accounts").insert({
      user_id: user.id,
      platform,
      email,
      display_name: user.user_metadata?.full_name ?? null,
      storage_used: m.usedGb * GB,
      storage_total: m.totalGb * GB,
      is_active: true,
    });
    setConnecting(null);
    if (error) toast.error(error.message);
    else toast.success(`${PLATFORM_LABEL[platform]} connected`);
  };

  const disconnect = async (id: string) => {
    const { error } = await supabase.from("connected_accounts").delete().eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Account disconnected");
  };

  if (loading) return <div className="text-muted text-sm">Loading…</div>;

  if (accounts.length === 0) {
    return (
      <div className="space-y-6">
        <SectionTitle sub="Add your cloud accounts and bring everything together">Connected Clouds</SectionTitle>
        <Card className="p-8 text-center">
          <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 16, fontWeight: 600 }}>No clouds connected yet</div>
          <div className="text-muted text-sm mt-2">Pick a provider to get started.</div>
          <div className="mt-5 flex flex-col gap-2">
            {PLATFORM_KEYS.map((p) => (
              <button
                key={p}
                disabled={connecting === p}
                onClick={() => connect(p)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
                style={{
                  background: "rgba(77,144,254,0.12)",
                  border: "1px solid rgba(77,144,254,0.3)",
                  color: "#4d90fe",
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <PlatformIcon name={PLATFORM_LABEL[p]} size={16} />
                {connecting === p ? "Connecting…" : `Connect ${PLATFORM_LABEL[p]}`}
              </button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle sub="Add your cloud accounts and bring everything together">Connected Clouds</SectionTitle>

      {PLATFORM_KEYS.map((p) => {
        const accs = accounts.filter((a) => a.platform === p);
        const label = PLATFORM_LABEL[p];
        return (
          <div key={p}>
            <h2 className="flex items-center gap-2 mb-3">
              <PlatformIcon name={label} size={18} />
              <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 500, color: PLATFORM_COLORS[label] }}>{label}</span>
            </h2>
            <div className="space-y-2">
              {accs.map((a) => {
                const usedGb = Math.round(a.storage_used / GB);
                const totalGb = Math.round(a.storage_total / GB);
                const pct = totalGb > 0 ? Math.round((usedGb / totalGb) * 100) : 0;
                return (
                  <Card key={a.id} className="p-4 flex items-center gap-4">
                    <div className="shrink-0 flex items-center justify-center" style={{ width: 24, height: 24 }}>
                      <PlatformIcon name={label} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{a.email}</div>
                      <div className="mt-1.5"><Bar pct={pct} color="" height="h-1.5" /></div>
                      <div className="flex justify-between text-xs text-muted mt-1">
                        <span>{usedGb} GB / {totalGb} GB</span>
                        <span>{pct}%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setModal({ id: a.id, email: a.email, gb: usedGb, platform: label })}
                      className="p-2 rounded-lg hover:bg-background text-muted hover:text-foreground"
                    >
                      <X size={18} strokeWidth={1.5} />
                    </button>
                  </Card>
                );
              })}
              <button
                disabled={connecting === p}
                onClick={() => connect(p)}
                className="w-full border-2 border-dashed border-border rounded-2xl py-3 text-sm text-muted hover:text-foreground hover:border-[color:var(--accent-blue)] transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} strokeWidth={1.5} /> {connecting === p ? "Connecting…" : `Add another ${label}`}
              </button>
            </div>
          </div>
        );
      })}

      <DisconnectModal
        target={modal}
        onClose={() => setModal(null)}
        onConfirm={(id) => disconnect(id)}
      />
    </div>
  );
}
