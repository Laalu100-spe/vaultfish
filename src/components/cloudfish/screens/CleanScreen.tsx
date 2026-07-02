import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SectionTitle } from "../ui";
import { Check, ChevronDown, Trash2 } from "lucide-react";
import { useFiles, softDeleteFile, formatBytes, type FileRow } from "@/hooks/useFiles";

type Category = { id: string; title: string; color: string; files: FileRow[] };

export function CleanScreen() {
  const { files, loading } = useFiles();
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [cleaning, setCleaning] = useState(false);

  const cats: Category[] = useMemo(() => {
    const large = files.filter((f) => Number(f.file_size) > 100 * 1024 * 1024);
    const screenshots = files.filter((f) => /screenshot/i.test(f.file_name));
    const sixMonths = Date.now() - 1000 * 60 * 60 * 24 * 180;
    const old = files.filter((f) => new Date(f.created_at).getTime() < sixMonths);
    const nameCount = new Map<string, number>();
    files.forEach((f) => nameCount.set(f.file_name, (nameCount.get(f.file_name) ?? 0) + 1));
    const dupes = files.filter((f) => (nameCount.get(f.file_name) ?? 0) > 1);
    return [
      { id: "dup", title: "Duplicate files", color: "#a78bfa", files: dupes },
      { id: "large", title: "Large files (>100 MB)", color: "#fb923c", files: large },
      { id: "old", title: "Old files (>6 months)", color: "#facc15", files: old },
      { id: "ss", title: "Screenshots", color: "#4d90fe", files: screenshots },
    ].filter((c) => c.files.length > 0);
  }, [files]);

  const totalCleanable = cats.reduce((s, c) => s + c.files.reduce((a, f) => a + Number(f.file_size), 0), 0);
  const selectedBytes = useMemo(() => {
    let b = 0;
    for (const c of cats) for (const f of c.files) if (checked.has(f.id)) b += Number(f.file_size);
    return b;
  }, [cats, checked]);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const cleanSelected = async () => {
    if (checked.size === 0) return toast.error("Select files to clean");
    setCleaning(true);
    const targets: FileRow[] = [];
    for (const c of cats) for (const f of c.files) if (checked.has(f.id)) targets.push(f);
    const freed = targets.reduce((s, f) => s + Number(f.file_size), 0);
    await Promise.all(targets.map((f) => softDeleteFile(f.id, f.storage_path)));
    setChecked(new Set());
    setCleaning(false);
    toast.success(`Cleaned ${formatBytes(freed)}`);
  };

  if (loading) return <div className="text-muted text-sm">Loading…</div>;

  if (files.length === 0 || cats.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
        <div style={{ fontSize: 44 }}>🐟</div>
        <div style={{ marginTop: 12, fontSize: 18, fontWeight: 700, color: "#fff" }}>Your storage is clean</div>
        <div style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Nothing to reclaim right now.</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SectionTitle>Smart Clean</SectionTitle>

      <div
        className="flex items-center gap-4"
        style={{
          background: "linear-gradient(135deg, rgba(8,12,28,0.95), rgba(12,16,36,0.95))",
          border: "1px solid rgba(77,144,254,0.15)",
          borderRadius: 16, padding: "24px 28px",
        }}
      >
        <div className="flex-1">
          <div style={{ fontFamily: '"Inter Tight", "Inter", sans-serif', fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
            {formatBytes(totalCleanable)} to reclaim
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Across {cats.length} categories</div>
        </div>
      </div>

      <div className="space-y-2">
        {cats.map((cat) => {
          const isOpen = openCat === cat.id;
          const catBytes = cat.files.reduce((s, f) => s + Number(f.file_size), 0);
          return (
            <div
              key={cat.id}
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}
            >
              <button
                onClick={() => setOpenCat(isOpen ? null : cat.id)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <span style={{ width: 8, height: 8, borderRadius: 999, background: cat.color }} />
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{cat.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {cat.files.length} files · {formatBytes(catBytes)}
                  </div>
                </div>
                <ChevronDown size={16} className={isOpen ? "rotate-180" : ""} style={{ transition: "transform 200ms" }} />
              </button>
              {isOpen && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: 8 }}>
                  {cat.files.map((f) => {
                    const isChecked = checked.has(f.id);
                    return (
                      <div key={f.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: isChecked ? "rgba(77,144,254,0.06)" : "transparent" }}>
                        <button onClick={() => toggle(f.id)} style={{ width: 22, height: 22, borderRadius: 999, border: isChecked ? "none" : "2px solid rgba(255,255,255,0.35)", background: isChecked ? "#4d90fe" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {isChecked && <Check size={12} color="#fff" strokeWidth={3} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.file_name}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{formatBytes(Number(f.file_size))}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={cleanSelected}
        disabled={cleaning || checked.size === 0}
        className="w-full flex items-center justify-center gap-2 rounded-xl text-white font-semibold"
        style={{ background: checked.size === 0 ? "rgba(255,255,255,0.06)" : "#ef4444", padding: "14px", fontSize: 14, opacity: cleaning ? 0.6 : 1 }}
      >
        <Trash2 size={16} /> Clean Selected · {formatBytes(selectedBytes)}
      </button>
    </div>
  );
}
