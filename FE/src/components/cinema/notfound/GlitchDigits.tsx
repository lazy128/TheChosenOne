import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function GlitchDigits() {
  const digits = ["4", "0", "4"];
  const [glitch, setGlitch] = useState<number[]>([0, 0, 0]);

  useEffect(() => {
    let cancelled = false;
    const schedule = () => {
      const wait = 3000 + Math.random() * 5000;
      window.setTimeout(() => {
        if (cancelled) return;
        setGlitch([Math.random() * 8 - 4, Math.random() * 8 - 4, Math.random() * 8 - 4]);
        window.setTimeout(() => {
          if (cancelled) return;
          setGlitch([0, 0, 0]);
          schedule();
        }, 200);
      }, wait);
    };
    schedule();
    return () => { cancelled = true; };
  }, []);

  return (
    <h1 className="relative mt-6 flex items-baseline justify-center font-display leading-none">
      {digits.map((d, i) => (
        <motion.span
          key={i}
          initial={{ y: -60, scale: 0.5, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 * i, type: "spring", stiffness: 120, damping: 12 }}
          style={{
            color: "#e50914",
            fontSize: "min(20vw, 220px)",
            textShadow: "0 0 60px rgba(229,9,20,0.6), 4px 4px 0 rgba(229,9,20,0.2)",
            transform: `translateX(${glitch[i]}px)`,
            transition: "transform 60ms steps(2,end)",
            display: "inline-block",
          }}
        >
          {d}
        </motion.span>
      ))}
    </h1>
  );
}
