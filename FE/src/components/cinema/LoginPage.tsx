import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { goBackOrHome } from "@/lib/navigation";
import { ArrowLeft } from "lucide-react";
import { CinemaxLogo } from "@/components/CinemaxLogo";
import { GradientMesh } from "./GradientMesh";
import { FilmStrip } from "./FilmStrip";
import { PosterStack } from "./PosterStack";
import { QuoteOverlay } from "./QuoteOverlay";
import { EmberParticles } from "./EmberParticles";
import { GlassCard, staggerItem } from "./GlassCard";
import { LoginPanel } from "./panels/LoginPanel";
import { RegisterPanel } from "./panels/RegisterPanel";
import { ForgotPanel } from "./panels/ForgotPanel";

export type AuthMode = "login" | "register" | "forgot";

const slideVariants = {
  enterRight: { opacity: 0, x: 32, filter: "blur(4px)" },
  enterLeft:  { opacity: 0, x: -32, filter: "blur(4px)" },
  center:     { opacity: 1, x: 0, filter: "blur(0px)" },
  exitLeft:   { opacity: 0, x: -32, filter: "blur(4px)" },
  exitRight:  { opacity: 0, x: 32, filter: "blur(4px)" },
};

const ORDER: AuthMode[] = ["login", "register", "forgot"];

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [prevMode, setPrevMode] = useState<AuthMode>("login");
  const router = useRouter();
  const goBack = () => goBackOrHome(router);

  const switchMode = (next: AuthMode) => {
    setPrevMode(mode);
    setMode(next);
  };

  const isForward = ORDER.indexOf(mode) >= ORDER.indexOf(prevMode);

  return (
    <main className="relative h-screen w-full overflow-hidden bg-void">
      {/* LEFT PANEL */}
      <motion.section
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-y-0 left-0 hidden w-[55%] md:block"
      >
        <GradientMesh />
        <FilmStrip />
        <EmberParticles count={40} />

        <div className="absolute inset-0 flex items-center justify-center pl-12">
          <PosterStack />
        </div>

        <QuoteOverlay />

        {/* right-edge vignette into form panel */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-32"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(229,9,20,0.25) 60%, #0d0d14)",
          }}
          aria-hidden
        />
      </motion.section>

      {/* Mobile top poster strip */}
      <div className="absolute left-0 right-0 top-0 z-10 h-[100px] overflow-hidden md:hidden">
        <GradientMesh />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-2">
            {["a", "b", "c", "d"].map((s, i) => (
              <img
                key={s}
                src={`https://picsum.photos/seed/strip-${s}/120/180`}
                alt=""
                loading="lazy"
                className="h-[80px] w-[55px] rounded object-cover shadow-[0_10px_30px_rgba(229,9,20,0.4)]"
                style={{ transform: `rotate(${(i - 1.5) * 4}deg)` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <motion.section
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-y-0 right-0 z-20 flex w-full flex-col items-center justify-center overflow-y-auto bg-surface px-6 py-8 pt-[110px] md:w-[45%] md:pt-0 scrollbar-hide"
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] noise-overlay" aria-hidden />

        {/* Subtle scan line decoration */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
          }}
          aria-hidden
        />

        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 110, damping: 18, delay: 0.2 }}
          className="relative w-full max-w-md"
        >
          {/* Back button */}
          <div className="absolute -top-12 left-0">
            <button
              onClick={goBack}
              className="group inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-text-muted transition-colors duration-200 hover:text-blood"
            >
              <ArrowLeft className="h-3 w-3 transition-transform duration-200 group-hover:-translate-x-1" />
              HOME
            </button>
          </div>

          {/* Mode tab switcher (login / register only) */}
          {mode !== "forgot" && (
            <div className="mb-5 flex gap-1 rounded-lg bg-black/40 p-1 border border-white/5">
              {(["login", "register"] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className="relative flex-1 rounded-md py-2 font-mono text-[10px] tracking-[0.25em] transition-colors duration-200"
                  style={{ color: mode === m ? "white" : "var(--text-muted)" }}
                >
                  {mode === m && (
                    <motion.span
                      layoutId="auth-tab-pill"
                      className="absolute inset-0 rounded-md bg-blood"
                      style={{ originX: 0.5 }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">
                    {m === "login" ? "SIGN IN" : "REGISTER"}
                  </span>
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait" custom={isForward}>
            {mode === "login" && (
              <motion.div
                key="login"
                custom={isForward}
                variants={slideVariants}
                initial="enterLeft"
                animate="center"
                exit="exitLeft"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <GlassCard>
                  <motion.div variants={staggerItem} className="mb-5">
                    <CinemaxLogo />
                  </motion.div>
                  <motion.div variants={staggerItem}>
                    <h1 className="font-display text-[2.6rem] leading-none text-text-primary">
                      WELCOME BACK
                    </h1>
                  </motion.div>
                  <motion.p variants={staggerItem} className="mt-2 text-sm text-text-muted">
                    Sign in to book your next experience
                  </motion.p>
                  <motion.div
                    variants={staggerItem}
                    className="my-4 h-px w-10 bg-blood"
                  />
                  <LoginPanel onSwitch={switchMode} />
                </GlassCard>
              </motion.div>
            )}
            {mode === "register" && (
              <motion.div
                key="register"
                custom={isForward}
                variants={slideVariants}
                initial="enterRight"
                animate="center"
                exit="exitRight"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <GlassCard>
                  <motion.div variants={staggerItem} className="mb-5">
                    <CinemaxLogo />
                  </motion.div>
                  <motion.div variants={staggerItem}>
                    <h1 className="font-display text-[2.6rem] leading-none text-text-primary">
                      JOIN CINEMAX
                    </h1>
                  </motion.div>
                  <motion.p variants={staggerItem} className="mt-2 text-sm text-text-muted">
                    Reserve your seat. The lobby is open.
                  </motion.p>
                  <motion.div variants={staggerItem} className="my-4 h-px w-10 bg-blood" />
                  <RegisterPanel onSwitch={switchMode} />
                </GlassCard>
              </motion.div>
            )}
            {mode === "forgot" && (
              <motion.div
                key="forgot"
                variants={slideVariants}
                initial="enterRight"
                animate="center"
                exit="exitRight"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <GlassCard>
                  <ForgotPanel onSwitch={switchMode} />
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.section>
    </main>
  );
}
