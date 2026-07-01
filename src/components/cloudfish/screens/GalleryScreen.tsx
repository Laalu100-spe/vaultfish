import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

// Types
type Photo = {
  id: string;
  url: string;
  alt: string;
  aspectRatio: number;
};

const PHOTOS: Photo[] = [
  { id: 'photo-1', url: 'https://picsum.photos/id/1015/800/1200', alt: 'Mountain landscape at dusk', aspectRatio: 800 / 1200 },
  { id: 'photo-2', url: 'https://picsum.photos/id/1005/1200/800', alt: 'Ocean sunset', aspectRatio: 1200 / 800 },
  { id: 'photo-3', url: 'https://picsum.photos/id/1016/800/1000', alt: 'Forest path', aspectRatio: 800 / 1000 },
  { id: 'photo-4', url: 'https://picsum.photos/id/1033/1000/800', alt: 'City skyline', aspectRatio: 1000 / 800 },
  { id: 'photo-5', url: 'https://picsum.photos/id/1040/800/1100', alt: 'Desert dunes', aspectRatio: 800 / 1100 },
  { id: 'photo-6', url: 'https://picsum.photos/id/106/1200/900', alt: 'Lake reflection', aspectRatio: 1200 / 900 },
  { id: 'photo-7', url: 'https://picsum.photos/id/1074/900/1200', alt: 'Snowy mountains', aspectRatio: 900 / 1200 },
  { id: 'photo-8', url: 'https://picsum.photos/id/1080/1100/800', alt: 'Waterfall', aspectRatio: 1100 / 800 },
  { id: 'photo-9', url: 'https://picsum.photos/id/1009/800/1000', alt: 'Coastal cliffs', aspectRatio: 800 / 1000 },
  { id: 'photo-10', url: 'https://picsum.photos/id/1018/1200/850', alt: 'Autumn forest', aspectRatio: 1200 / 850 },
  { id: 'photo-11', url: 'https://picsum.photos/id/1036/900/1100', alt: 'Starry night', aspectRatio: 900 / 1100 },
  { id: 'photo-12', url: 'https://picsum.photos/id/1043/1000/900', alt: 'Urban street', aspectRatio: 1000 / 900 },
];

const SWIPE_THRESHOLD = 80;
const DISMISS_THRESHOLD = 120;
const MAX_ZOOM = 8;
const MIN_ZOOM = 0.5;
const DOUBLE_TAP_ZOOM = 3;

interface GestureState {
  pointers: Map<number, { x: number; y: number }>;
  initialDistance: number | null;
  initialScale: number;
  initialOffset: { x: number; y: number };
}

// Inline SVG Icons (replaces lucide-react)
const IconChevronLeft = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

const IconZoomIn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><path d="M11 8v6" /><path d="M8 11h6" />
  </svg>
);

const IconZoomOut = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><path d="M8 11h6" />
  </svg>
);

const IconReset = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
  </svg>
);

export function GalleryScreen() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionRect, setTransitionRect] = useState<DOMRect | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const dragStart = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastMoveTime = useRef(0);
  const lastPosition = useRef({ x: 0, y: 0 });
  const stripRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const gestureState = useRef<GestureState>({
    pointers: new Map(),
    initialDistance: null,
    initialScale: 1,
    initialOffset: { x: 0, y: 0 },
  });
  const transitionTimeout = useRef<number | null>(null);

  const currentPhoto = selectedIndex !== null ? PHOTOS[selectedIndex] : null;
  const previousPhoto = selectedIndex !== null && selectedIndex > 0 ? PHOTOS[selectedIndex - 1] : null;
  const nextPhoto = selectedIndex !== null && selectedIndex < PHOTOS.length - 1 ? PHOTOS[selectedIndex + 1] : null;

  const canSwipe = scale === 1 && !isZoomed;
  const canPan = scale > 1;

  // Close fullscreen
  const closeFullscreen = useCallback(() => {
    if (selectedIndex === null) return;

    setIsDismissing(true);
    setDragOffset({ x: 0, y: 40 });
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
    setIsZoomed(false);

    if (transitionTimeout.current) window.clearTimeout(transitionTimeout.current);

    transitionTimeout.current = window.setTimeout(() => {
      setSelectedIndex(null);
      setIsTransitioning(false);
      setTransitionRect(null);
      setDragOffset({ x: 0, y: 0 });
      setIsDragging(false);
      setIsDismissing(false);
      resetGestureState();
    }, 220);
  }, [selectedIndex]);

  // Navigate to photo
  const navigateTo = useCallback((targetIndex: number) => {
    if (selectedIndex === null || targetIndex === selectedIndex || targetIndex < 0 || targetIndex >= PHOTOS.length) return;

    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
    setIsZoomed(false);
    setDragOffset({ x: 0, y: 0 });
    setSelectedIndex(targetIndex);

    requestAnimationFrame(() => {
      if (stripRef.current) {
        const activeThumb = stripRef.current.querySelector(`[data-photo-index="${targetIndex}"]`) as HTMLElement | null;
        activeThumb?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });
  }, [selectedIndex]);

  const navigateBy = useCallback((direction: 1 | -1) => {
    if (selectedIndex === null) return;
    navigateTo(selectedIndex + direction);
  }, [selectedIndex, navigateTo]);

  const resetGestureState = () => {
    gestureState.current = {
      pointers: new Map(),
      initialDistance: null,
      initialScale: 1,
      initialOffset: { x: 0, y: 0 },
    };
  };

  // Pan bounds
  const getPanBounds = useCallback(() => {
    if (!viewerRef.current || !imageRef.current) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }
    const container = viewerRef.current.getBoundingClientRect();
    const img = imageRef.current;
    const naturalWidth = img.naturalWidth || 800;
    const naturalHeight = img.naturalHeight || 600;
    const containerWidth = container.width;
    const containerHeight = container.height;
    const scaledWidth = naturalWidth * scale;
    const scaledHeight = naturalHeight * scale;
    const overflowX = Math.max(0, scaledWidth - containerWidth);
    const overflowY = Math.max(0, scaledHeight - containerHeight);

    return {
      minX: -overflowX / 2,
      maxX: overflowX / 2,
      minY: -overflowY / 2,
      maxY: overflowY / 2,
    };
  }, [scale]);

  const applyPan = useCallback((dx: number, dy: number) => {
    const bounds = getPanBounds();
    const newX = Math.max(bounds.minX, Math.min(bounds.maxX, offsetX + dx));
    const newY = Math.max(bounds.minY, Math.min(bounds.maxY, offsetY + dy));
    setOffsetX(newX);
    setOffsetY(newY);
  }, [offsetX, offsetY, getPanBounds]);

  // Pinch handling
  const handlePinch = useCallback((pointers: Map<number, { x: number; y: number }>) => {
    if (pointers.size !== 2) return;
    const [p1, p2] = Array.from(pointers.values());
    const currentDistance = Math.hypot(p2.x - p1.x, p2.y - p1.y);

    if (!gestureState.current.initialDistance) {
      gestureState.current.initialDistance = currentDistance;
      gestureState.current.initialScale = scale;
      gestureState.current.initialOffset = { x: offsetX, y: offsetY };
      return;
    }

    const scaleFactor = currentDistance / gestureState.current.initialDistance;
    const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, gestureState.current.initialScale * scaleFactor));

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const container = viewerRef.current?.getBoundingClientRect();
    if (!container) return;

    const centerX = container.width / 2;
    const centerY = container.height / 2;
    const scaleDiff = newScale - gestureState.current.initialScale;
    const panAdjustX = (midX - centerX) * (scaleDiff / gestureState.current.initialScale);
    const panAdjustY = (midY - centerY) * (scaleDiff / gestureState.current.initialScale);

    setScale(newScale);
    setOffsetX(gestureState.current.initialOffset.x - panAdjustX);
    setOffsetY(gestureState.current.initialOffset.y - panAdjustY);
    setIsZoomed(newScale > 1.05);
  }, [scale, offsetX, offsetY]);

  // Pointer handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (selectedIndex === null) return;

    const { clientX, clientY, pointerId } = e;
    gestureState.current.pointers.set(pointerId, { x: clientX, y: clientY });

    if (gestureState.current.pointers.size === 1) {
      dragStart.current = { x: clientX, y: clientY };
      lastPosition.current = { x: clientX, y: clientY };
      lastMoveTime.current = Date.now();
      setIsDragging(true);
    } else if (gestureState.current.pointers.size === 2) {
      gestureState.current.initialDistance = null;
    }

    if (e.pointerType === 'touch') e.preventDefault();
  }, [selectedIndex]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (selectedIndex === null || !isDragging) return;

    const { clientX, clientY, pointerId } = e;
    const currentPointers = gestureState.current.pointers;
    if (!currentPointers.has(pointerId)) return;

    currentPointers.set(pointerId, { x: clientX, y: clientY });

    if (currentPointers.size === 2) {
      handlePinch(currentPointers);
      return;
    }

    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;

    const now = Date.now();
    const dt = now - lastMoveTime.current;
    if (dt > 0) {
      velocityRef.current = {
        x: (clientX - lastPosition.current.x) / dt,
        y: (clientY - lastPosition.current.y) / dt,
      };
    }
    lastPosition.current = { x: clientX, y: clientY };
    lastMoveTime.current = now;

    if (canPan) {
      applyPan(dx * 0.8, dy * 0.8);
    } else if (canSwipe) {
      if (Math.abs(dy) > Math.abs(dx) * 0.7 && dy > 0) {
        setDragOffset({ x: 0, y: dy });
      } else {
        setDragOffset({ x: dx, y: 0 });
      }
    }
  }, [selectedIndex, isDragging, canPan, canSwipe, handlePinch, applyPan]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (selectedIndex === null) return;

    const { pointerId } = e;
    gestureState.current.pointers.delete(pointerId);

    if (gestureState.current.pointers.size === 0) {
      setIsDragging(false);
      const { x: dx, y: dy } = dragOffset;

      resetGestureState();

      if (Math.abs(dy) > DISMISS_THRESHOLD && Math.abs(dy) > Math.abs(dx) && canSwipe) {
        closeFullscreen();
        return;
      }

      if (Math.abs(dx) > SWIPE_THRESHOLD && canSwipe) {
        if (dx < -SWIPE_THRESHOLD && selectedIndex < PHOTOS.length - 1) navigateBy(1);
        else if (dx > SWIPE_THRESHOLD && selectedIndex > 0) navigateBy(-1);
        else setDragOffset({ x: 0, y: 0 });
        return;
      }

      setDragOffset({ x: 0, y: 0 });
    }
  }, [selectedIndex, dragOffset, canSwipe, closeFullscreen, navigateBy]);

  // Double tap zoom
  const handleDoubleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (selectedIndex === null) return;
    e.stopPropagation();

    if (scale > 1.1) {
      setScale(1);
      setOffsetX(0);
      setOffsetY(0);
      setIsZoomed(false);
    } else {
      const rect = viewerRef.current?.getBoundingClientRect();
      if (rect) {
        const tapX = 'clientX' in e ? (e as React.MouseEvent).clientX : (e as React.TouchEvent).touches[0].clientX;
        const tapY = 'clientY' in e ? (e as React.MouseEvent).clientY : (e as React.TouchEvent).touches[0].clientY;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const newScale = DOUBLE_TAP_ZOOM;
        const offsetToCenterX = (tapX - rect.left - centerX) * (newScale - 1) / newScale;
        const offsetToCenterY = (tapY - rect.top - centerY) * (newScale - 1) / newScale;

        setScale(newScale);
        setOffsetX(-offsetToCenterX);
        setOffsetY(-offsetToCenterY);
        setIsZoomed(true);
      }
    }
  }, [scale, selectedIndex]);

  // Open photo with shared element transition
  const openPhoto = useCallback((index: number, event: React.MouseEvent) => {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    setSelectedIndex(index);
    setTransitionRect(rect);
    setIsTransitioning(true);
    setDragOffset({ x: 0, y: 0 });
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
    setIsZoomed(false);

    if (transitionTimeout.current) window.clearTimeout(transitionTimeout.current);
    transitionTimeout.current = window.setTimeout(() => {
      setIsTransitioning(false);
      setTransitionRect(null);
    }, 420);
  }, []);

  // Keyboard support
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeFullscreen();
      else if (event.key === 'ArrowRight') navigateBy(1);
      else if (event.key === 'ArrowLeft') navigateBy(-1);
      else if ((event.key.toLowerCase() === 'r') && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setScale(1);
        setOffsetX(0);
        setOffsetY(0);
        setIsZoomed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, closeFullscreen, navigateBy]);

  // Auto-center thumbnails
  useEffect(() => {
    if (selectedIndex === null || !stripRef.current) return;

    const activeThumb = stripRef.current.querySelector(`[data-photo-index="${selectedIndex}"]`) as HTMLElement | null;
    activeThumb?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [selectedIndex]);

  // Preload adjacent images
  useEffect(() => {
    if (selectedIndex === null) return;
    const preload = [previousPhoto, nextPhoto].filter(Boolean) as Photo[];
    preload.forEach(p => { const img = new Image(); img.src = p.url; });
  }, [selectedIndex, previousPhoto, nextPhoto]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (transitionTimeout.current) window.clearTimeout(transitionTimeout.current);
    };
  }, []);

  // Drag scale & opacity
  const dragScale = useMemo(() => (dragOffset.y <= 0 ? 1 : Math.max(0.82, 1 - Math.max(dragOffset.y, 0) / 1400)), [dragOffset.y]);
  const dismissOpacity = useMemo(() => (dragOffset.y <= 0 ? 1 : Math.max(0.2, 1 - Math.max(dragOffset.y, 0) / 600)), [dragOffset.y]);

  // Shared element transition styles
  const getTransitionStyle = () => {
    if (!transitionRect) return {};
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const aspect = currentPhoto?.aspectRatio || 1;
    let tw = vw, th = vw / aspect;
    if (th > vh) { th = vh; tw = th * aspect; }
    return {
      position: 'fixed' as const,
      left: transitionRect.left,
      top: transitionRect.top,
      width: transitionRect.width,
      height: transitionRect.height,
      zIndex: 9999,
    };
  };

  const current = currentPhoto;
  const isOpen = selectedIndex !== null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-6 pt-8 pb-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-1.5px]">Gallery</h1>
            <p className="text-white/50 text-sm mt-1">Premium moments • {PHOTOS.length} photos</p>
          </div>
          <div className="text-xs text-white/40 font-mono tracking-[2px]">X • PHOTOS</div>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="max-w-[1400px] mx-auto px-4 pb-24">
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-3" aria-label="Photo gallery">
          {PHOTOS.map((photo, index) => (
            <button
              key={photo.id}
              onClick={(e) => openPhoto(index, e)}
              className="group relative w-full overflow-hidden rounded-2xl bg-zinc-950 shadow-xl shadow-black/60 block break-inside-avoid cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.985] transition-transform"
              aria-label={`Open ${photo.alt}`}
            >
              <div className="relative">
                <img
                  src={photo.url}
                  alt={photo.alt}
                  loading="lazy"
                  className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-[1.08]"
                  style={{ aspectRatio: photo.aspectRatio }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60 opacity-60 group-hover:opacity-40 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen Viewer */}
      {isOpen && current && (
        <div
          className="fixed inset-0 z-[9000] bg-black flex flex-col"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: 'none' }}
        >
          {/* Shared Element Transition Layer */}
          {isTransitioning && transitionRect && (
            <div
              className="fixed z-[9999] overflow-hidden rounded-3xl shadow-2xl"
              style={getTransitionStyle()}
            >
              <img
                src={current.url}
                alt={current.alt}
                className="w-full h-full object-contain"
                draggable={false}
              />
            </div>
          )}

          {/* Main Content */}
          {!isTransitioning && (
            <>
              {/* Glass Back Button */}
              <button
                onClick={closeFullscreen}
                onPointerDown={(e) => e.stopPropagation()}
                className="fixed top-6 left-6 z-[9999] flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 text-white hover:bg-white/15 active:bg-white/20 transition-all duration-200 shadow-xl"
                aria-label="Close gallery"
              >
                <IconChevronLeft />
              </button>

              {/* Counter */}
              <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-1.5 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/15 text-sm font-medium tracking-widest text-white/90">
                {selectedIndex! + 1} <span className="text-white/40">/ {PHOTOS.length}</span>
              </div>

              {/* Close Button */}
              <button
                onClick={closeFullscreen}
                onPointerDown={(e) => e.stopPropagation()}
                className="fixed top-6 right-6 z-[9999] flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 text-white hover:bg-white/15 active:bg-white/20 transition-all duration-200 shadow-xl"
                aria-label="Close"
              >
                <IconX />
              </button>

              {/* Photo Stage */}
              <div
                ref={viewerRef}
                className="flex-1 relative flex items-center justify-center overflow-hidden"
                style={{ paddingTop: '72px', paddingBottom: '92px' }}
              >
                <div
                  ref={imageRef as any}
                  className="relative flex items-center justify-center"
                  style={{
                    transform: `translate3d(${dragOffset.x + offsetX}px, ${dragOffset.y + offsetY}px, 0) scale(${dragScale * scale})`,
                    transition: isDragging ? 'none' : 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
                    borderRadius: isDismissing || dragOffset.y > 30 ? '28px' : '0px',
                    willChange: 'transform',
                  }}
                  onDoubleClick={handleDoubleTap}
                  onTouchStart={(e) => {
                    if (e.touches.length === 1) handlePointerDown(e as any);
                  }}
                >
                  <img
                    ref={imageRef}
                    src={current.url}
                    alt={current.alt}
                    className="max-h-[calc(100vh-180px)] max-w-[min(100vw,1200px)] object-contain select-none pointer-events-none"
                    draggable={false}
                    style={{
                      boxShadow: dragOffset.y > 20 ? '0 40px 120px -20px rgb(0 0 0 / 0.6)' : 'none',
                      transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
                    }}
                  />
                </div>

                {/* Preload */}
                {previousPhoto && <img src={previousPhoto.url} alt="" className="absolute opacity-0 pointer-events-none" style={{ width: '1px', height: '1px' }} />}
                {nextPhoto && <img src={nextPhoto.url} alt="" className="absolute opacity-0 pointer-events-none" style={{ width: '1px', height: '1px' }} />}
              </div>

              {/* Zoom Controls */}
              <div className="fixed bottom-[92px] right-6 z-[9999] flex flex-col gap-2">
                <button
                  onClick={() => { const ns = Math.min(MAX_ZOOM, scale * 1.6); setScale(ns); setIsZoomed(ns > 1.05); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 hover:bg-white/15 active:bg-white/25 transition-all shadow-xl"
                  aria-label="Zoom in"
                >
                  <IconZoomIn />
                </button>
                <button
                  onClick={() => {
                    const ns = Math.max(1, scale / 1.6);
                    setScale(ns);
                    if (ns <= 1.05) { setOffsetX(0); setOffsetY(0); setIsZoomed(false); }
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 hover:bg-white/15 active:bg-white/25 transition-all shadow-xl"
                  aria-label="Zoom out"
                >
                  <IconZoomOut />
                </button>
                <button
                  onClick={() => { setScale(1); setOffsetX(0); setOffsetY(0); setIsZoomed(false); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 hover:bg-white/15 active:bg-white/25 transition-all shadow-xl"
                  aria-label="Reset zoom"
                >
                  <IconReset />
                </button>
              </div>

              {/* Thumbnail Strip */}
              <div
                ref={stripRef}
                className="fixed bottom-0 left-0 right-0 z-[9998] h-[78px] bg-gradient-to-t from-black via-black/95 to-transparent border-t border-white/10 flex items-center gap-2.5 overflow-x-auto px-4 pb-3 scrollbar-hide"
                onPointerDown={(e) => e.stopPropagation()}
              >
                {PHOTOS.map((photo, index) => (
                  <button
                    key={photo.id}
                    data-photo-index={index}
                    onClick={() => navigateTo(index)}
                    onPointerDown={(e) => e.stopPropagation()}
                    className={`flex-shrink-0 relative w-[62px] h-[52px] overflow-hidden rounded-xl border-2 transition-all duration-200 ${index === selectedIndex ? 'border-white scale-[1.04] shadow-lg' : 'border-white/20 hover:border-white/50'}`}
                    aria-label={`Go to photo ${index + 1}`}
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover" loading={Math.abs(index - (selectedIndex || 0)) <= 2 ? 'eager' : 'lazy'} />
                    {index === selectedIndex && <div className="absolute inset-0 bg-white/10" />}
                  </button>
                ))}
              </div>

              {/* Background Overlay */}
              <div
                className="fixed inset-0 bg-black pointer-events-none z-[8999]"
                style={{ opacity: isDismissing || dragOffset.y > 0 ? dismissOpacity * 0.95 : 1 }}
              />
            </>
          )}
        </div>
      )}

      {/* Styles */}
      <style>{`
        .scrollbar-hide { scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}</style>
    </div>
  );
}
