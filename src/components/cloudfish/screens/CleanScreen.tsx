import { useState } from "react";
import { Card, SectionTitle } from "../ui";
import { Copy, FileVideo, Archive, Image as ImageIcon, ChevronDown, Check, Sparkles } from "lucide-react";

const CATS = [
  { id: "dup", t: "Duplicate Photos", n: "1,247 files", s: "7.4 GB", i: Copy, c: "#a78bfa", bg: "rgba(139,92,246,0.12)", files: ["IMG_2341.jpg","IMG_2341 (1).jpg","Beach_2024.png","Beach_2024 (copy).png"] },
  { id: "vid", t: "Large Videos", n: "18 files", s: "4.6 GB", i: FileVideo, c: "#fb923c", bg: "rgba(251,146,60,0.12)", files: ["Vacation.mp4 — 1.8 GB","Wedding.mov — 1.2 GB","Trip.mp4 — 800 MB"] },
  { id: "old", t: "Old Files (not opened > 1 year)", n: "326 files", s: "2.1 GB", i: Archive, c: "#facc15", bg: "rgba(250,204,21,0.12)", files: ["TaxReturn_2022.pdf","Old_Resume.docx","Archive_2021.zip"] },
  { id: "ss", t: "Screenshots", n: "892 files", s: "1.2 GB", i: ImageIcon, c: "#4d90fe", bg: "rgba(77,144,254,0.12)", files: ["Screenshot 2025-03-12.png","Screenshot 2025-03-13.png","Screenshot 2025-03-14.png"] },
];

export function CleanScreen() {
  const [open, setOpen] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div
          className="h-20 w-20 rounded-full flex items-center justify-center mb-4 animate-pulse"
          style={{ background: "linear-gradient(135deg, #4d90fe 0%, #6366f1 100%)" }}
        >
          <Check size={32} strokeWidth={1.5} className="text-white" />
        </div>
        <h2 className="text-2xl font-semibold">All cleaned up!</h2>
        <p className="text-muted mt-2">Freed 12.3 GB across your clouds.</p>
        <button onClick={() => setDone(false)} className="mt-6 px-5 py-2.5 rounded-lg border border-border text-sm">Done</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SectionTitle>Smart Clean</SectionTitle>
      <Card className="p-5 flex items-center gap-4">
        <div
          className="flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #4d90fe 0%, #6366f1 100%)", height: 44, width: 44, borderRadius: 12 }}
        >
          <Sparkles size={18} strokeWidth={1.5} className="text-white" />
        </div>
        <div>
          <div className="font-medium">We found 12.3 GB of items you can clean</div>
          <div className="text-xs text-muted">Across all your connected accounts</div>
        </div>
      </Card>
      <div className="space-y-2">
        {CATS.map(cat => {
          const I = cat.i;
          const isOpen = open === cat.id;
          return (
            <Card key={cat.id} className="overflow-hidden">
              <div className="p-4 flex items-center gap-3">
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{ background: cat.bg, height: 40, width: 40, borderRadius: 10 }}
                >
                  <I size={18} strokeWidth={1.5} style={{ color: cat.c }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{cat.t}</div>
                  <div className="text-xs text-muted">{cat.n} • {cat.s}</div>
                </div>
                <button
                  onClick={() => setOpen(isOpen ? null : cat.id)}
                  className="flex items-center gap-1.5 transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 999,
                    padding: "6px 14px",
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: 12,
                    color: "#9ca3af",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(77,144,254,0.10)";
                    e.currentTarget.style.borderColor = "rgba(77,144,254,0.3)";
                    e.currentTarget.style.color = "#4d90fe";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#9ca3af";
                  }}
                >
                  Review
                  <ChevronDown
                    size={18}
                    strokeWidth={1.5}
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
              {isOpen && (
                <div className="border-t border-border p-3 space-y-1.5">
                  {cat.files.map(f => (
                    <div key={f} className="text-xs px-3 py-2 bg-background rounded-lg flex justify-between">
                      <span>{f}</span><input type="checkbox" defaultChecked className="accent-[color:var(--accent-blue)]"/>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
      <button
        onClick={() => setDone(true)}
        className="w-full text-white"
        style={{
          background: "linear-gradient(135deg, #4d90fe 0%, #6366f1 100%)",
          borderRadius: 14,
          height: 52,
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "0.01em",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 24px rgba(77,144,254,0.35)",
        }}
      >
        Clean All · 12.3 GB
      </button>
    </div>
  );
}
