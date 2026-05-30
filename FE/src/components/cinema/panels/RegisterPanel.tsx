import { motion } from "framer-motion";
import { Mail, Lock, User, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { FloatingInput } from "../FloatingInput";
import { MagneticButton } from "../MagneticButton";
import { PasswordStrength, scorePassword } from "../PasswordStrength";
import { staggerItem } from "../GlassCard";
import type { AuthMode } from "../LoginPage";
import { authApi } from "@/lib/cinema-api";

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export function RegisterPanel({ onSwitch }: { onSwitch: (m: AuthMode) => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Tell us your name.";
    if (!emailOk(form.email)) e.email = "Enter a valid email.";
    if (form.phone && form.phone.replace(/\D/g, "").length < 7)
      e.phone = "That number looks off.";
    if (scorePassword(form.password) < 2) e.password = "Make it stronger.";
    if (form.confirm !== form.password) e.confirm = "Passwords don't match.";
    if (!terms) e.terms = "Accept the terms to continue.";
    return e;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setTouched({ name: true, email: true, phone: true, password: true, confirm: true });
    setSubmitError(null);
    setSubmitSuccess(null);
    if (Object.keys(e).length) {
      const shakeFields: Record<string, boolean> = {};
      Object.keys(e).forEach((k) => { if (k !== "terms") shakeFields[k] = true; });
      setShake(shakeFields);
      setTimeout(() => setShake({}), 450);
      return;
    }
    try {
      setLoading(true);
      await authApi.dangKy({
        email: form.email,
        matKhau: form.password,
        hoTen: form.name,
        soDt: form.phone || "0000000000",
        taiKhoan: form.email.split("@")[0],
        maNhom: "GP00",
      });
      setSubmitSuccess("Create account successfully. You can sign in now.");
      setForm({ name: "", email: "", phone: "", password: "", confirm: "" });
      setTerms(false);
      // Auto-switch to login panel after brief delay
      setTimeout(() => onSwitch("login"), 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Register failed.";
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <motion.div variants={staggerItem}>
        <FloatingInput
          label="FULL NAME"
          icon={User}
          value={form.name}
          onChange={set("name")}
          onBlur={blur("name")}
          error={touched.name ? errors.name : null}
          valid={touched.name && !errors.name && form.name.length > 1}
          showShake={shake.name}
          autoComplete="name"
        />
      </motion.div>
      <motion.div variants={staggerItem}>
        <FloatingInput
          label="EMAIL"
          icon={Mail}
          type="email"
          value={form.email}
          onChange={set("email")}
          onBlur={blur("email")}
          error={touched.email ? errors.email : null}
          valid={touched.email && !errors.email && emailOk(form.email)}
          showShake={shake.email}
          autoComplete="email"
        />
      </motion.div>
      <motion.div variants={staggerItem}>
        <FloatingInput
          label="PHONE (OPTIONAL)"
          icon={Phone}
          type="tel"
          value={form.phone}
          onChange={set("phone")}
          onBlur={blur("phone")}
          error={touched.phone ? errors.phone : null}
          valid={!!form.phone && !errors.phone && touched.phone}
          autoComplete="tel"
        />
      </motion.div>
      <motion.div variants={staggerItem}>
        <FloatingInput
          label="PASSWORD"
          icon={Lock}
          type="password"
          value={form.password}
          onChange={set("password")}
          onBlur={blur("password")}
          error={touched.password ? errors.password : null}
          showShake={shake.password}
          autoComplete="new-password"
        />
        <PasswordStrength password={form.password} />
      </motion.div>
      <motion.div variants={staggerItem}>
        <FloatingInput
          label="CONFIRM PASSWORD"
          icon={Lock}
          type="password"
          value={form.confirm}
          onChange={set("confirm")}
          onBlur={blur("confirm")}
          error={touched.confirm ? errors.confirm : null}
          valid={touched.confirm && !errors.confirm && form.confirm.length > 0}
          showShake={shake.confirm}
          autoComplete="new-password"
        />
      </motion.div>

      {/* Terms checkbox */}
      <motion.div
        variants={staggerItem}
        className="flex cursor-pointer items-start gap-2.5 select-none"
        onClick={() => setTerms((v) => !v)}
      >
        {/* Visual box with input overlaid */}
        <span className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
          <span
            className={`absolute inset-0 rounded border transition-all duration-200 flex items-center justify-center ${
              terms
                ? "border-blood bg-blood"
                : errors.terms && touched.password
                ? "border-blood/60 bg-black/40"
                : "border-white/20 bg-black/40"
            }`}
          >
            {terms && (
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
          {/* Real input overlaid — transparent but receives clicks */}
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-10"
          />
        </span>
        <div className="text-xs text-text-muted leading-relaxed">
          I agree to the{" "}
          <span className="text-gold">Terms</span>
          {" "}and{" "}
          <span className="text-gold">Privacy Policy</span>.
          {errors.terms && touched.password && (
            <span className="ml-1 text-blood"> {errors.terms}</span>
          )}
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="mt-1">
        <MagneticButton type="submit" loading={loading}>CREATE ACCOUNT</MagneticButton>
        {submitError && <p className="mt-2 text-sm text-blood">{submitError}</p>}
        {submitSuccess && <p className="mt-2 text-sm text-emerald-400">{submitSuccess}</p>}
      </motion.div>

      <motion.p variants={staggerItem} className="mt-2 text-center text-sm text-text-muted">
        Already have an account?{" "}
        <button type="button" onClick={() => onSwitch("login")} className="group text-blood">
          Sign in{" "}
          <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </button>
      </motion.p>
    </form>
  );
}
