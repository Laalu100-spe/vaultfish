import { Card } from "../ui";
import { ArrowUpFromLine, ScanLine, GitMerge, LayoutDashboard, Sparkles, UploadCloud } from "lucide-react";
import { PlatformIcon, PLATFORM_COLORS } from "../PlatformIcons";
import { useConnectedAccounts, PLATFORM_LABEL, GB } from "@/hooks/useConnectedAccounts";
import { useFiles, categorizeFile, formatBytes } from "@/hooks/useFiles";

const FREE_LIMIT_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB free tier

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="section-label" style={{ marginBottom: 12 }}>{children}</h2>;
}

export function HomeScreen({ onNav }: { onNav: (s: any) => void }) {
  const { accounts: connected } = useConnectedAccounts();
  const { files, loading } = useFiles();

  const totalBytes = files.reduce((s, f) => s + Number(f.file_size ?? 0), 0);
  const pct = Math.min(100, Math.round((totalBytes / FREE_LIMIT_BYTES) * 100));

  // Cleanable estimate: screenshots + files > 100MB + duplicates by name
  const nameGroups = new Map<string, number>();
  files.forEach((f) => nameGroups.set(f.file_name, (nameGroups.get(f.file_name) ?? 0) + 1));
  const dupBytes = files.filter((f) => (nameGroups.get(f.file_name) ?? 0) > 1).reduce((s, f) => s + Number(f.file_size), 0);
  const largeBytes = files.filter((f) => Number(f.file_size) > 100 * 1024 * 1024).reduce((s, f) => s + Number(f.file_size), 0);
  const cleanableBytes = Math.max(0, dupBytes + largeBytes);

  const platformAccounts = (["google_drive", "dropbox", "onedrive"] as const)
    .map((key) => {
      const list = connected.filter((a) => a.platform === key);
      if (list.length === 0) return null;
      const used = list.reduce((s, a) => s + Number(a.storage_used), 0);
      const total = list.reduce((s, a) => s + Number(a.storage_total), 0);
      return { name: PLATFORM_LABEL[key], used, total };
    })
    .filter(Boolean) as { name: string; used: number; total: number }[];

  const quickActions = [
    { i: ArrowUpFromLine, l: "Upload", to: "upload", color: "#4d90fe", bg: "rgba(77,144,254,0.12)" },
    { i: ScanLine, l: "Browse Files", to: "files", color: "#a78bfa", bg: "rgba(139,92,246,0.12)" },
    { i: GitMerge, l: "Smart Clean", to: "clean", color: "#f87171", bg: "rgba(239,68,68,0.12)" },
    { i: LayoutDashboard, l: "Analytics", to: "analytics", color: "#2dd4bf", bg: "rgba(20,184,166,0.12)" },
  ];

  return (
    <div className="flex flex-col" style={{ gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: '"Inter", sans-serif', fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em" }}>VaultFish</h1>
        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
          Your private multi-cloud vault
        </p>
      </div>

      <Card className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top left, rgba(77,144,254,0.12), transparent 60%)" }} />
        <div className="relative" style={{ padding: "22px 24px" }}>
          <div className="section-label">Storage Used</div>
          <div className="mt-2 flex items-baseline gap-2 leading-none">
            <span style={{ fontFamily: '"Inter Tight", "Inter", sans-serif', fontSize: 64, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
              {loading ? "—" : formatBytes(totalBytes).split(" ")[0]}
            </span>
            <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 16, fontWeight: 300, color: "rgba(255,255,255,0.4)" }}>
              {loading ? "" : formatBytes(totalBytes).split(" ")[1]}
            </span>
            <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>
              / 5 GB free
            </span>
          </div>
          <div className="relative w-full mt-4" style={{ background: "rgba(255,255,255,0.06)", height: 4, borderRadius: 999 }}>
            <div style={{ width: `${pct}%`, height: 4, borderRadius: 999, background: "linear-gradient(90deg,#a78bfa,#4d90fe,#2dd4bf)" }} />
          </div>
          <div className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.4)", fontVariantNumeric: "tabular-nums" }}>{pct}% used · {files.length} files</div>

          {platformAccounts.length > 0 && (
            <div className="mt-5 space-y-3">
              {platformAccounts.map((a) => {
                const p = a.total > 0 ? Math.round((a.used / a.total) * 100) : 0;
                return (
                  <div key={a.name}>
                    <div className="flex justify-between mb-1.5">
                      <span className="flex items-center gap-2">
                        <PlatformIcon name={a.name} size={16} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: PLATFORM_COLORS[a.name] }}>{a.name}</span>
                      </span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                        {Math.round(a.used / GB)} / {Math.round(a.total / GB)} GB
                      </span>
                    </div>
                    <div className="w-full" style={{ background: "rgba(255,255,255,0.06)", height: 4, borderRadius: 999 }}>
                      <div style={{ width: `${p}%`, height: 4, borderRadius: 999, background: PLATFORM_COLORS[a.name] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {cleanableBytes > 0 && (
        <div
          className="flex items-center justify-between gap-4"
          style={{
            background: "linear-gradient(135deg, rgba(77,144,254,0.15), rgba(124,58,237,0.10))",
            border: "1px solid rgba(77,144,254,0.25)",
            borderRadius: 16, padding: "18px 20px",
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center shrink-0" style={{ background: "rgba(77,144,254,0.18)", height: 40, width: 40, borderRadius: 10 }}>
              <Sparkles size={18} strokeWidth={1.5} style={{ color: "#4d90fe" }} />
            </div>
            <div className="min-w-0">
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                You can free up <b style={{ fontVariantNumeric: "tabular-nums" }}>{formatBytes(cleanableBytes)}</b>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Duplicates and large files detected</div>
            </div>
          </div>
          <button onClick={() => onNav("clean")} className="shrink-0 text-white" style={{ background: "#4d90fe", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>
            Smart Clean
          </button>
        </div>
      )}

      {!loading && files.length === 0 && (
        <div className="flex flex-col items-center text-center py-10">
          <div style={{ width: 68, height: 68, borderRadius: 999, background: "rgba(77,144,254,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UploadCloud size={28} color="#4d90fe" strokeWidth={1.5} />
          </div>
          <div style={{ marginTop: 14, fontSize: 15, fontWeight: 600, color: "#fff" }}>Your vault is empty</div>
          <div style={{ marginTop: 4, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Upload files to start organizing your clouds</div>
          <button onClick={() => onNav("upload")} className="mt-4 px-5 py-2.5 rounded-lg text-white text-sm font-semibold" style={{ background: "#4d90fe" }}>
            Upload files
          </button>
        </div>
      )}

      <div>
        <SectionLabel>Quick Actions</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((a) => {
            const I = a.i;
            return (
              <button
                key={a.l}
                onClick={() => onNav(a.to)}
                className="vf-quick-action flex flex-col items-center gap-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="vf-quick-action-icon flex items-center justify-center" style={{ background: a.bg, borderRadius: 999 }}>
                  <I className="vf-quick-action-glyph" strokeWidth={1.5} style={{ color: a.color }} />
                </div>
                <span className="vf-quick-action-label" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>{a.l}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
