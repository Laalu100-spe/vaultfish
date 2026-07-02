import { useEffect, useRef, useState } from "react";
import { Card, SectionTitle } from "../ui";
import { UploadCloud, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { formatBytes } from "@/hooks/useFiles";

type QueueItem = {
  file: File;
  pct: number;
  status: "queued" | "uploading" | "done" | "error";
  error?: string;
};

export function UploadScreen({ autoOpen = false }: { autoOpen?: boolean }) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const openPicker = () => fileInputRef.current?.click();

  useEffect(() => {
    if (autoOpen) {
      const t = setTimeout(openPicker, 200);
      return () => clearTimeout(t);
    }
  }, [autoOpen]);

  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || list.length === 0 || !user) return;
    const arr = Array.from(list);
    e.target.value = "";
    const initial: QueueItem[] = arr.map((f) => ({ file: f, pct: 0, status: "queued" }));
    setQueue((q) => [...initial, ...q]);

    for (let i = 0; i < arr.length; i++) {
      const f = arr[i];
      const path = `${user.id}/${Date.now()}-${f.name.replace(/[^\w.\-]+/g, "_")}`;
      setQueue((q) => q.map((it) => (it.file === f ? { ...it, status: "uploading", pct: 5 } : it)));
      try {
        const { error: upErr } = await supabase.storage
          .from("user-files")
          .upload(path, f, { cacheControl: "3600", upsert: false, contentType: f.type || undefined });
        if (upErr) throw upErr;
        setQueue((q) => q.map((it) => (it.file === f ? { ...it, pct: 80 } : it)));
        const { error: dbErr } = await supabase.from("file_metadata").insert({
          user_id: user.id,
          file_name: f.name,
          file_size: f.size,
          file_type: f.type || null,
          storage_path: path,
          last_modified: new Date(f.lastModified).toISOString(),
        });
        if (dbErr) throw dbErr;
        setQueue((q) => q.map((it) => (it.file === f ? { ...it, status: "done", pct: 100 } : it)));
        toast.success(`Uploaded ${f.name}`);
      } catch (err: any) {
        setQueue((q) => q.map((it) => (it.file === f ? { ...it, status: "error", error: err?.message ?? "Upload failed" } : it)));
        toast.error(`${f.name}: ${err?.message ?? "Upload failed"}`);
      }
    }
  };

  const remove = (file: File) => setQueue((q) => q.filter((it) => it.file !== file));

  return (
    <div className="space-y-6">
      <input ref={fileInputRef} type="file" multiple accept="*/*" style={{ display: "none" }} onChange={onFilesSelected} />
      <SectionTitle sub="Files upload to your private VaultFish storage">Upload Files</SectionTitle>

      <button onClick={openPicker} className="w-full" style={{ display: "block", textAlign: "left" }}>
        <Card className="p-10 border-dashed border-2 flex flex-col items-center text-center cursor-pointer">
          <div className="flex items-center justify-center mb-3" style={{ background: "rgba(77,144,254,0.15)", height: 56, width: 56, borderRadius: 16 }}>
            <UploadCloud size={22} strokeWidth={1.5} className="text-[color:var(--accent-blue)]" />
          </div>
          <div className="font-medium">Drag & drop files here</div>
          <div className="text-xs text-muted mt-1">or tap to browse — any file type</div>
        </Card>
      </button>

      {queue.length > 0 && (
        <Card className="divide-y divide-border">
          {queue.map((it) => (
            <div key={it.file.name + it.file.size} className="p-4">
              <div className="flex justify-between items-center gap-3 mb-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{it.file.name}</div>
                  <div className="text-xs text-muted">{formatBytes(it.file.size)}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {it.status === "done" && <Check size={16} className="text-emerald-400" />}
                  {it.status === "error" && <span className="text-xs text-red-400">Failed</span>}
                  <button onClick={() => remove(it.file)} className="text-muted"><X size={16} /></button>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${it.pct}%`,
                    background: it.status === "error" ? "#ef4444" : "linear-gradient(90deg,#a855f7,#4d90fe)",
                    transition: "width 200ms ease",
                  }}
                />
              </div>
            </div>
          ))}
        </Card>
      )}

      <button onClick={openPicker} className="w-full py-3.5 rounded-xl bg-[color:var(--accent-blue)] text-white font-medium flex items-center justify-center gap-2">
        <UploadCloud size={18} strokeWidth={1.5} /> Choose Files
      </button>
    </div>
  );
}
