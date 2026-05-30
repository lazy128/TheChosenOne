import { motion, AnimatePresence } from "framer-motion";
import { Check, Eye, EyeOff, AlertCircle, type LucideIcon } from "lucide-react";
import { useId, useState, type InputHTMLAttributes } from "react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  icon: LucideIcon;
  type?: string;
  error?: string | null;
  valid?: boolean;
  showShake?: boolean;
}

export function FloatingInput({
  label,
  icon: Icon,
  type = "text",
  error,
  valid,
  showShake,
  value,
  ...rest
}: Props) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (reveal ? "text" : "password") : type;
  const filled = !!(value && String(value).length > 0);
  const floating = focused || filled;

  const borderColor = focused
    ? "rgba(229,9,20,1)"
    : error
    ? "rgba(229,9,20,0.7)"
    : valid
    ? "rgba(34,197,94,0.5)"
    : "rgba(255,255,255,0.08)";

  const glowStyle = focused
    ? { boxShadow: "0 0 0 3px rgba(229,9,20,0.12), 0 0 24px rgba(229,9,20,0.2)" }
    : error
    ? { boxShadow: "0 0 0 2px rgba(229,9,20,0.1)" }
    : valid
    ? { boxShadow: "0 0 0 2px rgba(34,197,94,0.08)" }
    : {};

  return (
    <motion.div
      animate={showShake ? { x: [0, -8, 8, -6, 6, -4, 0] } : { x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <div
        className="relative flex items-center rounded-lg bg-black/40 transition-all duration-200"
        style={{ border: `1px solid ${borderColor}`, ...glowStyle }}
      >
        {/* Left icon */}
        <Icon
          className={`ml-3.5 h-4 w-4 shrink-0 transition-colors duration-200 ${
            focused ? "text-blood" : error ? "text-blood/70" : valid ? "text-green-400" : "text-text-muted"
          }`}
        />

        {/* Floating label */}
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-10 origin-left transition-all duration-200"
          style={{
            top: floating ? "6px" : "50%",
            transform: floating ? "none" : "translateY(-50%)",
            fontSize: floating ? "9px" : "13px",
            letterSpacing: floating ? "0.18em" : "0.05em",
            color: floating ? (error ? "rgba(229,9,20,0.9)" : valid ? "rgba(34,197,94,0.9)" : "rgba(229,9,20,0.8)") : "var(--text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          {label}
        </label>

        {/* Input */}
        <input
          id={id}
          type={inputType}
          value={value}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          {...rest}
          className="w-full bg-transparent pb-2.5 pl-10 pr-3 pt-6 text-sm text-text-primary outline-none placeholder:text-transparent"
        />

        {/* Right icons */}
        <div className="mr-2.5 flex items-center gap-1">
          <AnimatePresence>
            {valid && !error && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="grid h-5 w-5 place-items-center rounded-full bg-green-500/15 text-green-400"
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </motion.span>
            )}
            {error && !focused && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="grid h-5 w-5 place-items-center text-blood/80"
              >
                <AlertCircle className="h-4 w-4" />
              </motion.span>
            )}
          </AnimatePresence>
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setReveal((r) => !r)}
              className="rounded p-0.5 text-text-muted transition-colors duration-150 hover:text-text-primary"
              aria-label={reveal ? "Hide password" : "Show password"}
            >
              {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -4 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-blood/90">
              <span className="inline-block h-1 w-1 rounded-full bg-blood" />
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
