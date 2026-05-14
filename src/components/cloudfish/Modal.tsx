import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 380,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: "rgba(2,4,10,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: width,
          background: "rgba(15,18,28,0.95)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 22,
          boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
          fontFamily: '"Inter", sans-serif',
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.95)" }}>
          {title}
        </div>
        {children && (
          <div style={{ fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>
            {children}
          </div>
        )}
        {footer && <div className="mt-5 flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function ModalButton({
  children,
  onClick,
  variant = "ghost",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
}) {
  const styles: React.CSSProperties =
    variant === "primary"
      ? { background: "#4d90fe", color: "#fff", border: "1px solid transparent" }
      : variant === "danger"
      ? { background: "#f87171", color: "#fff", border: "1px solid transparent" }
      : { background: "transparent", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" };
  return (
    <button
      onClick={onClick}
      style={{
        ...styles,
        fontFamily: '"Inter", sans-serif',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        padding: "8px 16px",
        borderRadius: 10,
        transition: "all 200ms ease",
      }}
    >
      {children}
    </button>
  );
}
