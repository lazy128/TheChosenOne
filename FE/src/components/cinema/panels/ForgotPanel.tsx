import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { FloatingInput } from "../FloatingInput";
import { MagneticButton } from "../MagneticButton";
import { staggerItem } from "../GlassCard";
import type { AuthMode } from "../LoginPage";

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export function ForgotPanel({ onSwitch }: { onSwitch: (m: AuthMode) => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!emailOk(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1100);
  };

  return (
    <div className="flex flex-col gap-4">
      <motion.button
        variants={staggerItem}
        type="button"
        onClick={() => onSwitch("login")}
        className="group inline-flex w-fit items-center gap-1.5 font-mono text-[10px] tracking-[0.25em] text-text-muted transition-colors duration-200 hover:text-blood"
      >
        <ArrowLeft className="h-3 w-3 transition-transform duration-200 group-hover:-translate-x-1" />
        BACK TO SIGN IN
      </motion.button>

      <motion.h1 variants={staggerItem} className="font-display text-[2.4rem] leading-none">
        RESET ACCESS
      </motion.h1>
      <motion.p variants={staggerItem} className="text-sm text-text-muted leading-relaxed">
        Enter the email tied to your account and we&apos;ll send a reset link.
      </motion.p>
      <motion.div variants={staggerItem} className="h-px w-10 bg-blood" />

      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div variants={staggerItem}>
              <FloatingInput
                label="EMAIL ADDRESS"
                icon={Mail}
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                error={error}
                autoComplete="email"
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <MagneticButton type="submit" loading={loading}>
                <Send className="h-4 w-4" />
                SEND RESET LINK
              </MagneticButton>
            </motion.div>
          </motion.form>
        ) : (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="flex flex-col items-center gap-4 py-4 text-center"
          >
            {/* Animated envelope */}
            <motion.div
              className="relative h-20 w-20"
              initial={{ y: 0 }}
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <div
                className="absolute inset-0 rounded-full bg-green-500/10"
                style={{ animation: "pulse-ring 2s ease-in-out infinite" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 64 64" className="h-14 w-14">
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.9, delay: 0.1, ease: "easeInOut" }}
                    d="M8 18 L32 38 L56 18 M8 18 L8 46 L56 46 L56 18 M8 18 L56 18"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </motion.div>

            <div>
              <p
                className="font-display text-2xl text-green-400"
                style={{ textShadow: "0 0 24px rgba(34,197,94,0.5)" }}
              >
                CHECK YOUR INBOX!
              </p>
              <p className="mt-2 text-sm text-text-muted leading-relaxed">
                If{" "}
                <span className="text-text-primary font-medium">{email}</span>{" "}
                matches an account, the link is on its way.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              type="button"
              onClick={() => onSwitch("login")}
              className="font-mono text-xs tracking-[0.2em] text-gold hover:underline"
            >
              ← RETURN TO SIGN IN
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
