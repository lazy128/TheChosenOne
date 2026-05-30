import { motion, AnimatePresence } from "framer-motion";

const labels = ["Weak", "Fair", "Good", "Strong"];
const colors = ["#e50914", "#ff6b35", "#f5c518", "#22c55e"];
const labelColors = ["text-blood", "text-[#ff6b35]", "text-gold", "text-green-400"];

export function scorePassword(pw: string): number {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

export function PasswordStrength({ password }: { password: string }) {
  const score = scorePassword(password);
  const hasInput = password.length > 0;
  const label = hasInput ? labels[Math.max(0, score - 1)] : null;

  return (
    <div className="mt-2.5 px-0.5">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
            <motion.div
              animate={{
                width: hasInput && i < score ? "100%" : "0%",
                opacity: hasInput && i < score ? 1 : 0,
              }}
              transition={{ duration: 0.35, ease: "easeOut", delay: i * 0.05 }}
              style={{ background: colors[Math.max(0, score - 1)] }}
              className="h-full rounded-full"
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <p className="font-mono text-[9px] tracking-[0.2em] text-text-muted">
          PASSWORD STRENGTH
        </p>
        <AnimatePresence mode="wait">
          {label && (
            <motion.p
              key={label}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18 }}
              className={`font-mono text-[9px] tracking-[0.15em] font-bold ${labelColors[Math.max(0, score - 1)]}`}
            >
              {label.toUpperCase()}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
