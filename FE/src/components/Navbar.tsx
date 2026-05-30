import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Menu, X, Volume2, VolumeX, Shield, LogOut } from "lucide-react";
import { useSound } from "@/hooks/useSound";
import { useBooking } from "@/context/BookingContext";
import { useLocale } from "@/context/LocaleContext";
import { CinemaxLogo } from "./CinemaxLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { TicketsModal } from "./TicketsModal";

const NAV_LINKS = [
  { key: "nowShowing" as const, pageIdx: 1 },
  { key: "comingSoon" as const, pageIdx: 2 },
  { key: "offers" as const, pageIdx: 3 },
] as const;

type CurrentUser = {
  maLoaiNguoiDung?: string;
  hoTen?: string;
};

interface NavbarProps {
  currentPage?: number;
  onNavigate?: (idx: number) => void;
}

export function Navbar({ currentPage = 0, onNavigate }: NavbarProps) {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 60], ["rgba(5,5,8,0)", "rgba(13,13,20,0.8)"]);
  const border = useTransform(scrollY, [0, 60], ["rgba(229,9,20,0)", "rgba(229,9,20,0.35)"]);
  const [open, setOpen] = useState(false);
  const [ticketsOpen, setTicketsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const { muted, toggleMute } = useSound();
  const { state, dispatch } = useBooking();
  const { t } = useLocale();
  const navigate = useNavigate();
  const cartCount = state.selectedSeats.length;

  useEffect(() => {
    try {
      const raw = localStorage.getItem("currentUser");
      if (!raw) {
        setIsAdmin(false);
        setUser(null);
        return;
      }
      const u = JSON.parse(raw) as CurrentUser;
      setUser(u);
      setIsAdmin(u.maLoaiNguoiDung === "QuanTri");
    } catch {
      setIsAdmin(false);
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    navigate({ to: "/" });
    window.location.reload();
  };

  const links = useMemo(
    () =>
      NAV_LINKS.map((l) => ({
        ...l,
        label: t(`nav.${l.key}`),
      })),
    [t],
  );

  const goToPage = useCallback(
    (idx: number) => {
      if (state.stage !== "browse") dispatch({ type: "GO_BROWSE" });
      onNavigate?.(idx);
      setOpen(false);
    },
    [state.stage, dispatch, onNavigate],
  );

  const goHome = useCallback(() => {
    if (state.stage !== "browse") dispatch({ type: "GO_BROWSE" });
    onNavigate?.(0);
    setOpen(false);
  }, [state.stage, dispatch, onNavigate]);

  return (
    <>
      <motion.header
        style={{ backgroundColor: bg, borderBottomColor: border }}
        className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 lg:px-10">
          <motion.button
            type="button"
            onClick={goHome}
            className="flex shrink-0 items-center"
            data-cursor="button"
            aria-label="CINEMAX home"
          >
            <CinemaxLogo size="md" />
          </motion.button>

          <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
            {links.map((l) => (
              <button
                key={l.key}
                type="button"
                data-cursor="button"
                onClick={() => goToPage(l.pageIdx)}
                className="group relative font-display text-sm tracking-[0.2em] text-text-primary/85 transition hover:text-text-primary"
              >
                <span className={currentPage === l.pageIdx ? "text-accent-ember" : ""}>{l.label}</span>
                <span
                  className="absolute -bottom-1 left-0 h-px bg-accent-blood transition-all duration-300"
                  style={{ width: currentPage === l.pageIdx ? "100%" : "0%" }}
                />
              </button>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="font-display text-sm tracking-[0.2em] text-accent-ember transition hover:text-text-primary"
              >
                ADMIN
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher className="hidden sm:flex" />
            <button
              data-cursor="button"
              type="button"
              onClick={() => goToPage(1)}
              className="hidden rounded-full p-2 text-text-primary/80 transition hover:text-text-primary md:block"
              aria-label={t("nav.searchMovies")}
            >
              <Search size={18} />
            </button>
            <button
              data-cursor="button"
              type="button"
              onClick={toggleMute}
              className="hidden rounded-full p-2 text-text-primary/80 transition hover:text-text-primary md:block"
              aria-label={muted ? t("nav.soundOff") : t("nav.soundOn")}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button
              data-cursor="button"
              type="button"
              onClick={() => {
                if (state.stage === "checkout") return;
                if (state.stage === "seats") {
                  dispatch({ type: "GO_CHECKOUT" });
                  return;
                }
                if (state.selectedSeats.length > 0) {
                  dispatch({ type: "GO_SEATS" });
                }
              }}
              className="relative hidden rounded-full p-2 text-text-primary/80 transition hover:text-text-primary md:block"
              aria-label={t("nav.viewBooking")}
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent-blood px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden h-8 w-8 place-items-center rounded-full border border-accent-ember/50 bg-accent-ember/10 text-accent-ember md:grid"
                data-cursor="button"
                aria-label="Admin Dashboard"
              >
                <Shield size={14} />
              </Link>
            )}
            {user ? (
              <div className="hidden md:flex items-center gap-2 relative group">
                <button
                  onClick={() => setTicketsOpen(true)}
                  className="flex h-8 items-center gap-2 rounded-full bg-gradient-to-br from-accent-blood to-accent-ember px-3 transition-transform hover:scale-105"
                  data-cursor="button"
                >
                  <User size={14} className="text-white" />
                  <span className="text-[10px] font-medium text-white">{user.hoTen?.split(' ').pop()}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-text-muted transition hover:bg-accent-blood hover:text-white"
                  title="Đăng xuất"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-accent-blood to-accent-ember md:grid"
                data-cursor="button"
              >
                <User size={14} className="text-white" />
              </Link>
            )}
            <button data-cursor="button" type="button" onClick={() => setOpen(true)} className="text-text-primary lg:hidden">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
            className="fixed inset-0 z-60 lg:hidden"
            style={{
              background: "radial-gradient(ellipse at top right, rgba(229,9,20,0.35), rgba(5,5,8,0.95) 60%)",
              backdropFilter: "blur(18px)",
            }}
          >
            <div className="flex items-center justify-between px-6 py-5">
              <CinemaxLogo size="sm" />
              <button data-cursor="button" type="button" onClick={() => setOpen(false)} className="text-text-primary">
                <X size={26} />
              </button>
            </div>
            <div className="px-8">
              <LanguageSwitcher />
            </div>
            <ul className="mt-8 flex flex-col gap-6 px-8">
              {links.map((l, i) => (
                <motion.li
                  key={l.key}
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.08 * i + 0.1 }}
                >
                  <button
                    type="button"
                    onClick={() => goToPage(l.pageIdx)}
                    className={`font-display text-4xl tracking-wider ${currentPage === l.pageIdx ? "text-accent-ember" : "text-text-primary"}`}
                  >
                    {l.label}
                  </button>
                </motion.li>
              ))}
              {isAdmin && (
                <motion.li initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
                  <Link to="/admin" onClick={() => setOpen(false)} className="font-display text-4xl tracking-wider text-accent-ember">
                    ADMIN
                  </Link>
                </motion.li>
              )}
            </ul>
            <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-text-muted">
              <button type="button" onClick={toggleMute} className="flex items-center gap-2 text-sm">
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                {muted ? t("nav.soundOff") : t("nav.soundOn")}
              </button>
              <span className="text-xs tracking-widest">CINEMAX © 2026</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TicketsModal open={ticketsOpen} onClose={() => setTicketsOpen(false)} />
    </>
  );
}
