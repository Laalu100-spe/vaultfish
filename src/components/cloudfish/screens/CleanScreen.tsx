import { useState } from "react";
import { Card, SectionTitle } from "../ui";
import { Copy, Video, Clock, Image as ImageIcon, ChevronDown, Check, Sparkles } from "lucide-react";

const CATS = [
  { id: "dup", t: "Duplicate Photos", n: "1,247 files", s: "7.4 GB", i: Copy, c: "#a855f7", files: ["IMG_2341.jpg","IMG_2341 (1).jpg","Beach_2024.png","Beach_2024 (copy).png"] },
  { id: "vid", t: "Large Videos", n: "18 files", s: "4.6 GB", i: Video, c: "#f59e0b", files: ["Vacation.mp4 — 1.8 GB","Wedding.mov — 1.2 GB","Trip.mp4 — 800 MB"] },
  { id: "old", t: "Old Files (not opened > 1 year)", n: "326 files", s: "2.1 GB", i: Clock, c: "#14b8a6", files: ["TaxReturn_2022.pdf","Old_Resume.docx","Archive_2021.zip"] },
  { id: "ss", t: "Screenshots", n: "892 files", s: "1.2 GB", i: ImageIcon, c: "#22c55e", files: ["Screenshot 2025-03-12.png","Screenshot 2025-03-13.png","Screenshot 2025-03-14.png"] },
];

export function CleanScreen() {
  const [open, setOpen] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="h-20 w-20 rounded-full gradient-brand flex items-center justify-center mb-4 animate-pulse">
          <Check className="h-10 w-10 text-white"/>
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
        <div className="h-12 w-12 rounded-xl gradient-brand flex items-center justify-center"><Sparkles className="h-6 w-6 text-white"/></div>
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
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${cat.c}25` }}>
                  <I className="h-5 w-5" style={{ color: cat.c }}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{cat.t}</div>
                  <div className="text-xs text-muted">{cat.n} • {cat.s}</div>
                </div>
                <button onClick={() => setOpen(isOpen ? null : cat.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs flex items-center gap-1">
                  Review <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}/>
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
      <button onClick={() => setDone(true)} className="w-full py-3.5 rounded-xl gradient-brand text-white font-semibold">Clean All · 12.3 GB</button>
    </div>
  );
}
