import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function PolicyModal({
  title, subtitle, sections, onClose,
}: {
  title: string;
  subtitle: string;
  sections: { heading: string; body: string }[];
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(7,8,12,0.98)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        display: "flex", flexDirection: "column",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <div className="flex items-start justify-between" style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{title}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{subtitle}</div>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white p-2"><X size={20} /></button>
      </div>
      <div style={{ overflowY: "auto", padding: "24px", maxWidth: 720, margin: "0 auto", width: "100%" }}>
        {sections.map((s) => (
          <div key={s.heading} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{s.heading}</div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.65)" }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}

export const PRIVACY_SECTIONS = [
  { heading: "1. Information We Collect", body: "We collect your Google account email and profile photo when you sign in with Google. We store metadata about files you upload: filename, file size, file type, and upload date. We do not read the contents of your files. We do not sell your personal data to any third party under any circumstances." },
  { heading: "2. How We Use Your Information", body: "To display your files and storage usage in the app. To provide Smart Clean, Analytics, and Gallery features. To sync your preferences across devices and sessions. Your data is never used for advertising purposes." },
  { heading: "3. File Storage and Security", body: "Files you upload are stored in Supabase Storage with end-to-end row-level security — only you can access your files. Files are encrypted at rest using AES-256 encryption. VaultFish staff cannot access your files without your explicit permission." },
  { heading: "4. Google Drive Integration", body: "When you connect Google Drive we request read-only access to your file metadata. We do not modify, move, or delete files in your Google Drive. You can disconnect Google Drive at any time from the Clouds screen. Revoking access immediately removes all synced data." },
  { heading: "5. Data Deletion", body: "Delete any file from VaultFish at any time using the three-dots menu. Delete your entire account from Settings — this permanently removes all your files, metadata, and preferences within 30 days. Deleted files are removed from Supabase Storage immediately." },
  { heading: "6. Third Party Services", body: "Supabase (database and file storage — supabase.com/privacy). Google OAuth (sign-in — policies.google.com/privacy). Google Gemini API (AI features — ai.google.dev/terms). Each service operates under its own privacy policy." },
  { heading: "7. Children", body: "VaultFish is not intended for users under 13 years of age. We do not knowingly collect data from children. If you believe a child has created an account contact us immediately at privacy@talabros.com." },
  { heading: "8. Contact and Updates", body: "For privacy questions or data requests email privacy@talabros.com or visit talabros.netlify.app. We will notify users of material privacy policy changes via email before they take effect." },
];

export const TERMS_SECTIONS = [
  { heading: "1. Acceptable Use", body: "You agree not to upload illegal content, malware, or material that infringes on the rights of others. VaultFish is not a distribution platform for pirated content, harassment, or any use prohibited by law." },
  { heading: "2. Service Availability", body: "VaultFish is provided on a best-effort basis. The free tier does not include an uptime guarantee. Scheduled maintenance and unplanned outages may occur." },
  { heading: "3. Limitation of Liability", body: "VaultFish is a tool that helps you organize files across clouds. We are not responsible for data loss. Always keep independent backups of anything important." },
  { heading: "4. Account Termination", body: "You may delete your account at any time from Settings. We reserve the right to suspend accounts that violate these terms." },
  { heading: "5. Governing Law", body: "These terms are governed by the laws of Nepal. Disputes will be resolved in Kathmandu, Nepal." },
];
