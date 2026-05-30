import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: "primary" | "ghost";
  className?: string;
}

export function MagneticButton({
  children,
  onClick,
  loading,
  disabled,
  type = "button",
  variant = "primary",
  className = "",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const btn = btnRef.current;
    if (!wrap || !btn) return;

    const onMove = (e: MouseEvent) => {
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      // spotlight
      const lx = ((e.clientX - r.left) / r.width) * 100;
      btn.style.setProperty("--mx", `${lx}%`);
      // magnetic only when close to button bounds
      const expandedDist = Math.max(0, dist - Math.max(r.width, r.height) / 2);
      if (expandedDist < 60) {
        btn.style.transform = `translate(${dx * 0.15}px, ${dy * 0.15}px)`;
      } else {
        btn.style.transform = "translate(0,0)";
      }
    };
    const onLeave = () => {
      btn.style.transform = "translate(0,0)";
    };
    wrap.addEventListener("mousemove", onMove);
    wrap.addEventListener("mouseleave", onLeave);
    return () => {
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const base =
    "relative w-full overflow-hidden rounded-lg px-6 py-3.5 font-display text-[1.15rem] tracking-[0.18em] transition-all duration-200 will-change-transform active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed";
  const primary =
    "bg-blood text-white hover:scale-[1.02] hover:shadow-[0_0_48px_rgba(229,9,20,0.55),0_0_100px_rgba(229,9,20,0.2)]";
  const ghost =
    "border border-blood/40 bg-transparent text-text-primary hover:bg-blood/10 hover:border-blood hover:shadow-[0_0_24px_rgba(229,9,20,0.2)]";

  return (
    <div ref={wrapRef} className={`relative ${className}`} style={{ padding: 20, margin: -20 }}>
      <button
        ref={btnRef}
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`${base} ${variant === "primary" ? primary : ghost}`}
      >
        {/* Spotlight overlay */}
        {variant === "primary" && (
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(160px circle at var(--mx, 50%) 50%, rgba(255,255,255,0.22), transparent 60%)",
            }}
          />
        )}
        {/* Shimmer on primary */}
        {variant === "primary" && !loading && (
          <span
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity hover:opacity-100"
            style={{
              background:
                "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)",
            }}
          />
        )}
        <span className="relative z-10 inline-flex items-center justify-center gap-2">
          {loading ? (
            <span className="inline-flex items-center gap-1.5">
              {[0, 0.15, 0.3].map((delay, i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-white"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay }}
                />
              ))}
            </span>
          ) : (
            children
          )}
        </span>
      </button>
    </div>
  );
}
