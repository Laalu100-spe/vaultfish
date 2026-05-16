import { useEffect, useRef, useState } from "react";
import { Card, SectionTitle, Toggle } from "../ui";
import { UploadCloud, Pause, Check } from "lucide-react";
import { PlatformIcon, PLATFORM_COLORS } from "../PlatformIcons";
import { ACCOUNTS } from "../data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

function formatSize(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

type Stage = "idle" | "uploading" | "done";

export function UploadScreen({ autoOpen = false }: { autoOpen?: boolean }) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [smart, setSmart] = useState(true);
  const [enc, setEnc] = useState(false);
  const [fast, setFast] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [pct, setPct] = useState(0);
  const [destination, setDestination] = useState("Smart Split — across all clouds");

  const openPicker = () => fileInputRef.current?.click();

  useEffect(() => {
    if (autoOpen) {
      const t = setTimeout(openPicker, 200);
      return () => clearTimeout(t);
    }
  }, [autoOpen]);

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || list.length === 0) return;
    const arr = Array.from(list);
    setFiles(arr);
    setCurrentIdx(0);
    setPct(0);
    setStage("uploading");
    e.target.value = "";
  };

  // Per-file progress simulation, with auto-advance to next
  useEffect(() => {
    if (stage !== "uploading" || files.length === 0) return;
    setPct(0);
    const id = setInterval(() => {
      setPct((p) => {
        if (p >= 100) return 100;
        return Math.min(100, p + 4);
      });
    }, 60);
    return () => clearInterval(id);
  }, [stage, currentIdx, files.length]);

  useEffect(() => {
    if (stage !== "uploading" || pct < 100) return;
    if (currentIdx < files.length - 1) {
      const t = setTimeout(() => setCurrentIdx((i) => i + 1), 500);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(async () => {
        // Persist uploaded file metadata to Supabase
        if (user && files.length > 0) {
          const rows = files.map((f) => ({
            user_id: user.id,
            file_name: f.name,
            file_size: f.size,
            file_type: f.type || f.name.split(".").pop() || "file",
            cloud_path: `/${destination}/${f.name}`,
            last_modified: new Date(f.lastModified).toISOString(),
          }));
          await supabase.from("file_metadata").insert(rows);
        }
        setStage("done");
      }, 400);
      return () => clearTimeout(t);
    }
  }, [pct, stage, currentIdx, files, user, destination]);

  const reset = () => {
    setStage("idle");
    setFiles([]);
    setCurrentIdx(0);
    setPct(0);
  };

  const hiddenInput = (
    <input
      ref={fileInputRef}
      type="file"
      multiple
      accept="*/*"
      style={{ display: "none" }}
      onChange={onFilesSelected}
    />
  );

  if (stage === "uploading" && files[currentIdx]) {
    const file = files[currentIdx];
    const r = 70;
    const c = 2 * Math.PI * r;
    const off = c - (pct / 100) * c;
    const split = [
      { n: "Google Drive", p: 34 },
      { n: "Dropbox", p: 34 },
      { n: "OneDrive", p: 32 },
    ];
    return (
      <div className="space-y-6">
        {hiddenInput}
        <SectionTitle sub={`File ${currentIdx + 1} of ${files.length}`}>Uploading…</SectionTitle>
        <Card className="p-6">
          <div className="flex justify-between text-sm mb-2 gap-3">
            <span className="font-medium truncate">{file.name}</span>
            <span className="text-muted whitespace-nowrap">{formatSize(file.size)}</span>
          </div>
          <div className="text-xs text-muted mb-4">→ {destination}</div>
          <div className="relative w-44 h-44 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 176 176">
              <circle cx="88" cy="88" r={r} stroke="#2a2d35" strokeWidth="10" fill="none" />
              <circle cx="88" cy="88" r={r} stroke="url(#g)" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 100ms linear" }} />
              <defs><linearGradient id="g"><stop offset="0%" stopColor="#a855f7"/><stop offset="100%" stopColor="#4d90fe"/></linearGradient></defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xs text-muted">Splitting & uploading</div>
              <div className="text-3xl font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>{pct}%</div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="text-xs text-muted">Uploading to</div>
            {split.map((x) => (
              <div key={x.n}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-2">
                    <PlatformIcon name={x.n} size={14} />
                    <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 500, color: PLATFORM_COLORS[x.n] }}>{x.n}</span>
                  </span>
                  <span>{Math.round((pct * x.p) / 100)}%</span>
                </div>
                <div className="h-1.5 bg-background rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(pct * x.p) / 100}%`, background: PLATFORM_COLORS[x.n], transition: "width 100ms linear" }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="text-xs text-muted">{files.length - currentIdx - 1} files remaining</div>
            <button onClick={reset} className="px-4 py-2 rounded-lg border border-border text-sm flex items-center gap-2"><Pause size={18} strokeWidth={1.5}/> Cancel</button>
          </div>
        </Card>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className="space-y-6">
        {hiddenInput}
        <SectionTitle>Upload</SectionTitle>
        <Card className="p-8 flex flex-col items-center text-center">
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Check size={36} strokeWidth={2.5} color="#22c55e" />
          </div>
          <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 18, fontWeight: 700, color: "#fff" }}>Upload complete</div>
          <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
            {files.length} file{files.length === 1 ? "" : "s"} added to your clouds
          </div>
          <div className="w-full mt-6 flex flex-col gap-2">
            <button onClick={reset} className="w-full py-3 rounded-xl bg-[color:var(--accent-blue)] text-white text-sm font-medium">View Files</button>
            <button onClick={() => { reset(); setTimeout(openPicker, 100); }} className="w-full py-3 rounded-xl border border-border text-sm font-medium">Upload More</button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hiddenInput}
      <SectionTitle>Upload Files</SectionTitle>

      <div>
        <div className="text-xs text-muted mb-2">Upload destination</div>
        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          style={{
            width: "100%", background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
            padding: "10px 12px", fontSize: 13, color: "#fff",
            fontFamily: '"Inter", sans-serif',
          }}
        >
          <option style={{ background: "#0e1118" }}>Smart Split — across all clouds</option>
          {ACCOUNTS.map((a) => (
            <option key={a.id} style={{ background: "#0e1118" }}>{a.platform} · {a.email}</option>
          ))}
        </select>
      </div>

      <button
        onClick={openPicker}
        className="w-full"
        style={{ display: "block", textAlign: "left" }}
      >
        <Card className="p-10 border-dashed border-2 flex flex-col items-center text-center cursor-pointer">
          <div className="flex items-center justify-center mb-3" style={{ background: "rgba(77,144,254,0.15)", height: 56, width: 56, borderRadius: 16 }}>
            <UploadCloud size={18} strokeWidth={1.5} className="text-[color:var(--accent-blue)]"/>
          </div>
          <div className="font-medium">Drag & drop files here</div>
          <div className="text-xs text-muted mt-1">or tap to browse</div>
        </Card>
      </button>

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

      <button onClick={openPicker} className="w-full py-3.5 rounded-xl bg-[color:var(--accent-blue)] text-white font-medium flex items-center justify-center gap-2">
        <UploadCloud size={18} strokeWidth={1.5}/> Choose Files
      </button>
    </div>
  );
}
