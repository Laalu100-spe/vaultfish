import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { resolveShare, type ResolvedShare } from "@/lib/share.functions";

export const Route = createFileRoute("/s/$token")({
  head: () => ({
    meta: [
      { title: "Shared file — VaultFish" },
      { name: "description", content: "A time-limited file shared securely through VaultFish." },
      { property: "og:title", content: "Shared file — VaultFish" },
      { property: "og:description", content: "A time-limited file shared securely through VaultFish." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SharePage,
});

const MESSAGES: Record<string, string> = {
  not_found: "This link does not exist.",
  expired: "This link has expired.",
  revoked: "This link was revoked by its owner.",
  unavailable: "This file is no longer available.",
};

function SharePage() {
  const { token } = Route.useParams();
  const [state, setState] = useState<ResolvedShare | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    resolveShare({ data: { token } })
      .then(setState)
      .catch((e: any) => setError(e?.message ?? "Could not open this link"));
  }, [token]);

  return (
    <div style={{ minHeight: "100vh", background: "#06080f", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: '"Inter", sans-serif' }}>
      <div style={{ maxWidth: 420, width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 26, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em" }}>
          <span style={{ fontWeight: 300 }}>Vault</span><span style={{ color: "#4d90fe" }}>Fish</span>
        </div>

        {!state && !error && <div style={{ marginTop: 18, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Opening shared file…</div>}
        {error && <div style={{ marginTop: 18, fontSize: 13, color: "#f87171" }}>{error}</div>}

        {state && !state.ok && (
          <div style={{ marginTop: 18, fontSize: 13.5, color: "rgba(255,255,255,0.6)" }}>{MESSAGES[state.reason]}</div>
        )}

        {state && state.ok && (
          <>
            <h1 style={{ marginTop: 18, fontSize: 16, fontWeight: 600 }}>{state.filename}</h1>
            <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
              Access expires {new Date(state.expires_at).toLocaleString()}
            </div>
            <a
              href={state.url}
              target="_blank"
              rel="noreferrer"
              style={{ display: "block", marginTop: 18, padding: "12px 16px", borderRadius: 11, background: "#4d90fe", color: "#fff", fontSize: 13.5, fontWeight: 600 }}
            >
              Open file
            </a>
          </>
        )}
      </div>
    </div>
  );
}
