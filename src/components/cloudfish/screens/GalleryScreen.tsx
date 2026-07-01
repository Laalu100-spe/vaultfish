import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";

type Photo = {
  id: string;
  url: string;
  alt: string;
};

const PHOTOS: Photo[] = [
  "https://picsum.photos/seed/1/400/500",
  "https://picsum.photos/seed/2/400/600",
  "https://picsum.photos/seed/3/500/400",
  "https://picsum.photos/seed/4/400/500",
  "https://picsum.photos/seed/5/600/400",
  "https://picsum.photos/seed/6/400/500",
  "https://picsum.photos/seed/7/400/600",
  "https://picsum.photos/seed/8/500/400",
  "https://picsum.photos/seed/9/400/500",
  "https://picsum.photos/seed/10/600/400",
  "https://picsum.photos/seed/11/400/500",
  "https://picsum.photos/seed/12/400/600",
].map((url, index) => ({ id: `photo-${index + 1}`, url, alt: `VaultFish photo ${index + 1}` }));

const SWIPE_THRESHOLD = 60;
const DISMISS_THRESHOLD = 80;
const ANIMATION_MS = 280;

export function GalleryScreen() {
  const [selected, setSelected] = useState<number | null>(null);
  const [outgoing, setOutgoing] = useState<{ index: number; direction: 1 | -1 } | null>(null);
  const [incomingDirection, setIncomingDirection] = useState<1 | -1 | null>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const mouseActive = useRef(false);
  const transitionTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const current = selected === null ? null : PHOTOS[selected];
  const previous = selected !== null && selected > 0 ? PHOTOS[selected - 1] : null;
  const next = selected !== null && selected < PHOTOS.length - 1 ? PHOTOS[selected + 1] : null;

  const closeFullscreen = () => {
    setIsDismissing(true);
    setDrag({ x: 0, y: 28 });
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setSelected(null);
      setOutgoing(null);
      setIncomingDirection(null);
      setDrag({ x: 0, y: 0 });
      setIsDragging(false);
      setIsDismissing(false);
      mouseActive.current = false;
    }, 180);
  };

  const navigateTo = (target: number) => {
    if (selected === null || target === selected || target < 0 || target >= PHOTOS.length) return;
    const direction: 1 | -1 = target > selected ? 1 : -1;
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    setOutgoing({ index: selected, direction });
    setIncomingDirection(direction);
    setSelected(target);
    setDrag({ x: 0, y: 0 });
    transitionTimer.current = window.setTimeout(() => {
      setOutgoing(null);
      setIncomingDirection(null);
    }, ANIMATION_MS);
  };

  const navigateBy = (direction: 1 | -1) => {
    if (selected === null) return;
    navigateTo(selected + direction);
  };

  const beginDrag = (x: number, y: number) => {
    if (selected === null) return;
    dragStart.current = { x, y };
    setIsDragging(true);
    mouseActive.current = true;
  };

  const updateDrag = (x: number, y: number) => {
    if (selected === null || !mouseActive.current || outgoing || isDismissing) return;
    const dx = x - dragStart.current.x;
    const dy = y - dragStart.current.y;
    if (dy > 0 && Math.abs(dy) > Math.abs(dx) * 0.75) {
      setDrag({ x: 0, y: dy });
      return;
    }
    setDrag({ x: dx, y: 0 });
  };

  const finishDrag = (x: number, y: number) => {
    if (selected === null || !mouseActive.current) return;
    mouseActive.current = false;
    setIsDragging(false);
    const deltaX = dragStart.current.x - x;
    const deltaY = y - dragStart.current.y;
    if (deltaY > DISMISS_THRESHOLD && deltaY > Math.abs(deltaX)) {
      closeFullscreen();
      return;
    }
    if (deltaX > SWIPE_THRESHOLD) {
      navigateBy(1);
      return;
    }
    if (deltaX < -SWIPE_THRESHOLD) {
      navigateBy(-1);
      return;
    }
    setDrag({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (selected === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeFullscreen();
      if (event.key === "ArrowRight") navigateBy(1);
      if (event.key === "ArrowLeft") navigateBy(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    if (selected === null || !stripRef.current) return;
    const activeThumb = stripRef.current.querySelector(`[data-photo-index="${selected}"]`) as HTMLElement | null;
    activeThumb?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selected]);

  useEffect(() => {
    return () => {
      if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  const dragScale = Math.max(0.9, 1 - Math.max(drag.y, 0) / 900);

  return (
    <div className="vf-gallery-page">
      <header className="vf-gallery-header">
        <h1>Gallery</h1>
      </header>

      <div className="vf-gallery-grid" aria-label="Photo gallery">
        {PHOTOS.map((photo, index) => (
          <button key={photo.id} className="vf-gallery-cell" onClick={() => setSelected(index)} aria-label={`Open photo ${index + 1}`}>
            <img src={photo.url} alt={photo.alt} loading="lazy" />
          </button>
        ))}
      </div>

      {selected !== null && current && (
        <div
          className={`vf-fullscreen ${isDismissing ? "vf-fullscreen-dismissing" : ""}`}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            beginDrag(touch.clientX, touch.clientY);
          }}
          onTouchMove={(event) => {
            const touch = event.touches[0];
            updateDrag(touch.clientX, touch.clientY);
          }}
          onTouchEnd={(event) => {
            const touch = event.changedTouches[0];
            finishDrag(touch.clientX, touch.clientY);
          }}
          onMouseDown={(event) => beginDrag(event.clientX, event.clientY)}
          onMouseMove={(event) => updateDrag(event.clientX, event.clientY)}
          onMouseUp={(event) => finishDrag(event.clientX, event.clientY)}
          onMouseLeave={(event) => {
            if (mouseActive.current) finishDrag(event.clientX, event.clientY);
          }}
        >
          <button
            className="vf-fullscreen-back"
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              closeFullscreen();
            }}
            aria-label="Back to gallery"
          >
            <ChevronLeft size={20} color="white" strokeWidth={2} />
          </button>

          <div className="vf-fullscreen-counter">
            {selected + 1} of {PHOTOS.length}
          </div>

          <div className="vf-photo-stage" aria-live="polite">
            {outgoing && (
              <img
                key={`out-${outgoing.index}`}
                src={PHOTOS[outgoing.index].url}
                alt=""
                className={`vf-fullscreen-photo vf-photo-out-${outgoing.direction === 1 ? "next" : "previous"}`}
                draggable={false}
                loading="eager"
              />
            )}
            <img
              key={current.id}
              src={current.url}
              alt={current.alt}
              className={`vf-fullscreen-photo ${incomingDirection === 1 ? "vf-photo-in-next" : incomingDirection === -1 ? "vf-photo-in-previous" : ""} ${isDismissing ? "vf-photo-dismiss" : ""}`}
              draggable={false}
              loading="eager"
              style={{
                transform: outgoing || incomingDirection || isDismissing ? undefined : `translate3d(${drag.x}px, ${drag.y}px, 0) scale(${dragScale})`,
                transition: isDragging ? "none" : "transform 220ms cubic-bezier(0.4,0,0.2,1)",
              }}
            />
            {previous && <img src={previous.url} alt="" className="vf-preload-photo" loading="eager" />}
            {next && <img src={next.url} alt="" className="vf-preload-photo" loading="eager" />}
          </div>

          <div className="vf-fullscreen-dots" onMouseDown={(event) => event.stopPropagation()} onTouchStart={(event) => event.stopPropagation()}>
            {PHOTOS.map((photo, index) => (
              <button
                key={photo.id}
                className={`vf-dot ${index === selected ? "vf-dot-active" : ""}`}
                onClick={() => navigateTo(index)}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>

          <div ref={stripRef} className="vf-thumbnail-strip" onMouseDown={(event) => event.stopPropagation()} onTouchStart={(event) => event.stopPropagation()}>
            {PHOTOS.map((photo, index) => (
              <button
                key={photo.id}
                data-photo-index={index}
                className={`vf-thumbnail ${index === selected ? "vf-thumbnail-active" : ""}`}
                onClick={() => navigateTo(index)}
                aria-label={`Open thumbnail ${index + 1}`}
              >
                <img src={photo.url} alt="" loading={Math.abs(index - selected) <= 1 ? "eager" : "lazy"} />
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .vf-gallery-page {
          max-width: 1320px;
          margin: 0 auto;
          padding: 16px 12px 88px;
        }

        .vf-gallery-header {
          padding: 4px 4px 16px;
        }

        .vf-gallery-header h1 {
          margin: 0;
          color: rgba(255,255,255,0.94);
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0;
        }

        .vf-gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 3px;
        }

        @media (min-width: 900px) {
          .vf-gallery-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
        }

        .vf-gallery-cell {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          border: 0;
          border-radius: 4px;
          padding: 0;
          background: #111;
          cursor: pointer;
          contain: layout style paint;
        }

        .vf-gallery-cell img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vf-fullscreen {
          position: fixed;
          inset: 0;
          z-index: 9000;
          overflow: hidden;
          background: #000000;
          opacity: 0;
          animation: vfOverlayIn 250ms cubic-bezier(0.4,0,0.2,1) forwards;
          touch-action: none;
          user-select: none;
          cursor: grab;
        }

        .vf-fullscreen:active {
          cursor: grabbing;
        }

        .vf-fullscreen-dismissing {
          animation: vfOverlayOut 180ms cubic-bezier(0.4,0,0.2,1) forwards;
        }

        .vf-fullscreen-back {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 9999;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
        }

        .vf-fullscreen-counter {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.8);
          line-height: 44px;
          pointer-events: none;
        }

        .vf-photo-stage {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .vf-fullscreen-photo {
          position: absolute;
          inset: 0;
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          will-change: transform, opacity;
          -webkit-user-drag: none;
          user-select: none;
        }

        .vf-preload-photo {
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
          transform: translate3d(-9999px, -9999px, 0);
        }

        .vf-photo-in-next {
          animation: vfSlideInNext 280ms cubic-bezier(0.4,0,0.2,1) both;
        }

        .vf-photo-in-previous {
          animation: vfSlideInPrevious 280ms cubic-bezier(0.4,0,0.2,1) both;
        }

        .vf-photo-out-next {
          animation: vfSlideOutNext 280ms cubic-bezier(0.4,0,0.2,1) both;
          z-index: 2;
        }

        .vf-photo-out-previous {
          animation: vfSlideOutPrevious 280ms cubic-bezier(0.4,0,0.2,1) both;
          z-index: 2;
        }

        .vf-photo-dismiss {
          animation: vfPhotoDismiss 180ms cubic-bezier(0.4,0,0.2,1) forwards;
        }

        .vf-fullscreen-dots {
          position: fixed;
          left: 50%;
          bottom: 86px;
          transform: translateX(-50%);
          z-index: 9998;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 10px;
        }

        .vf-dot {
          width: 5px;
          height: 5px;
          border: 0;
          border-radius: 999px;
          padding: 0;
          background: rgba(255,255,255,0.3);
          cursor: pointer;
          transition: width 180ms cubic-bezier(0.4,0,0.2,1), height 180ms cubic-bezier(0.4,0,0.2,1), background 180ms cubic-bezier(0.4,0,0.2,1);
        }

        .vf-dot-active {
          width: 8px;
          height: 8px;
          background: #ffffff;
        }

        .vf-thumbnail-strip {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9998;
          height: 70px;
          display: flex;
          align-items: center;
          gap: 6px;
          overflow-x: auto;
          padding: 7px 12px calc(7px + env(safe-area-inset-bottom));
          background: linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0));
          scrollbar-width: none;
        }

        .vf-thumbnail-strip::-webkit-scrollbar {
          display: none;
        }

        .vf-thumbnail {
          flex: 0 0 auto;
          width: 60px;
          height: 56px;
          overflow: hidden;
          border: 0;
          border-radius: 6px;
          padding: 0;
          background: rgba(255,255,255,0.08);
          cursor: pointer;
        }

        .vf-thumbnail-active {
          border: 2px solid #ffffff;
        }

        .vf-thumbnail img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @keyframes vfOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes vfOverlayOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes vfSlideInNext {
          from { transform: translate3d(100%, 0, 0); opacity: 0; }
          to { transform: translate3d(0, 0, 0); opacity: 1; }
        }

        @keyframes vfSlideOutNext {
          from { transform: translate3d(0, 0, 0); opacity: 1; }
          to { transform: translate3d(-100%, 0, 0); opacity: 0; }
        }

        @keyframes vfSlideInPrevious {
          from { transform: translate3d(-100%, 0, 0); opacity: 0; }
          to { transform: translate3d(0, 0, 0); opacity: 1; }
        }

        @keyframes vfSlideOutPrevious {
          from { transform: translate3d(0, 0, 0); opacity: 1; }
          to { transform: translate3d(100%, 0, 0); opacity: 0; }
        }

        @keyframes vfPhotoDismiss {
          from { transform: translate3d(0, 28px, 0) scale(0.97); opacity: 1; }
          to { transform: translate3d(0, 70px, 0) scale(0.86); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .vf-fullscreen,
          .vf-fullscreen-dismissing,
          .vf-photo-in-next,
          .vf-photo-in-previous,
          .vf-photo-out-next,
          .vf-photo-out-previous,
          .vf-photo-dismiss {
            animation-duration: 1ms !important;
          }
        }
      `}</style>
    </div>
  );
}