import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Send, Loader2, FileText } from "lucide-react";
import { SectionTitle } from "../ui";
import { askVault, type AskAnswer } from "@/lib/vault.functions";
import { PROVIDER_LABEL } from "@/hooks/useFiles";

type Msg = { role: "user" | "assistant"; text: string; sources?: AskAnswer["sources"] };

const SUGGESTIONS = [
  "Which files are taking up the most space?",
  "Find the PDF with my rent agreement",
  "Summarise what I uploaded this month",
];

export function AskScreen() {
  const ask = useServerFn(askVault);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  const send = async (q: string) => {
    const question = q.trim();
    if (!question || busy) return;
    setInput("");
    setError(null);
    setMessages((m) => [...m, { role: "user", text: question }]);
    setBusy(true);
    try {
      const res = await ask({ data: { question } });
      setMessages((m) => [...m, { role: "assistant", text: res.answer, sources: res.sources }]);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ gap: 18 }}>
      <SectionTitle sub="Ask in plain language — searches across all your connected clouds at once">
        Ask Your Vault
      </SectionTitle>

      {messages.length === 0 && (
        <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.16), rgba(77,144,254,0.10))", border: "1px solid rgba(124,58,237,0.28)", borderRadius: 18, padding: 22 }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center" style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(124,58,237,0.22)" }}>
              <Sparkles size={20} strokeWidth={1.5} style={{ color: "#a78bfa" }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>One question, every cloud</div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                Drive, Dropbox, OneDrive, WhatsApp and uploads — searched together.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2" style={{ marginTop: 16 }}>
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} style={{ fontSize: 12.5, padding: "8px 12px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.75)" }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col" style={{ gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%" }}>
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                fontSize: 13.5,
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
                background: m.role === "user" ? "#4d90fe" : "rgba(255,255,255,0.045)",
                border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.08)",
                color: m.role === "user" ? "#fff" : "rgba(255,255,255,0.85)",
              }}
            >
              {m.text}
            </div>
            {m.sources && m.sources.length > 0 && (
              <div className="flex flex-col" style={{ gap: 6, marginTop: 8 }}>
                {m.sources.map((s) => (
                  <div key={s.id} className="flex items-center gap-2" style={{ padding: "8px 10px", borderRadius: 10, background: "rgba(77,144,254,0.10)", border: "1px solid rgba(77,144,254,0.22)" }}>
                    <FileText size={14} style={{ color: "#4d90fe" }} />
                    <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.filename}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: "auto", whiteSpace: "nowrap" }}>{PROVIDER_LABEL[s.source_provider] ?? s.source_provider}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
            <Loader2 size={15} className="animate-spin" /> Searching every connected cloud…
          </div>
        )}
        {error && <div style={{ fontSize: 13, color: "#f87171" }}>{error}</div>}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex items-center gap-2"
        style={{ position: "sticky", bottom: 0, paddingTop: 8 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your files…"
          style={{ flex: 1, padding: "13px 15px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.9)", fontSize: 13.5, outline: "none" }}
        />
        <button type="submit" disabled={busy || !input.trim()} style={{ width: 46, height: 46, borderRadius: 12, background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", opacity: busy || !input.trim() ? 0.5 : 1 }}>
          <Send size={17} color="#fff" />
        </button>
      </form>
    </div>
  );
}
