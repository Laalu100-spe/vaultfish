import { useEffect, useMemo, useState } from "react";
import { Clock, Link2, Copy, Ban, Check } from "lucide-react";
import { SectionTitle } from "../ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useFiles, PROVIDER_LABEL } from "@/hooks/useFiles";

type ShareRow = {
  id: string;
  file_id: string;
  token: string;
  recipient: string | null;
  expires_at: string;
  revoked: boolean;
  created_at: string;
};

const PRESETS = [
  { label: "1 hour", hours: 1 },
  { label: "24 hours", hours: 24 },
  { label: "7 days", hours: 24 * 7 },
  { label: "30 days", hours: 24 * 30 },
];

export function SharesScreen() {
  const { user } = useAuth();
  const { files } = useFiles();
  const [shares, setShares] = useState<ShareRow[]>([]);
  const [fileId, setFileId] = useState("");
  const [hours, setHours] = useState(24);
  const [recipient, setRecipient] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("file_shares")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setShares((data as ShareRow[]) ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fileMap = useMemo(() => new Map(files.map((f) => [f.id, f])), [files]);

  const create = async () => {
    if (!user || !fileId) return;
    setBusy(true);
    const expires = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    await supabase.from("file_shares").insert({
      user_id: user.id,
      file_id: fileId,
      expires_at: expires,
      recipient: recipient.trim() || null,
    });
    setRecipient("");
    await load();
    setBusy(false);
  };

  const revoke = async (id: string) => {
    await supabase.from("file_shares").update({ revoked: true }).eq("id", id);
    await load();
  };

  const linkFor = (token: string) =>
    `${typeof window !== "undefined" ? window.location.origin : ""}/s/${token}`;

  const copy = async (token: string) => {
    await navigator.clipboard.writeText(linkFor(token));
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  const statusOf = (s: ShareRow) => {
    if (s.revoked) return { label: "Revoked", color: "#f87171" };
    if (new Date(s.expires_at).getTime() <= Date.now()) return { label: "Expired", color: "var(--muted)" };
    return { label: `Expires ${new Date(s.expires_at).toLocaleString()}`, color: "#2dd4bf" };
  };

  return (
    <div className="flex flex-col" style={{ gap: 18 }}>
      <SectionTitle sub="Links that expire on their own — same experience for every connected cloud">
        Timed Sharing
      </SectionTitle>

      <div style={{ borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: 18 }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 10 }}>
          New expiring link
        </div>

        <select
          value={fileId}
          onChange={(e) => setFileId(e.target.value)}
          style={{ width: "100%", padding: "11px 12px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "var(--foreground)", fontSize: 13 }}
        >
          <option value="">Choose a file…</option>
          {files.map((f) => (
            <option key={f.id} value={f.id}>
              {f.filename} — {PROVIDER_LABEL[f.source_provider] ?? f.source_provider}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap gap-2" style={{ marginTop: 12 }}>
          {PRESETS.map((p) => (
            <button
              key={p.hours}
              onClick={() => setHours(p.hours)}
              style={{
                fontSize: 12.5,
                padding: "8px 12px",
                borderRadius: 999,
                background: hours === p.hours ? "rgba(77,144,254,0.18)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${hours === p.hours ? "rgba(77,144,254,0.4)" : "rgba(255,255,255,0.09)"}`,
                color: hours === p.hours ? "#4d90fe" : "var(--muted)",
                fontWeight: 600,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Who is this for? (optional)"
          style={{ width: "100%", marginTop: 12, padding: "11px 12px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "var(--foreground)", fontSize: 13, outline: "none" }}
        />

        <button
          onClick={create}
          disabled={!fileId || busy}
          className="flex items-center justify-center gap-2"
          style={{ width: "100%", marginTop: 14, padding: "12px", borderRadius: 11, background: "#4d90fe", color: "#fff", fontSize: 13.5, fontWeight: 600, opacity: !fileId || busy ? 0.5 : 1 }}
        >
          <Link2 size={15} /> Create expiring link
        </button>
      </div>

      <div className="flex flex-col" style={{ gap: 8 }}>
        {shares.length === 0 && (
          <div style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", padding: "24px 0" }}>No share links yet.</div>
        )}
        {shares.map((s) => {
          const f = fileMap.get(s.file_id);
          const st = statusOf(s);
          const live = !s.revoked && new Date(s.expires_at).getTime() > Date.now();
          return (
            <div key={s.id} className="flex items-center gap-3" style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Clock size={16} style={{ color: st.color }} />
              <div className="min-w-0" style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {f?.filename ?? "File removed"}
                </div>
                <div style={{ fontSize: 11.5, color: st.color, marginTop: 2 }}>
                  {st.label}
                  {s.recipient ? ` · ${s.recipient}` : ""}
                </div>
              </div>
              {live && (
                <>
                  <button onClick={() => copy(s.token)} className="shrink-0" style={{ padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.06)", color: copied === s.token ? "#34d399" : "var(--muted)" }}>
                    {copied === s.token ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  <button onClick={() => revoke(s.id)} className="shrink-0" style={{ padding: 8, borderRadius: 8, background: "rgba(248,113,113,0.12)", color: "#f87171" }}>
                    <Ban size={14} />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
