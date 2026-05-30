import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useLocation, Link } from "@tanstack/react-router";
import { goBackOrHome } from "@/lib/navigation";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { MagneticButton } from "./MagneticButton";
import { BrokenProjector } from "./notfound/BrokenProjector";
import { GlitchDigits } from "./notfound/GlitchDigits";
import { MovieInfoCard } from "./notfound/MovieInfoCard";
import { TerminalBlock } from "./notfound/TerminalBlock";
import { SuggestionStrip } from "./notfound/SuggestionStrip";

export default function NotFoundPage() {
  const router = useRouter();
  const location = useLocation();
  const goBack = () => goBackOrHome(router);
  const browseMovies = () => router.navigate({ to: "/" });
  const [idle, setIdle] = useState(false);
  const [showIdleMsg, setShowIdleMsg] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const reset = () => {
      setIdle(false);
      setShowIdleMsg(false);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setIdle(true);
        setShowIdleMsg(true);
        window.setTimeout(() => setShowIdleMsg(false), 4000);
      }, 8000);
    };
    reset();
    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    window.addEventListener("touchstart", reset);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("keydown", reset);
      window.removeEventListener("touchstart", reset);
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-void text-text-primary">
      {/* Layer 2: TV static */}
      <svg className="pointer-events-none fixed inset-0 h-full w-full" style={{ opacity: 0.04 }} aria-hidden>
        <filter id="tv-static">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" stitchTiles="stitch">
            <animate attributeName="baseFrequency" dur="2s" values="0.65;0.75;0.65" repeatCount="indefinite" />
          </feTurbulence>
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#tv-static)" />
      </svg>

      {/* Layer 3: red spotlight pulse */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[70vh]"
        style={{
          background: "radial-gradient(60% 60% at 50% 0%, rgba(229,9,20,0.12), transparent 70%)",
          animation: "spotlight-pulse 3s ease-in-out infinite",
        }}
        aria-hidden
      />

      {/* Layer 4: grain */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.06] noise-overlay" aria-hidden />

      {/* Layer 5: debris */}
      <Debris />

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 90, damping: 18 }}
        className="relative z-10 mx-auto flex max-w-680px flex-col items-center px-6 py-16 text-center"
      >
        <BrokenProjector wobbleMore={idle} />

        <GlitchDigits />

        <p className="mt-2 font-display text-[1.8rem] tracking-[0.3em] text-text-muted">
          REEL NOT FOUND
        </p>

        <MovieInfoCard />

        <TerminalBlock path={location.pathname} />

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <div className="sm:w-auto">
            <MagneticButton onClick={goBack}>
              ← BACK
            </MagneticButton>
          </div>
          <div className="sm:w-auto">
            <MagneticButton variant="ghost" onClick={browseMovies}>
              <span className="group inline-flex items-center gap-2">
                BROWSE MOVIES
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </MagneticButton>
          </div>
        </div>

        <SuggestionStrip />

        <Link
          to="/login"
          className="mt-10 inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.3em] text-text-muted hover:text-gold"
        >
          <ArrowLeft className="h-3 w-3" /> SIGN IN INSTEAD
        </Link>
      </motion.div>

      {showIdleMsg && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="pointer-events-none fixed inset-x-0 bottom-6 text-center text-sm italic text-text-muted"
        >
          Still here? The credits have rolled.
        </motion.p>
      )}

      {/* Hidden flair: cancelled badge using X icon for screen readers */}
      <span className="sr-only"><X /> Page cancelled.</span>
    </main>
  );
}

function Debris() {
  const items = Array.from({ length: 50 });
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {items.map((_, i) => {
        const left = (i * 37) % 100;
        const rot = ((i * 53) % 360);
        const dur = 12 + ((i * 5) % 18);
        const delay = (i * 0.4) % 14;
        const isGold = i % 5 === 0;
        return (
          <span
            key={i}
            className="absolute bottom-[-10vh] block"
            style={{
              left: `${left}%`,
              width: 2,
              height: 8,
              background: isGold ? "#f5c518" : "#7a0a12",
              animation: `debris-up ${dur}s linear ${delay}s infinite`,
              ["--rot" as any]: `${rot}deg`,
            }}
          />
        );
      })}
    </div>
  );
}
