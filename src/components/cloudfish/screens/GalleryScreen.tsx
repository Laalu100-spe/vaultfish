import { useState } from "react";
import { SectionTitle, Pill } from "../ui";
import { Cloud, Play } from "lucide-react";

const GRADS = [
  "linear-gradient(135deg,#1e3a8a,#0ea5e9)",
  "linear-gradient(135deg,#831843,#f43f5e)",
  "linear-gradient(135deg,#365314,#84cc16)",
  "linear-gradient(135deg,#7c2d12,#f59e0b)",
  "linear-gradient(135deg,#0f766e,#22d3ee)",
  "linear-gradient(135deg,#581c87,#c084fc)",
  "linear-gradient(135deg,#7c1d6f,#ec4899)",
  "linear-gradient(135deg,#1e293b,#475569)",
  "linear-gradient(135deg,#0c4a6e,#06b6d4)",
  "linear-gradient(135deg,#9a3412,#fb923c)",
  "linear-gradient(135deg,#064e3b,#10b981)",
  "linear-gradient(135deg,#3b0764,#a855f7)",
];

const ITEMS = GRADS.map((g, i) => ({
  g, video: i % 4 === 1, dur: ["0:12","0:38","0:28","1:05"][i % 4], h: 120 + (i % 3) * 50,
}));

export function GalleryScreen() {
  const [tab, setTab] = useState<"all"|"photos"|"videos">("all");
  const [time, setTime] = useState<"Years"|"Months"|"Days">("Days");
  const visible = ITEMS.filter(x => tab === "all" || (tab === "videos" ? x.video : !x.video));

  return (
    <div className="space-y-5">
      <SectionTitle>Gallery</SectionTitle>
      <div className="flex gap-2">
        {(["all","photos","videos"] as const).map(t => <Pill key={t} active={tab===t} onClick={() => setTab(t)}>{t[0].toUpperCase()+t.slice(1)}</Pill>)}
      </div>
      <div className="flex gap-2 text-xs">
        <select className="bg-card border border-border rounded-lg px-3 py-1.5"><option>All Clouds</option><option>Google Drive</option><option>Dropbox</option></select>
        <select className="bg-card border border-border rounded-lg px-3 py-1.5"><option>Recent</option><option>Oldest</option></select>
      </div>
      <div className="columns-2 md:columns-3 gap-3 [column-fill:_balance]">
        {visible.map((it, i) => (
          <div key={i} className="mb-3 break-inside-avoid relative rounded-xl overflow-hidden border border-border" style={{ background: it.g, height: it.h }}>
            <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-black/40 backdrop-blur flex items-center justify-center"><Cloud size={12} strokeWidth={1.5} className="text-white" /></div>
            {it.video && (
              <>
                <div className="absolute inset-0 flex items-center justify-center"><div className="h-10 w-10 rounded-full bg-black/40 flex items-center justify-center"><Play size={18} strokeWidth={1.5} className="text-white" /></div></div>
                <div className="absolute bottom-2 right-2 text-[10px] font-medium text-white bg-black/50 px-1.5 py-0.5 rounded">{it.dur}</div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="sticky bottom-20 md:bottom-4 bg-card border border-border rounded-full p-1 flex gap-1 mx-auto w-fit">
        {(["Years","Months","Days"] as const).map(t => (
          <button key={t} onClick={() => setTime(t)} className={`px-4 py-1.5 rounded-full text-xs ${time===t ? "bg-[color:var(--accent-blue)] text-white" : "text-muted"}`}>{t}</button>
        ))}
      </div>
    </div>
  );
}
