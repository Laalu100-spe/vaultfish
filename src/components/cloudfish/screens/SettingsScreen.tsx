import { useState } from "react";
import { Card, SectionTitle, Toggle } from "../ui";
import { ACCOUNTS } from "../data";
import { ChevronRight } from "lucide-react";

export function SettingsScreen() {
  const [opt, setOpt] = useState(true);
  return (
    <div className="space-y-6">
      <SectionTitle>Settings</SectionTitle>

      <div>
        <h2 className="text-xs uppercase tracking-wider text-muted mb-2">Accounts</h2>
        <Card className="divide-y divide-border">
          {ACCOUNTS.map(a => (
            <div key={a.id} className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full text-white text-xs font-semibold flex items-center justify-center" style={{ background: a.color }}>{a.platform[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{a.platform}</div>
                <div className="text-xs text-muted truncate">{a.email}</div>
              </div>
              <div className="text-xs text-muted">{a.used}/{a.total} GB</div>
              <ChevronRight className="h-4 w-4 text-muted"/>
            </div>
          ))}
          <button className="w-full p-4 text-sm text-[color:var(--accent-blue)] text-left">+ Add Another Cloud</button>
        </Card>
      </div>

      <div>
        <h2 className="text-xs uppercase tracking-wider text-muted mb-2">Preferences</h2>
        <Card className="divide-y divide-border">
          <div className="p-4 flex items-center justify-between">
            <div><div className="text-sm font-medium">Auto Optimize</div><div className="text-xs text-muted">Distribute uploads automatically</div></div>
            <Toggle on={opt} onChange={setOpt}/>
          </div>
          {[
            { l: "Cache Management", d: "Clear local cache" },
            { l: "Security & Encryption", d: "Manage encryption keys" },
          ].map(r => (
            <button key={r.l} className="w-full p-4 flex items-center justify-between text-left hover:bg-background/50">
              <div><div className="text-sm font-medium">{r.l}</div><div className="text-xs text-muted">{r.d}</div></div>
              <ChevronRight className="h-4 w-4 text-muted"/>
            </button>
          ))}
        </Card>
      </div>

      <div>
        <h2 className="text-xs uppercase tracking-wider text-muted mb-2">Theme</h2>
        <Card className="p-4 flex items-center justify-between">
          <div><div className="text-sm font-medium">Dark Mode</div><div className="text-xs text-muted">Always on for premium experience</div></div>
          <Toggle on={true} onChange={() => {}}/>
        </Card>
      </div>
    </div>
  );
}
