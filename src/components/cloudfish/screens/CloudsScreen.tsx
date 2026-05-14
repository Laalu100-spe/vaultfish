import { useState } from "react";
import { Card, SectionTitle, Bar } from "../ui";
import { ACCOUNTS } from "../data";
import { Plus, X } from "lucide-react";
import { PlatformIcon, PLATFORM_COLORS } from "../PlatformIcons";
import { DisconnectModal, type DisconnectTarget } from "../DisconnectModal";

export function CloudsScreen() {
  const [modal, setModal] = useState<DisconnectTarget | null>(null);
  const platforms = ["Google Drive", "Dropbox", "OneDrive"];


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
                    <button onClick={() => setModal({ id: a.id, email: a.email, gb: a.used, platform: a.platform })} className="p-2 rounded-lg hover:bg-background text-muted hover:text-foreground">
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

      <DisconnectModal target={modal} onClose={() => setModal(null)} />

    </div>
  );
}
