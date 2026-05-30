import { motion } from "framer-motion";
import { Film } from "lucide-react";

type Props = {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md";
};

export function CinemaxLogo({ className = "", iconOnly = false, size = "md" }: Props) {
  const iconSize = size === "sm" ? 28 : 34;
  const filmIconSize = size === "sm" ? 16 : 20;
  const text = size === "sm" ? "text-xl" : "text-2xl";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <motion.span
        className="relative grid shrink-0 place-items-center rounded-full border border-accent-blood/40 bg-accent-blood/10"
        style={{ width: iconSize, height: iconSize }}
        whileHover={{ rotate: 360 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
      >
        <Film
          style={{ width: filmIconSize, height: filmIconSize }}
          className="text-accent-blood"
        />
      </motion.span>
      {!iconOnly && (
        <span className={`font-display tracking-[0.2em] text-text-primary ${text}`}>
          CINE<span className="text-accent-blood">MAX</span>
        </span>
      )}
    </span>
  );
}
