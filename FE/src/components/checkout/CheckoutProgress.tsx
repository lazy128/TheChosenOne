import { Fragment } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

const STEP_KEYS = ["details", "payment", "confirm"] as const;

export function CheckoutProgress({
  step,
  confirmed,
}: {
  step: 1 | 2 | 3;
  confirmed?: boolean;
}) {
  const { t } = useLocale();
  const displayStep = confirmed ? 4 : step;

  return (
    <div className="relative mt-8 w-full">
      <div className="flex items-center">
        {STEP_KEYS.map((key, i) => {
          const n = i + 1;
          const done = displayStep > n;
          const active = displayStep === n;
          const label = t(`checkout.steps.${key}`);

          return (
            <Fragment key={key}>
              {i > 0 && (
                <div className="relative mx-1 h-1 min-w-[28px] flex-1 sm:mx-2">
                  <div className="absolute inset-0 rounded-full bg-white/10" />
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-accent-blood shadow-[0_0_12px_rgba(229,9,20,0.5)]"
                    initial={false}
                    animate={{ width: displayStep > n ? "100%" : "0%" }}
                    transition={{ type: "spring", stiffness: 160, damping: 22 }}
                  />
                </div>
              )}
              <div className="relative z-10 flex shrink-0 flex-col items-center gap-1.5">
                <motion.div
                  animate={
                    active && !confirmed
                      ? { boxShadow: ["0 0 0 0 rgba(229,9,20,0.55)", "0 0 0 10px rgba(229,9,20,0)"] }
                      : {}
                  }
                  transition={{ duration: 1.4, repeat: active && !confirmed ? Infinity : 0 }}
                  className={`grid h-10 w-10 place-items-center rounded-full font-display text-sm transition-colors ${
                    done || confirmed
                      ? "bg-accent-blood text-white shadow-[0_0_16px_rgba(229,9,20,0.55)]"
                      : active
                        ? "bg-accent-blood text-white ring-2 ring-accent-ember shadow-[0_0_20px_rgba(229,9,20,0.5)]"
                        : "bg-white/10 text-text-muted ring-1 ring-white/20"
                  }`}
                >
                  {done || (confirmed && n <= 3) ? <Check size={16} strokeWidth={2.5} /> : n}
                </motion.div>
                <span
                  className={`max-w-[72px] text-center font-display text-[9px] leading-tight tracking-[0.15em] sm:max-w-none sm:text-[10px] sm:tracking-[0.2em] ${
                    done || confirmed
                      ? "text-accent-blood"
                      : active
                        ? "text-accent-ember"
                        : "text-text-muted"
                  }`}
                >
                  {label.toUpperCase()}
                </span>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
