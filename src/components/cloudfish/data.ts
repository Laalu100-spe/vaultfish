export const ACCOUNTS = [
  { id: "g1", platform: "Google Drive", email: "saran@gmail.com", used: 42, total: 100, color: "#4285f4" },
  { id: "g2", platform: "Google Drive", email: "saran.college@gmail.com", used: 14, total: 15, color: "#f59e0b" },
  { id: "g3", platform: "Google Drive", email: "saran.work@gmail.com", used: 28, total: 100, color: "#a855f7" },
  { id: "d1", platform: "Dropbox", email: "saran@gmail.com", used: 14, total: 25, color: "#ec4899" },
  { id: "o1", platform: "OneDrive", email: "saran@gmail.com", used: 18, total: 25, color: "#14b8a6" },
];

export type FileItem = {
  name: string; type: "pdf"|"doc"|"xls"|"mp4"|"png";
  size: string; time: string; account: string; accountColor: string;
};

export const FILES: FileItem[] = [
  { name: "Study Notes.pdf", type: "pdf", size: "2.4 MB", time: "2m ago", account: "college", accountColor: "#22c55e" },
  { name: "Project Proposal.docx", type: "doc", size: "1.1 MB", time: "1h ago", account: "work", accountColor: "#a855f7" },
  { name: "Budget Sheet.xlsx", type: "xls", size: "18 KB", time: "1d ago", account: "dropbox", accountColor: "#14b8a6" },
  { name: "Design Inspiration.mp4", type: "mp4", size: "3.2 GB", time: "5h ago", account: "dropbox", accountColor: "#f59e0b" },
  { name: "College Notes.pdf", type: "pdf", size: "3.6 MB", time: "1d ago", account: "saran@gmail", accountColor: "#4d90fe" },
  { name: "Screenshot.png", type: "png", size: "820 KB", time: "3h ago", account: "college", accountColor: "#22c55e" },
  { name: "Meeting Notes.docx", type: "doc", size: "240 KB", time: "2d ago", account: "work", accountColor: "#a855f7" },
];

export const TYPE_COLORS: Record<FileItem["type"], string> = {
  pdf: "#ef4444", doc: "#4d90fe", xls: "#eab308", mp4: "#a855f7", png: "#22c55e",
};
