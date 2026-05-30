import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { FloatingInput } from "../FloatingInput";
import { MagneticButton } from "../MagneticButton";
import { SocialButtons } from "../SocialButtons";
import { staggerItem } from "../GlassCard";
import type { AuthMode } from "../LoginPage";
import { authApi } from "@/lib/cinema-api";

const accountOk = (e: string) => e.trim().length >= 1;

export function LoginPanel({ onSwitch }: { onSwitch: (m: AuthMode) => void }) {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ account?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ account?: boolean; password?: boolean }>({});
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState<{ account?: boolean; password?: boolean }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = () => {
    const e: typeof errors = {};
    if (!accountOk(account)) e.account = "Enter your email or username.";
    if (password.length < 1) e.password = "Enter your password.";
    return e;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setTouched({ account: true, password: true });
    setSubmitError(null);
    if (Object.keys(e).length) {
      setShake({ account: !!e.account, password: !!e.password });
      setTimeout(() => setShake({}), 450);
      return;
    }
    try {
      if (remember) {
        localStorage.setItem("cinemax_remember_account", account);
      } else {
        localStorage.removeItem("cinemax_remember_account");
      }

      setLoading(true);
      await authApi.dangNhapVaLayThongTin(account, password);
      // Redirect to home after successful login
      window.location.href = "/";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign in failed.";
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cinemax_remember_account");
      if (saved) {
        setAccount(saved);
        setRemember(true);
      }
    } catch {}
  }, []);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <motion.div variants={staggerItem}>
        <FloatingInput
          label="EMAIL OR USERNAME"
          icon={Mail}
          type="text"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, account: true }))}
          error={touched.account ? errors.account : null}
          valid={touched.account && !errors.account && accountOk(account)}
          showShake={shake.account}
          autoComplete="username"
        />
      </motion.div>
      <motion.div variants={staggerItem}>
        <FloatingInput
          label="PASSWORD"
          icon={Lock}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={touched.password ? errors.password : null}
          valid={touched.password && !errors.password && password.length >= 6}
          showShake={shake.password}
          autoComplete="current-password"
        />
      </motion.div>

      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <RememberCheckbox checked={remember} onChange={setRemember} />
        <button
          type="button"
          onClick={() => onSwitch("forgot")}
          className="group relative font-mono text-[10px] tracking-[0.15em] text-gold"
        >
          FORGOT PASSWORD?
          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
        </button>
      </motion.div>

      <motion.div variants={staggerItem} className="mt-2">
        <MagneticButton type="submit" loading={loading}>SIGN IN</MagneticButton>
        {submitError && <p className="mt-2 text-sm text-blood">{submitError}</p>}
      </motion.div>

      <motion.div variants={staggerItem} className="my-3 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/8" />
        <span className="font-mono text-[9px] tracking-[0.3em] text-text-muted">
          OR CONTINUE WITH
        </span>
        <div className="h-px flex-1 bg-white/8" />
      </motion.div>

      <motion.div variants={staggerItem}>
        <SocialButtons />
      </motion.div>

      <motion.p variants={staggerItem} className="mt-3 text-center text-sm text-text-muted">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => onSwitch("register")}
          className="group text-blood"
        >
          Create one{" "}
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </button>
      </motion.p>
    </form>
  );
}

function RememberCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (b: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-text-muted select-none">
      {/* Visual box + hidden input overlaid on top */}
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        {/* Custom visual */}
        <span
          className={`absolute inset-0 rounded border transition-all duration-200 flex items-center justify-center ${
            checked ? "border-blood bg-blood" : "border-white/20 bg-black/40"
          }`}
        >
          {checked && (
            <svg viewBox="0 0 16 16" className="h-3 w-3">
              <motion.path
                d="M3 8.5l3 3 7-7"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.2 }}
              />
            </svg>
          )}
        </span>
        {/* Real input overlaid, fully transparent but clickable */}
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-10"
        />
      </span>
      <span className="font-mono text-[10px] tracking-[0.2em]">REMEMBER ME</span>
    </label>
  );
}

