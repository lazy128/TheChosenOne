import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock } from "lucide-react";
import { MOVIES } from "../../data/movies";
import { useMoviesApi } from "@/hooks/useMoviesApi";

export function PosterStack() {
  const { featured: featuredMovies } = useMoviesApi();
  const POOL = (featuredMovies.length ? featuredMovies : MOVIES.filter((m) => m.status === "now_showing")).slice(0, 6);
  const [idx, setIdx] = useState(0);
  const tiltRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-cycle featured poster
  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % POOL.length);
    }, 3500);
    return () => clearInterval(id);
  }, [idx]);

  // Mouse parallax tilt on featured poster
  useEffect(() => {
    const el = containerRef.current;
    const tilt = tiltRef.current;
    if (!el || !tilt) return;
    let raf = 0;
    const target = { rx: 0, ry: 0 };
    const current = { rx: 0, ry: 0 };

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      target.ry = ((e.clientX - r.left) / r.width - 0.5) * 14;
      target.rx = -((e.clientY - r.top) / r.height - 0.5) * 14;
    };
    const onLeave = () => { target.rx = 0; target.ry = 0; };
    const loop = () => {
      current.rx += (target.rx - current.rx) * 0.1;
      current.ry += (target.ry - current.ry) * 0.1;
      tilt.style.transform = `perspective(1000px) rotateX(${current.rx}deg) rotateY(${current.ry}deg)`;
      raf = requestAnimationFrame(loop);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const featured = POOL[idx];
  const thumbs = POOL.filter((_, i) => i !== idx).slice(0, 4);

  return (
    <div ref={containerRef} className="relative w-full max-w-[480px] px-4 select-none">
      {/* Background glow follows accent color */}
      <div
        className="pointer-events-none absolute -inset-20 opacity-40 blur-3xl transition-colors duration-700"
        style={{
          background: `radial-gradient(ellipse at center, ${featured.accent}88 0%, transparent 70%)`,
        }}
      />

      {/* Featured poster */}
      <div ref={tiltRef} className="relative will-change-transform">
        <AnimatePresence mode="wait">
          <motion.div
            key={featured.id}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -8 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl"
            style={{
              boxShadow: `0 32px 64px -16px ${featured.accent}66, 0 0 0 1px rgba(255,255,255,0.07)`,
            }}
          >
            <img
              src={featured.poster}
              alt={featured.title}
              className="aspect-[2/3] w-full object-cover"
              loading="eager"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* NOW SHOWING badge */}
            <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-accent-blood/90 px-3 py-1 font-display text-[10px] tracking-widest text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              NOW SHOWING
            </div>

            {/* IMDB score */}
            <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-sm">
              <Star size={11} className="fill-accent-gold text-accent-gold" />
              <span className="font-semibold text-[13px] text-accent-gold">{featured.imdbScore}</span>
            </div>

            {/* Bottom info */}
            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="mb-1 flex gap-1.5">
                {featured.genre.map((g) => (
                  <span
                    key={g}
                    className="rounded border border-white/15 bg-white/5 px-2 py-0.5 font-display text-[9px] tracking-widest text-white/80 backdrop-blur-sm"
                  >
                    {g.toUpperCase()}
                  </span>
                ))}
              </div>
              <h3 className="font-display text-2xl leading-none tracking-wider text-white">
                {featured.title}
              </h3>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-white/50">
                <Clock size={11} />
                <span>{Math.floor(featured.runtime / 60)}h {featured.runtime % 60}m</span>
                <span>·</span>
                <span>{featured.rating}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnail strip */}
      <div className="mt-4 flex gap-2 justify-center">
        {POOL.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => { setIdx(i); }}
            className="relative overflow-hidden rounded-md transition-all duration-200"
            style={{
              width: i === idx ? 52 : 40,
              height: i === idx ? 72 : 58,
              opacity: i === idx ? 1 : 0.5,
              outline: i === idx ? `2px solid ${featured.accent}` : "2px solid transparent",
              outlineOffset: "2px",
            }}
          >
            <img src={m.poster} alt={m.title} className="h-full w-full object-cover" loading="lazy" />
            {i === idx && (
              <div
                className="absolute inset-0"
                style={{ background: `${featured.accent}22` }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Quote */}
      <div className="mt-6 px-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={featured.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="text-center text-sm italic text-white/50 leading-relaxed line-clamp-2"
          >
            &ldquo;{featured.tagline}&rdquo;
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
