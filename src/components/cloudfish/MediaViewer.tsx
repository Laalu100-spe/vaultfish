import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, Download, ExternalLink, Loader2, RotateCw, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getMediaAccessUrl } from "@/lib/media.functions";
import { categorizeFile, createSignedUrl, formatBytes, type FileRow } from "@/hooks/useFiles";
import type { ConnectedAccount } from "@/hooks/useConnectedAccounts";
import { accountForFile, ProviderBadge, sourceLabel } from "./ProviderBadge";

type ResolvedMedia = { file: FileRow; url: string; kind: "image" | "video" };

export function canPreviewInApp(file: FileRow) {
  const category = categorizeFile(file);
  return category === "photos" || category === "videos";
}

export function MediaViewer({ files, initialFileId, accounts, onClose }: {
  files: FileRow[];
  initialFileId: string;
  accounts: ConnectedAccount[];
  onClose: () => void;
}) {
  const previewFiles = useMemo(() => files.filter(canPreviewInApp), [files]);
  const initialIndex = Math.max(0, previewFiles.findIndex((file) => file.id === initialFileId));
  const [index, setIndex] = useState(initialIndex);
  const [resolved, setResolved] = useState<Record<string, ResolvedMedia>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);
  const getCloudUrl = useServerFn(getMediaAccessUrl);
  const currentFile = previewFiles[index];
  const current = currentFile ? resolved[currentFile.id] : undefined;

  const resolveFile = useCallback(async (file: FileRow) => {
    if (resolved[file.id]) return;
    let url: string | null = null;
    if (file.storage_path) url = await createSignedUrl(file.storage_path, 3600);
    else if (file.source_provider === "google_drive") {
      const result = await getCloudUrl({ data: { fileId: file.id } });
      url = result.url;
    }
    if (!url) throw new Error("A direct preview is not available for this file.");
    const kind = categorizeFile(file) === "videos" ? "video" : "image";
    setResolved((value) => ({ ...value, [file.id]: { file, url, kind } }));
  }, [getCloudUrl, resolved]);

  useEffect(() => {
    if (!currentFile) return;
    let active = true;
    setLoading(true);
    setError(null);
    resolveFile(currentFile)
      .catch((cause) => active && setError(cause instanceof Error ? cause.message : "Preview unavailable."))
      .finally(() => active && setLoading(false));
    const neighbour = previewFiles[index + 1] ?? previewFiles[index - 1];
    if (neighbour) resolveFile(neighbour).catch(() => undefined);
    return () => { active = false; };
  }, [currentFile, index, previewFiles, resolveFile]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const go = useCallback((direction: -1 | 1) => {
    setIndex((value) => Math.max(0, Math.min(previewFiles.length - 1, value + direction)));
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, [previewFiles.length]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  if (!currentFile) return null;
  const account = accountForFile(currentFile, accounts);
  const externalUrl = currentFile.external_url;

  const download = async () => {
    const url = current?.url ?? externalUrl;
    if (!url) return toast.error("Download is unavailable");
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = currentFile.filename;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const share = async () => {
    const url = externalUrl ?? current?.url;
    if (!url) return toast.error("Share is unavailable");
    if (navigator.share) {
      await navigator.share({ title: currentFile.filename, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  const retry = () => {
    setResolved((value) => {
      const next = { ...value };
      delete next[currentFile.id];
      return next;
    });
    setError(null);
    setLoading(true);
    resolveFile(currentFile).catch((cause) => setError(cause instanceof Error ? cause.message : "Preview unavailable.")).finally(() => setLoading(false));
  };

  return createPortal(
    <div className="vf-media-viewer" role="dialog" aria-modal="true" aria-label={`Viewing ${currentFile.filename}`}>
      <header className="vf-viewer-header">
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close viewer" className="vf-viewer-control">
          <ChevronLeft size={22} />
        </Button>
        <div className="vf-viewer-file-meta">
          <strong>{currentFile.filename}</strong>
          <span>{formatBytes(currentFile.size_bytes)} · {sourceLabel(currentFile, account)}</span>
        </div>
        <ProviderBadge file={currentFile} accounts={accounts} />
        <div className="vf-viewer-actions">
          <Button variant="ghost" size="icon" onClick={download} aria-label="Download" className="vf-viewer-control"><Download size={18} /></Button>
          <Button variant="ghost" size="icon" onClick={share} aria-label="Share" className="vf-viewer-control"><Share2 size={18} /></Button>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" className="vf-viewer-control vf-viewer-wide-close"><X size={18} /></Button>
        </div>
      </header>

      <div
        className="vf-viewer-stage"
        onDoubleClick={() => { setScale((value) => value > 1 ? 1 : 2.5); if (scale > 1) setPan({ x: 0, y: 0 }); }}
        onTouchStart={(event) => {
          if (event.touches.length !== 2) return;
          const first = event.touches.item(0); const second = event.touches.item(1);
          if (!first || !second) return;
          pinchRef.current = { distance: Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY), scale };
        }}
        onTouchMove={(event) => {
          if (event.touches.length !== 2 || !pinchRef.current) return;
          const first = event.touches.item(0); const second = event.touches.item(1);
          if (!first || !second) return;
          const distance = Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
          setScale(Math.max(1, Math.min(8, pinchRef.current.scale * distance / pinchRef.current.distance)));
        }}
        onTouchEnd={(event) => { if (event.touches.length < 2) pinchRef.current = null; }}
        onPointerMove={(event) => {
          if (scale <= 1 || event.buttons !== 1) return;
          setPan((value) => ({ x: value.x + event.movementX / scale, y: value.y + event.movementY / scale }));
        }}
      >
        {loading && <div className="vf-viewer-status"><Loader2 className="animate-spin" /><span>Loading preview…</span></div>}
        {error && (
          <div className="vf-viewer-status">
            <span>{error}</span>
            <div className="flex gap-2">
              <Button onClick={retry}><RotateCw size={15} /> Retry</Button>
              {externalUrl && <Button variant="outline" onClick={() => window.open(externalUrl, "_blank", "noopener,noreferrer")}><ExternalLink size={15} /> Open provider</Button>}
            </div>
          </div>
        )}
        {current && current.kind === "image" && (
          <img
            src={current.url}
            alt={currentFile.filename}
            draggable={false}
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError("This image could not be loaded."); }}
            style={{ transform: `scale(${scale}) translate3d(${pan.x}px, ${pan.y}px, 0)` }}
          />
        )}
        {current && current.kind === "video" && (
          <video
            src={current.url}
            controls
            autoPlay
            playsInline
            onCanPlay={() => setLoading(false)}
            onWaiting={() => setLoading(true)}
            onError={() => { setLoading(false); setError("This video could not be streamed."); }}
          />
        )}
        <Button variant="ghost" size="icon" disabled={index === 0} onClick={() => go(-1)} aria-label="Previous media" className="vf-viewer-arrow vf-viewer-arrow-left"><ChevronLeft /></Button>
        <Button variant="ghost" size="icon" disabled={index === previewFiles.length - 1} onClick={() => go(1)} aria-label="Next media" className="vf-viewer-arrow vf-viewer-arrow-right"><ChevronLeft /></Button>
      </div>

      <div className="vf-viewer-filmstrip" aria-label="Media thumbnails">
        {previewFiles.map((file, fileIndex) => (
          <div key={file.id} className="vf-viewer-filmstrip-item">
            <Button
              variant="ghost"
              onClick={() => { setIndex(fileIndex); setScale(1); setPan({ x: 0, y: 0 }); }}
              aria-label={`View ${file.filename}`}
              className={fileIndex === index ? "is-active" : ""}
            >
              {file.thumbnail_url ? <img src={file.thumbnail_url} alt="" loading="lazy" /> : <span>{categorizeFile(file) === "videos" ? "Video" : "Photo"}</span>}
            </Button>
            <ProviderBadge file={file} accounts={accounts} compact />
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}