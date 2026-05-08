import { useState } from "react";
import { Card, SectionTitle, Bar } from "../ui";
import { ACCOUNTS } from "../data";
import { Plus, X, AlertTriangle } from "lucide-react";
import { PlatformIcon, PLATFORM_COLORS } from "../PlatformIcons";

type Modal = { id: string; email: string; gb: number } | null;

export function CloudsScreen() {
  const [modal, setModal] = useState<Modal>(null);
  const [choice, setChoice] = useState<"move"|"copy"|"disconnect">("move");
  const [dest, setDest] = useState("Dropbox");

  const platforms = ["Google Drive", "Dropbox", "OneDrive"];
  const cta = choice === "move" ? `Move & Disconnect` : choice === "copy" ? "Copy & Disconnect" : "Disconnect";

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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Disconnect account?</h3>
            <p className="text-sm text-muted mt-1">{modal.email}</p>
            <div className="mt-4 p-3 rounded-xl bg-[color:var(--color-amber)]/10 border border-[color:var(--color-amber)]/30 flex gap-2 text-sm">
              <AlertTriangle size={18} strokeWidth={1.5} className="text-[color:var(--color-amber)] shrink-0" />
              <span><b>{modal.gb} GB</b> of data on this account. Choose what to do with the files.</span>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { id: "move", t: "Move files", d: "Transfer to another cloud" },
                { id: "copy", t: "Copy files, keep original", d: "Duplicate files elsewhere" },
                { id: "disconnect", t: "Just disconnect", d: "Files stay on the cloud" },
              ].map(o => (
                <label key={o.id} className={`block p-3 rounded-xl border cursor-pointer ${choice === o.id ? "border-[color:var(--accent-blue)] bg-[color:var(--accent-blue)]/10" : "border-border"}`}>
                  <div className="flex items-start gap-3">
                    <input type="radio" name="c" checked={choice === o.id} onChange={() => setChoice(o.id as any)} className="mt-1 accent-[color:var(--accent-blue)]" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{o.t}</div>
                      <div className="text-xs text-muted">{o.d}</div>
                      {o.id === "move" && choice === "move" && (
                        <select value={dest} onChange={e => setDest(e.target.value)} className="mt-2 w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm">
                          <option>Dropbox</option><option>OneDrive</option><option>Google Drive</option>
                        </select>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm">Cancel</button>
              <button onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 rounded-lg bg-[color:var(--accent-blue)] text-white text-sm font-medium">{cta}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
