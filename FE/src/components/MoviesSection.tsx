import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ALL_GENRES } from "@/data/movies";
import { useLocale } from "@/context/LocaleContext";
import { MovieCard } from "./MovieCard";
import { ComingSoonCard } from "./ComingSoonCard";
import { useMoviesApi } from "@/hooks/useMoviesApi";

interface Props {
  /** "now_showing" | "coming_soon" — passed from PagedLayout */
  tab: "now_showing" | "coming_soon";
}

export function MoviesSection({ tab }: Props) {
  const { t } = useLocale();
  const { movies, loading } = useMoviesApi();
  const [genre, setGenre] = useState("All");

  const list = useMemo(
    () =>
      movies.filter((m) => m.status === tab).filter(
        (m) => genre === "All" || m.genre.includes(genre)
      ),
    [movies, tab, genre]
  );

  const isNow = tab === "now_showing";
  const title = isNow ? t("movies.nowShowing") : t("movies.comingSoon");

  return (
    <section className="relative flex min-h-screen flex-col bg-bg-void px-5 py-24 lg:px-10">
      {/* Decorative watermark */}
      <div
        className="pointer-events-none absolute inset-x-0 top-10 select-none text-center font-display tracking-tighter text-white/[0.035]"
        style={{ fontSize: "15vw", lineHeight: 0.9 }}
      >
        {isNow ? "FEATURES" : "UPCOMING"}
      </div>

      <div className="relative mx-auto w-full max-w-7xl flex-1">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="font-display text-xs tracking-[0.4em] text-accent-blood">
              {t("movies.eyebrow")}
            </div>
            <h2 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
              {title.toUpperCase()}
            </h2>
            <p className="mt-2 max-w-md text-sm text-text-muted">
              {t("movies.subtitle")}
            </p>
          </div>

          {/* Accent line */}
          <div
            className="hidden h-px w-32 sm:block"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--accent-blood), transparent)",
            }}
          />
        </div>

        {/* Genre pills */}
        <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-2">
          {ALL_GENRES.map((g) => {
            const active = g === genre;
            return (
              <button
                key={g}
                data-cursor="button"
                onClick={() => setGenre(g)}
                className={`shrink-0 rounded-full border px-4 py-1.5 font-display text-[11px] tracking-[0.2em] transition ${
                  active
                    ? "scale-105 border-accent-blood bg-accent-blood text-white shadow-[0_0_18px_rgba(229,9,20,0.45)]"
                    : "border-white/12 bg-white/[0.03] text-text-primary/80 hover:border-accent-ember hover:text-accent-ember"
                }`}
              >
                {g.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="mt-10 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab + genre}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              {loading ? (
                <div className="col-span-full grid place-items-center py-24 text-text-muted">
                  Loading movies...
                </div>
              ) : list.length === 0 ? (
                <div className="col-span-full grid place-items-center py-24 text-text-muted">
                  {t("movies.empty")}
                </div>
              ) : isNow ? (
                list.map((m) => <MovieCard key={m.id} movie={m} />)
              ) : (
                list.map((m) => <ComingSoonCard key={m.id} movie={m} />)
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
