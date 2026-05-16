import { useState } from "react";
import { Card, SectionTitle, Toggle } from "../ui";
import { PlatformIcon, PLATFORM_COLORS } from "../PlatformIcons";
import { Modal, ModalButton } from "../Modal";
import { DisconnectModal, type DisconnectTarget } from "../DisconnectModal";
import { ChevronRight, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePreferences } from "@/context/PreferencesContext";
import { useConnectedAccounts, PLATFORM_LABEL, GB } from "@/hooks/useConnectedAccounts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="section-label mb-2 px-1">{children}</h2>;
}

function Row({
  title, desc, right, onClick,
}: { title: string; desc?: string; right?: React.ReactNode; onClick?: () => void }) {
  const Comp: any = onClick ? "button" : "div";
  return (
    <Comp onClick={onClick} className="w-full flex items-center justify-between gap-3 text-left" style={{ padding: "14px 16px" }}>
      <div className="min-w-0">
        <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em", color: "rgba(255,255,255,0.92)" }}>{title}</div>
        {desc && <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{desc}</div>}
      </div>
      <div className="shrink-0">{right}</div>
    </Comp>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8, padding: "6px 10px", color: "#fff",
        fontFamily: '"Inter", sans-serif', fontSize: 12,
      }}
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

type ConfirmKind = "encryption" | null;

export function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { prefs, update } = usePreferences();
  const { accounts } = useConnectedAccounts();

  const [autoLock, setAutoLock] = useState("5 min");
  const [cache, setCache] = useState(234);
  const [notifStorage, setNotifStorage] = useState(true);
  const [notifDup, setNotifDup] = useState(true);
  const [notifReport, setNotifReport] = useState(false);
  const [showDarkTip, setShowDarkTip] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmKind>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<DisconnectTarget | null>(null);
  const [clearedNotice, setClearedNotice] = useState(false);

  const avatar = (user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture) as string | undefined;
  const displayName = (user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? "VaultFish user") as string;
  const email = user?.email ?? "";

  const handleDisconnect = async (id: string) => {
    const { error } = await supabase.from("connected_accounts").delete().eq("id", id);
    if (error) toast.error(error.message);
    else toast.success("Account disconnected");
  };

  return (
    <div className="space-y-7">
      <SectionTitle>Settings</SectionTitle>

      {/* User profile */}
      <Card className="p-4 flex items-center gap-3">
        {avatar ? (
          <img src={avatar} alt={displayName} width={40} height={40} style={{ width: 40, height: 40, borderRadius: 999, objectFit: "cover" }} />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: 999, background: "rgba(77,144,254,0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4d90fe", fontFamily: '"Inter", sans-serif', fontWeight: 700 }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 600, color: "#fff" }}>{displayName}</div>
          <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{email}</div>
        </div>
      </Card>

      {/* Accounts */}
      <div>
        <SectionLabel>Accounts</SectionLabel>
        <Card className="divide-y divide-border">
          {accounts.length === 0 && (
            <div style={{ padding: "16px", fontFamily: '"Inter", sans-serif', fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
              No clouds connected.
            </div>
          )}
          {accounts.map((a) => {
            const label = PLATFORM_LABEL[a.platform];
            const used = Math.round(a.storage_used / GB);
            const total = Math.round(a.storage_total / GB);
            return (
              <Row
                key={a.id}
                title={label}
                desc={a.email}
                right={
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <PlatformIcon name={label} size={16} />
                    </div>
                    <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>{used}/{total} GB</span>
                    <button
                      onClick={() => setDisconnectTarget({ id: a.id, email: a.email, gb: used, platform: label })}
                      style={{
                        fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 500,
                        color: "#f87171", padding: "4px 10px", borderRadius: 6,
                        border: "1px solid rgba(248,113,113,0.25)", background: "rgba(248,113,113,0.06)",
                      }}
                    >
                      Disconnect
                    </button>
                  </div>
                }
              />
            );
          })}
        </Card>
      </div>

      {/* Security */}
      <div>
        <SectionLabel>Security & Encryption</SectionLabel>
        <Card className="divide-y divide-border">
          <Row
            title="End-to-end encryption"
            desc="Encrypt files before upload"
            right={<Toggle on={prefs.encryption_enabled} onChange={(v) => { if (v) setConfirm("encryption"); else update({ encryption_enabled: false }); }} />}
          />
          <Row title="Auto-lock timer" desc="Lock the app after inactivity" right={<Select value={autoLock} onChange={setAutoLock} options={["Never", "1 min", "5 min", "15 min"]} />} />
        </Card>
      </div>

      {/* Storage */}
      <div>
        <SectionLabel>Storage</SectionLabel>
        <Card className="divide-y divide-border">
          <Row title="Auto Optimize" desc="Distribute uploads automatically" right={<Toggle on={prefs.auto_optimize} onChange={(v) => update({ auto_optimize: v })} />} />
          <Row title="Smart Split" desc="Split large files across clouds" right={<Toggle on={prefs.smart_split} onChange={(v) => update({ smart_split: v })} />} />
          <Row
            title="Cache size"
            desc={`${cache} MB used locally`}
            right={
              <button
                onClick={() => { setCache(0); setClearedNotice(true); }}
                style={{
                  fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 500,
                  color: "#4d90fe", padding: "6px 12px", borderRadius: 8,
                  border: "1px solid rgba(77,144,254,0.3)", background: "rgba(77,144,254,0.08)",
                }}
              >
                Clear Cache
              </button>
            }
          />
        </Card>
      </div>

      {/* Notifications */}
      <div>
        <SectionLabel>Notifications</SectionLabel>
        <Card className="divide-y divide-border">
          <Row title="Storage alerts" desc="When an account fills up" right={<Toggle on={notifStorage} onChange={setNotifStorage} />} />
          <Row title="Duplicate detection" desc="Notify when duplicates are found" right={<Toggle on={notifDup} onChange={setNotifDup} />} />
          <Row title="Weekly storage report" desc="Email summary every Monday" right={<Toggle on={notifReport} onChange={setNotifReport} />} />
        </Card>
      </div>

      {/* Appearance */}
      <div>
        <SectionLabel>Appearance</SectionLabel>
        <Card className="divide-y divide-border">
          <Row
            title="Dark mode"
            desc="VaultFish is designed for dark mode"
            right={
              <div className="relative flex items-center gap-2" onMouseEnter={() => setShowDarkTip(true)} onMouseLeave={() => setShowDarkTip(false)}>
                <Info size={14} strokeWidth={1.5} style={{ color: "rgba(255,255,255,0.35)" }} />
                <Toggle on={true} onChange={() => setShowDarkTip(true)} disabled />
                {showDarkTip && (
                  <div style={{ position: "absolute", bottom: "calc(100% + 8px)", right: 0, whiteSpace: "nowrap", background: "rgba(18,21,28,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 10px", fontFamily: '"Inter", sans-serif', fontSize: 11, color: "rgba(255,255,255,0.8)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                    VaultFish is designed for dark mode
                  </div>
                )}
              </div>
            }
          />
          <Row title="Compact view" desc="Tighter spacing in lists" right={<Toggle on={prefs.compact_view} onChange={(v) => update({ compact_view: v })} />} />
        </Card>
      </div>

      {/* About */}
      <div>
        <SectionLabel>About</SectionLabel>
        <Card className="divide-y divide-border">
          <Row title="VaultFish" desc="Version 1.0.0 · Built by Talabros Technologies" right={null} />
          <Row title="Privacy Policy" right={<ChevronRight size={16} strokeWidth={1.5} className="text-muted" />} onClick={() => {}} />
          <Row title="Terms of Service" right={<ChevronRight size={16} strokeWidth={1.5} className="text-muted" />} onClick={() => {}} />
          <Row title="Rate the app" right={<ChevronRight size={16} strokeWidth={1.5} style={{ color: "#4d90fe" }} />} onClick={() => {}} />
        </Card>
      </div>

      {/* Sign out */}
      <div className="flex justify-center">
        <button
          onClick={signOut}
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#f87171",
            borderRadius: 10,
            padding: "10px 20px",
            fontFamily: '"Inter", sans-serif',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Sign Out
        </button>
      </div>

      {/* Modals */}
      <Modal
        open={confirm === "encryption"}
        onClose={() => setConfirm(null)}
        title="Enable Encryption"
        footer={
          <>
            <ModalButton onClick={() => setConfirm(null)}>Cancel</ModalButton>
            <ModalButton variant="primary" onClick={() => { update({ encryption_enabled: true }); setConfirm(null); }}>Enable</ModalButton>
          </>
        }
      >
        Files will be encrypted before leaving your device. You will need your password to decrypt.
      </Modal>

      <DisconnectModal
        target={disconnectTarget}
        onClose={() => setDisconnectTarget(null)}
        onConfirm={(id) => handleDisconnect(id)}
      />

      <Modal
        open={clearedNotice}
        onClose={() => setClearedNotice(false)}
        title="Cache cleared"
        footer={<ModalButton variant="primary" onClick={() => setClearedNotice(false)}>OK</ModalButton>}
      >
        Local cache was successfully cleared.
      </Modal>

      <span style={{ display: "none" }} aria-hidden>{Object.keys(PLATFORM_COLORS).length}</span>
    </div>
  );
}
