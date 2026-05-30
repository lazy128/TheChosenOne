import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export function GlassCard({
  children,
  className = "",
  scrollable = false,
}: {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={`relative w-full max-w-md rounded-2xl border bg-surface/60 backdrop-blur-2xl ${scrollable ? "max-h-[80vh] overflow-y-auto scrollbar-hide" : ""} ${className}`}
      style={{
        borderColor: "rgba(229,9,20,0.15)",
        boxShadow:
          "0 0 80px rgba(229,9,20,0.06), 0 0 200px rgba(229,9,20,0.03), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Top glow line */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-px rounded-t-2xl"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(229,9,20,0.6) 50%, transparent)",
        }}
        aria-hidden
      />
      <div className="p-8">{children}</div>
    </motion.div>
  );
}
