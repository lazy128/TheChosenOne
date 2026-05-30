import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Film } from "lucide-react";

const TITLE = "CINEMAX";

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [typed, setTyped] = useState("");
  const [progress, setProgress] = useState(0);
  const [exit, setExit] = useState(false);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTyped(TITLE.slice(0, i));
      if (i >= TITLE.length) clearInterval(t);
    }, 110);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const start = performance.now();
    const dur = 2300;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setTimeout(() => setExit(true), 200);
        setTimeout(onDone, 900);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <AnimatePresence>
      {!exit && (
        <motion.div
          initial={{ clipPath: "circle(150% at 50% 50%)" }}
          animate={{ clipPath: "circle(150% at 50% 50%)" }}
          exit={{ clipPath: "circle(0% at 50% 50%)" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-bg-void overflow-hidden"
        >
          <div className="scan-line" />
          <div className="absolute inset-0 grain" />

          {/* Film reel SVG */}
          <motion.div
            initial={{ rotate: 0, scale: 0.9, opacity: 0 }}
            animate={{ rotate: 360, scale: 1, opacity: 1 }}
            transition={{
              rotate: { duration: 3.6, repeat: Infinity, ease: "linear" },
              scale: { duration: 0.6 },
              opacity: { duration: 0.6 },
            }}
            className="text-accent-blood"
          >
            <Film size={84} strokeWidth={1.2} />
          </motion.div>

          <div className="mt-10 font-display text-6xl text-text-primary text-glow-blood tracking-[0.25em]">
            {typed}
            <span className="caret ml-1 inline-block w-[6px] h-12 align-middle bg-accent-blood" />
          </div>

          <div className="mt-10 h-[3px] w-72 overflow-hidden rounded-full bg-bg-elevated">
            <div
              className="h-full bg-gradient-to-r from-accent-blood via-accent-ember to-accent-blood"
              style={{ width: `${progress * 100}%`, boxShadow: "0 0 14px var(--accent-blood)" }}
            />
          </div>

          <div className="mt-4 font-display text-xs tracking-[0.5em] text-text-muted">
            INITIALIZING PROJECTOR…
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
