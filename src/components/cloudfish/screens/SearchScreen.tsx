import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Search, ScanText, Loader2, FileText } from "lucide-react";
import { SectionTitle } from "../ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useFiles, formatBytes, timeAgo, PROVIDER_LABEL, type FileRow } from "@/hooks/useFiles";
import { indexFileText } from "@/lib/vault.functions";

type Hit = { file: FileRow; snippet: string | null };

export function SearchScreen() {
  const { user } = useAuth();
  const { files } = useFiles();
  const runIndex = useServerFn(indexFileText);
  const [q, setQ] = useState("");
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [indexed, setIndexed] = useState<Set<string>>(new Set());
  const [indexing, setIndexing] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase
      .from("file_text_index")
      .select("file_id,content,status")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!active || !data) return;
        const map: Record<string, string> = {};
        const seen = new Set<string>();
        data.forEach((r) => { map[r.file_id] = r.content ?? ""; seen.add(r.file_id); });
        setTexts(map);
        setIndexed(seen);
      });
    return () => { active = false; };
  }, [user, indexing]);

  const pending = useMemo(
    () => files.filter((f) => (f.file_type ?? "").startsWith("image/") && f.storage_path && !indexed.has(f.id)),
    [files, indexed],
  );

  const hits: Hit[] = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return files
      .map((f) => {
        const nameHit = f.filename.toLowerCase().includes(term);
        const content = texts[f.id] ?? "";
        const idx = content.toLowerCase().indexOf(term);
        if (!nameHit && idx < 0) return null;
        const snippet = idx >= 0 ? `…${content.slice(Math.max(0, idx - 50), idx + 90).replace(/\s+/g, " ")}…` : null;
        return { file: f, snippet };
      })
      .filter(Boolean) as Hit[];
  }, [q, files, texts]);

  const indexAll = async () => {
    setError(null);
    const list = pending.slice(0, 25);
    setIndexing({ done: 0, total: list.length });
    for (let i = 0; i < list.length; i++) {
      try {
        await runIndex({ data: { fileId: list[i].id } });
      } catch (e: any) {
        setError(e?.message ?? "Indexing failed");
        break;
      }
      setIndexing({ done: i + 1, total: list.length });
    }
    setIndexing(null);
  };

  return (
    <div className="flex flex-col" style={{ gap: 18 }}>
      <SectionTitle sub="Searches file names and text inside images — across all your connected clouds">
        Smart Search
      </SectionTitle>

      <div className="flex items-center gap-2" style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
        <Search size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search names and content…"
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "rgba(255,255,255,0.9)", fontSize: 13.5 }}
        />
      </div>

      <div className="flex items-center justify-between gap-3" style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.22)" }}>
        <div className="min-w-0">
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "rgba(255,255,255,0.88)" }}>Content indexing (OCR)</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            {indexed.size} indexed · {pending.length} images waiting
          </div>
        </div>
        <button
          onClick={indexAll}
          disabled={!!indexing || pending.length === 0}
          className="flex items-center gap-2 shrink-0"
          style={{ padding: "10px 14px", borderRadius: 10, background: "#0d9488", color: "#fff", fontSize: 12.5, fontWeight: 600, opacity: indexing || pending.length === 0 ? 0.5 : 1 }}
        >
          {indexing ? <Loader2 size={14} className="animate-spin" /> : <ScanText size={14} />}
          {indexing ? `${indexing.done}/${indexing.total}` : "Index now"}
        </button>
      </div>

      {error && <div style={{ fontSize: 13, color: "#f87171" }}>{error}</div>}

      <div className="flex flex-col" style={{ gap: 8 }}>
        {q.trim() && hits.length === 0 && (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", padding: "20px 0", textAlign: "center" }}>
            No matches in names or indexed content.
          </div>
        )}
        {hits.map(({ file, snippet }) => (
          <div key={file.id} className="flex items-start gap-3" style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <FileText size={16} style={{ color: "#4d90fe", marginTop: 2 }} />
            <div className="min-w-0" style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.88)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.filename}</div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                {PROVIDER_LABEL[file.source_provider] ?? file.source_provider} · {formatBytes(file.size_bytes)} · {timeAgo(file.uploaded_at)}
              </div>
              {snippet && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 6, fontStyle: "italic" }}>{snippet}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
