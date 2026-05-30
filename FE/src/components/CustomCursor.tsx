import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState<"default" | "button" | "card">("default");
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 180, damping: 22, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 180, damping: 22, mass: 0.6 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine)");
    setEnabled(mq.matches);
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as HTMLElement | null;
      const v = target?.closest("[data-cursor]") as HTMLElement | null;
      const next = (v?.dataset.cursor as any) ?? "default";
      setVariant(next === "button" || next === "card" ? next : "default");
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);

  if (!enabled) return null;

  const ringSize = variant === "button" ? 56 : variant === "card" ? 44 : 30;
  return (
    <>
      <motion.div
        style={{
          translateX: ringX,
          translateY: ringY,
          width: ringSize,
          height: ringSize,
        }}
        animate={{
          backgroundColor:
            variant === "button" ? "rgba(229,9,20,0.25)" : "rgba(229,9,20,0)",
          borderColor:
            variant === "card" ? "rgba(245,197,24,0.9)" : "rgba(229,9,20,0.9)",
        }}
        transition={{ duration: 0.18 }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 mix-blend-difference"
      />
      <motion.div
        style={{ translateX: x, translateY: y }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-blood"
      />
    </>
  );
}
