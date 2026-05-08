import { useEffect, useState } from "react";
import { Card, SectionTitle, Toggle } from "../ui";
import { UploadCloud, Pause } from "lucide-react";

export function UploadScreen() {
  const [stage, setStage] = useState<"idle"|"uploading">("idle");
  const [smart, setSmart] = useState(true);
  const [enc, setEnc] = useState(false);
  const [fast, setFast] = useState(true);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (stage !== "uploading") return;
    setPct(0);
    const id = setInterval(() => setPct(p => (p < 68 ? p + 2 : 68)), 80);
    return () => clearInterval(id);
  }, [stage]);

  if (stage === "uploading") {
    const r = 70, c = 2 * Math.PI * r, off = c - (pct / 100) * c;
    return (
      <div className="space-y-6">
        <SectionTitle>Uploading…</SectionTitle>
        <Card className="p-6">
          <div className="flex justify-between text-sm mb-6"><span className="font-medium">Vacation Video.mp4</span><span className="text-muted">6.8 GB</span></div>
          <div className="relative w-44 h-44 mx-auto">
            <svg className="w-full h-full -rotate-90">
              <circle cx="88" cy="88" r={r} stroke="#2a2d35" strokeWidth="10" fill="none" />
              <circle cx="88" cy="88" r={r} stroke="url(#g)" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
              <defs><linearGradient id="g"><stop offset="0%" stopColor="#a855f7"/><stop offset="100%" stopColor="#4d90fe"/></linearGradient></defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xs text-muted">Splitting & uploading</div>
              <div className="text-3xl font-semibold">{pct}%</div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="text-xs text-muted">Uploading to</div>
            {[
              { n: "Google Drive", p: 34, c: "#4285f4" },
              { n: "Dropbox", p: 34, c: "#ec4899" },
              { n: "OneDrive", p: 32, c: "#14b8a6" },
            ].map(x => (
              <div key={x.n}>
                <div className="flex justify-between text-xs mb-1"><span>{x.n} <span className="text-muted">2.3 GB / 6.8 GB</span></span><span>{x.p}%</span></div>
                <div className="h-1.5 bg-background rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${x.p}%`, background: x.c }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="text-xs text-muted">Time left: <b className="text-foreground">2m 15s</b></div>
            <button onClick={() => setStage("idle")} className="px-4 py-2 rounded-lg border border-border text-sm flex items-center gap-2"><Pause size={18} strokeWidth={1.5}/> Pause</button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle>Upload Files</SectionTitle>
      <Card className="p-10 border-dashed border-2 flex flex-col items-center text-center">
        <div className="flex items-center justify-center mb-3" style={{ background: "rgba(77,144,254,0.15)", height: 56, width: 56, borderRadius: 16 }}><UploadCloud size={18} strokeWidth={1.5} className="text-[color:var(--accent-blue)]" style={{ width: 28, height: 28 }}/></div>
        <div className="font-medium">Drag & drop files here</div>
        <div className="text-xs text-muted mt-1">or tap to browse</div>
      </Card>
      <Card className="divide-y divide-border">
        {[
          { l: "Smart Optimize", d: "Automatically split and store across clouds", v: smart, set: setSmart },
          { l: "Encrypt File", d: "End-to-end encryption", v: enc, set: setEnc },
          { l: "Fast Upload", d: "Use multi-threaded upload", v: fast, set: setFast },
        ].map(o => (
          <div key={o.l} className="flex items-center justify-between p-4">
            <div><div className="text-sm font-medium">{o.l}</div><div className="text-xs text-muted">{o.d}</div></div>
            <Toggle on={o.v} onChange={o.set} />
          </div>
        ))}
      </Card>
      <button onClick={() => setStage("uploading")} className="w-full py-3.5 rounded-xl bg-[color:var(--accent-blue)] text-white font-medium flex items-center justify-center gap-2">
        <UploadCloud className="h-4 w-4"/> Start Upload
      </button>
    </div>
  );
}
