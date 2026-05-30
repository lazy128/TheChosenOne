import { motion } from "framer-motion";
import { X } from "lucide-react";

export function MovieInfoCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mt-10 w-full rounded-xl border bg-surface/60 p-6 text-left backdrop-blur-xl"
      style={{
        borderColor: "rgba(229,9,20,0.2)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
        animation: "wobble-tiny 6s ease-in-out infinite",
      }}
    >
      <p className="font-mono text-[10px] tracking-[0.3em] text-gold">
        THE PAGE YOU REQUESTED
      </p>
      <p className="mt-3 font-mono text-xs tracking-wider text-text-muted">
        GENRE: <span className="text-text-primary">Missing</span> &nbsp;•&nbsp;
        RUNTIME: <span className="text-text-primary">0 min</span> &nbsp;•&nbsp;
        RATING: <span className="text-text-primary">☆ 0.0</span>
      </p>
      <p className="mt-3 text-sm leading-relaxed text-text-muted">
        This page was either deleted, moved, or was simply a terrible idea
        from the start. Critics gave it zero stars. The director has gone
        into hiding.
      </p>
      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blood px-3 py-1 text-[10px] font-semibold tracking-[0.25em] text-white"
        style={{ animation: "slow-pulse 2s ease-in-out infinite" }}>
        <X className="h-3 w-3" /> CANCELLED
      </div>
    </motion.div>
  );
}
