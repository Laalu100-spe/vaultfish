import { useState } from "react";
import { toast } from "sonner";
import { Card, SectionTitle, Toggle } from "../ui";
import { PlatformIcon } from "../PlatformIcons";
import { Modal, ModalButton } from "../Modal";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePreferences } from "@/context/PreferencesContext";
import { useConnectedAccounts, PLATFORM_LABEL, GB } from "@/hooks/useConnectedAccounts";
import { useFiles, formatBytes, softDeleteFile } from "@/hooks/useFiles";
import { supabase } from "@/integrations/supabase/client";
import { PolicyModal, PRIVACY_SECTIONS, TERMS_SECTIONS } from "../PolicyModal";

const FREE_LIMIT = 5 * 1024 * 1024 * 1024;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="section-label mb-2 px-1">{children}</h2>;
}

function Row({
  title, desc, right, onClick,
}: { title: string; desc?: string; right?: React.ReactNode; onClick?: () => void }) {
  const Comp: any = onClick ? "button" : "div";
  return (
    <Comp onClick={onClick} className="w-full flex items-center justify-between gap-3 text-left" style={{ padding: "14px 16px", overflow: "hidden" }}>
      <div className="min-w-0 flex-1" style={{ overflow: "hidden" }}>
        <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.92)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        {desc && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{desc}</div>}
      </div>
      <div className="shrink-0" style={{ whiteSpace: "nowrap" }}>{right}</div>
    </Comp>
  );
}


export function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { prefs, update } = usePreferences();
  const { accounts } = useConnectedAccounts();
  const { files } = useFiles();

  const [policy, setPolicy] = useState<"privacy" | "terms" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const avatar = (user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture) as string | undefined;
  const displayName = (user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? "VaultFish user") as string;
  const email = user?.email ?? "";

  const totalBytes = files.reduce((s, f) => s + Number(f.file_size), 0);
  const pct = Math.min(100, Math.round((totalBytes / FREE_LIMIT) * 100));

  const requestNotifications = async () => {
    if (typeof Notification === "undefined") return toast.error("Notifications not supported");
    const r = await Notification.requestPermission();
    if (r === "granted") toast.success("Notifications enabled");
    else toast.error("Permission denied");
  };

  const deleteAccount = async () => {
    if (!user) return;
    setConfirmDelete(false);
    try {
      // remove all storage
      const { data: list } = await supabase.storage.from("user-files").list(user.id, { limit: 1000 });
      if (list && list.length > 0) {
        await supabase.storage.from("user-files").remove(list.map((o) => `${user.id}/${o.name}`));
      }
      // soft-delete file rows (also flags them out of realtime)
      await Promise.all(files.map((f) => softDeleteFile(f.id, f.storage_path)));
      await supabase.from("user_preferences").delete().eq("user_id", user.id);
      await supabase.from("connected_accounts").delete().eq("user_id", user.id);
      toast.success("Account data deleted");
      await signOut();
    } catch (e: any) {
      toast.error(e?.message ?? "Deletion failed");
    }
  };

  return (
    <div className="space-y-7">
      <SectionTitle>Settings</SectionTitle>

      <Card className="p-4 flex items-center gap-3">
        {avatar ? (
          <img src={avatar} alt={displayName} width={48} height={48} style={{ width: 48, height: 48, borderRadius: 999, objectFit: "cover", border: "2px solid rgba(77,144,254,0.3)" }} />
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: 999, background: "rgba(77,144,254,0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4d90fe", fontWeight: 700 }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{displayName}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{email}</div>
        </div>
      </Card>

      <div>
        <SectionLabel>Storage</SectionLabel>
        <Card className="p-4">
          <div className="flex justify-between text-sm mb-2">
            <span style={{ color: "rgba(255,255,255,0.7)" }}>{formatBytes(totalBytes)} of 5 GB used</span>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>{pct}%</span>
          </div>
          <div className="w-full" style={{ background: "rgba(255,255,255,0.06)", height: 6, borderRadius: 999 }}>
            <div style={{ width: `${pct}%`, height: 6, borderRadius: 999, background: "linear-gradient(90deg,#a78bfa,#4d90fe,#2dd4bf)" }} />
          </div>
        </Card>
      </div>

      {accounts.length > 0 && (
        <div>
          <SectionLabel>Connected Accounts</SectionLabel>
          <Card className="divide-y divide-border">
            {accounts.map((a) => {
              const label = PLATFORM_LABEL[a.platform];
              return (
                <Row
                  key={a.id}
                  title={label}
                  desc={a.email}
                  right={
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                      {Math.round(Number(a.storage_used) / GB)}/{Math.round(Number(a.storage_total) / GB)} GB
                    </span>
                  }
                />
              );
            })}
          </Card>
        </div>
      )}

      <div>
        <SectionLabel>Preferences</SectionLabel>
        <Card className="divide-y divide-border">
          <Row title="Auto Optimize" desc="Distribute uploads automatically" right={<Toggle on={prefs.auto_optimize} onChange={(v) => { update({ auto_optimize: v }); toast.success(v ? "Auto backup enabled" : "Auto backup disabled"); }} />} />
          <Row title="Smart Split" desc="Split large files across clouds" right={<Toggle on={prefs.smart_split} onChange={(v) => update({ smart_split: v })} />} />
          <Row title="Encryption" desc="End-to-end encryption for uploads" right={<Toggle on={prefs.encryption_enabled} onChange={(v) => { update({ encryption_enabled: v }); if (v) toast.success("Encryption enabled — your files are protected"); }} />} />
          <Row title="Notifications" desc="Get alerts about your storage" right={<Toggle on={false} onChange={requestNotifications} />} />
          <Row title="Compact view" desc="Tighter spacing in lists" right={<Toggle on={prefs.compact_view} onChange={(v) => update({ compact_view: v })} />} />
        </Card>
      </div>

      <div>
        <SectionLabel>About</SectionLabel>
        <Card className="divide-y divide-border">
          <Row title="VaultFish" desc="Version 1.0.0 · Talabros Technologies" />
          <Row title="Privacy Policy" right={<ChevronRight size={16} className="text-muted" />} onClick={() => setPolicy("privacy")} />
          <Row title="Terms of Service" right={<ChevronRight size={16} className="text-muted" />} onClick={() => setPolicy("terms")} />
        </Card>
      </div>

      <button
        onClick={signOut}
        className="w-full"
        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: 10, padding: "12px 24px", fontSize: 13, fontWeight: 600 }}
      >
        Sign Out of VaultFish
      </button>

      <button
        onClick={() => setConfirmDelete(true)}
        className="w-full"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", borderRadius: 8, padding: "8px", fontSize: 11 }}
      >
        Delete Account
      </button>

      {policy === "privacy" && (
        <PolicyModal title="Privacy Policy" subtitle="Last updated July 2026 · Talabros Technologies Pvt. Ltd." sections={PRIVACY_SECTIONS} onClose={() => setPolicy(null)} />
      )}
      {policy === "terms" && (
        <PolicyModal title="Terms of Service" subtitle="Last updated July 2026 · Talabros Technologies Pvt. Ltd." sections={TERMS_SECTIONS} onClose={() => setPolicy(null)} />
      )}

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete your account?"
        footer={
          <>
            <ModalButton onClick={() => setConfirmDelete(false)}>Cancel</ModalButton>
            <ModalButton variant="danger" onClick={deleteAccount}>Delete forever</ModalButton>
          </>
        }
      >
        This permanently removes all your files from VaultFish storage and clears your preferences. This cannot be undone.
      </Modal>

      <span style={{ display: "none" }} aria-hidden>
        <PlatformIcon name="Dropbox" size={0} />
      </span>
    </div>
  );
}
