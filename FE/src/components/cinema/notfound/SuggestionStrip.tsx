import { motion } from "framer-motion";

const suggestions = [
  { seed: "lost-tape", title: "THE LOST TAPE", year: 2024 },
  { seed: "exit-row-c", title: "EXIT ROW C", year: 2023 },
  { seed: "after-credits", title: "AFTER THE CREDITS", year: 2025 },
];

export function SuggestionStrip() {
  return (
    <div className="mt-10 w-full">
      <p className="mb-3 font-mono text-[10px] tracking-[0.3em] text-gold">
        MAYBE YOU WERE LOOKING FOR:
      </p>
      <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2 sm:justify-center sm:overflow-visible">
        {suggestions.map((s, i) => (
          <motion.a
            key={s.seed}
            href="/"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 + i * 0.1 }}
            className="group flex w-[180px] shrink-0 items-center gap-3 rounded-lg border border-white/10 bg-surface/60 p-2 text-left backdrop-blur-md transition-all duration-200 hover:-translate-y-1"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(245,197,24,0.6)";
              e.currentTarget.style.boxShadow = "0 0 30px rgba(245,197,24,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <img
              src={`https://picsum.photos/seed/${s.seed}/80/120`}
              alt={s.title}
              loading="lazy"
              className="h-[72px] w-[48px] rounded object-cover"
            />
            <div className="min-w-0">
              <p className="truncate font-display text-sm tracking-wider text-text-primary">
                {s.title}
              </p>
              <p className="font-mono text-[10px] text-text-muted">{s.year}</p>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
