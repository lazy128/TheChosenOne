import { useLocale, type Locale } from "@/context/LocaleContext";

const OPTIONS: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "vi", label: "VI" },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={`flex items-center rounded-full border border-white/15 bg-bg-surface/80 p-0.5 text-[10px] font-display tracking-[0.2em] ${className}`}
      role="group"
      aria-label="Language"
    >
      {OPTIONS.map((opt) => {
        const active = locale === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            data-cursor="button"
            onClick={() => setLocale(opt.id)}
            className={`rounded-full px-2.5 py-1 transition ${
              active
                ? "bg-accent-blood text-white shadow-[0_0_12px_rgba(229,9,20,0.45)]"
                : "text-text-muted hover:text-text-primary"
            }`}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
