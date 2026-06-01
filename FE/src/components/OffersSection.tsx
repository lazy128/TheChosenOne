import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { quanLyUuDaiApi, type UuDai } from "@/lib/cinema-api";
import {
  Ticket,
  GraduationCap,
  Crown,
  Heart,
  Moon,
  Film,
  Popcorn,
  Copy,
  Check,
  Sparkles,
  Calendar,
} from "lucide-react";
import {
  localizeOffers,
  OFFER_CATEGORY_IDS,
  type LocalizedOffer,
  type OfferAccent,
  type OfferCategory,
} from "@/data/offers";
import { useLocale } from "@/context/LocaleContext";
import { useBooking } from "@/context/BookingContext";
import { goToNowShowing } from "@/lib/navigation";

const ICONS: Record<string, typeof Ticket> = {
  reel10: Ticket,
  student30: GraduationCap,
  vip15: Crown,
  duodate: Heart,
  midnight: Moon,
  imaxweek: Film,
  welcome: Sparkles,
  combo15: Popcorn,
};

const ACCENT_STYLES: Record<
  OfferAccent,
  { border: string; glow: string; badge: string; code: string }
> = {
  blood: {
    border: "border-accent-blood/40 hover:border-accent-blood",
    glow: "shadow-[0_0_40px_rgba(229,9,20,0.25)]",
    badge: "bg-accent-blood text-white",
    code: "text-accent-blood",
  },
  gold: {
    border: "border-accent-gold/40 hover:border-accent-gold",
    glow: "shadow-[0_0_40px_rgba(245,197,24,0.2)]",
    badge: "bg-accent-gold text-black",
    code: "text-accent-gold",
  },
  ice: {
    border: "border-accent-ice/40 hover:border-accent-ice",
    glow: "shadow-[0_0_40px_rgba(0,212,255,0.2)]",
    badge: "bg-accent-ice text-black",
    code: "text-accent-ice",
  },
  ember: {
    border: "border-accent-ember/40 hover:border-accent-ember",
    glow: "shadow-[0_0_40px_rgba(255,107,53,0.2)]",
    badge: "bg-accent-ember text-white",
    code: "text-accent-ember",
  },
};

function OfferCard({
  offer,
  copied,
  validLabel,
  onCopy,
}: {
  offer: LocalizedOffer;
  copied: boolean;
  validLabel: string;
  onCopy: () => void;
}) {
  // @ts-ignore - map dynamic icon ID back to component, fallback to Ticket
  const Icon = ICONS[(offer as any).iconId] ?? ICONS[offer.id] ?? Ticket;
  const accent = ACCENT_STYLES[offer.accent];
  const featured = offer.featured;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45 }}
      className={`group relative overflow-hidden rounded-2xl border bg-bg-surface/50 backdrop-blur transition ${accent.border} ${
        featured ? `md:col-span-2 ${accent.glow}` : ""
      }`}
    >
      <span className="pointer-events-none absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {offer.badge && (
        <span
          className={`absolute right-4 top-4 z-10 rounded px-2 py-0.5 font-display text-[10px] tracking-[0.25em] ${accent.badge}`}
        >
          {offer.badge}
        </span>
      )}

      <div className={`relative p-5 ${featured ? "md:flex md:gap-6 md:p-7" : ""}`}>
        <div
          className={`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 ${featured ? "md:mb-0 md:h-16 md:w-16" : ""}`}
        >
          <Icon size={featured ? 28 : 22} className={accent.code} strokeWidth={1.5} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-2xl tracking-wide text-text-primary">{offer.title}</h3>
              <p className="mt-0.5 text-xs tracking-widest text-text-muted">{offer.tagline}</p>
            </div>
            <div
              className={`shrink-0 font-display text-3xl leading-none ${accent.code} ${featured ? "text-4xl md:text-5xl" : ""}`}
            >
              {offer.discountLabel}
            </div>
          </div>

          <p className={`mt-3 text-sm text-text-primary/75 ${featured ? "md:max-w-xl" : "line-clamp-2"}`}>
            {offer.description}
          </p>

          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-wider text-text-muted">
            {offer.terms.map((term) => (
              <li key={term} className="flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-white/30" />
                {term}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2">
              <span className="font-display text-lg tracking-[0.2em] text-text-primary">{offer.code}</span>
              <button
                type="button"
                data-cursor="button"
                onClick={onCopy}
                className="rounded-md p-1.5 text-text-muted transition hover:bg-white/10 hover:text-text-primary"
                aria-label={`Copy ${offer.code}`}
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
            <span className="flex items-center gap-1 text-[10px] tracking-widest text-text-muted">
              <Calendar size={11} />
              {validLabel} {offer.validUntil}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function OffersSection() {
  const { t, locale, messages } = useLocale();
  const { state, dispatch } = useBooking();
  const [category, setCategory] = useState<OfferCategory>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: apiOffers } = useQuery({
    queryKey: ["offers"],
    queryFn: quanLyUuDaiApi.layDanhSachUuDai,
  });

  const offers = useMemo(() => {
    if (!apiOffers) return [];
    
    // Convert API UuDai to LocalizedOffer format expected by the UI
    const mapped = apiOffers.map(o => {
      return {
        id: o.ma_uu_dai.toString(),
        category: o.loai_uu_dai as OfferCategory,
        title: o.tieu_de,
        tagline: o.mo_ta?.split('\n')[0] || "",
        description: o.mo_ta || "",
        discountPercent: o.phan_tram_giam,
        discountLabel: `-${o.phan_tram_giam}%`,
        code: o.ma_giam_gia,
        validUntil: new Date(o.ngay_het_han).toLocaleDateString("vi-VN"),
        terms: ["Áp dụng online", "Không cộng dồn"],
        accent: (o.accent || "blood") as OfferAccent,
        iconId: o.icon || "ticket",
        featured: o.phan_tram_giam >= 30, // example logic
      } as LocalizedOffer & { iconId: string };
    });

    if (typeof window !== "undefined") {
      const usedOffers = JSON.parse(localStorage.getItem("cinemax_used_offers") || "[]");
      return mapped.filter(o => !usedOffers.includes(o.code));
    }
    return mapped;
  }, [apiOffers]);

  const filtered = useMemo(() => {
    if (category === "all") return offers;
    return offers.filter((o) => o.category === category);
  }, [category, offers]);

  const featured = filtered.find((o) => o.featured);
  const rest = filtered.filter((o) => !o.featured);

  const copyCode = async (offer: LocalizedOffer) => {
    try {
      await navigator.clipboard.writeText(offer.code);
      setCopiedId(offer.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <section id="offers" className="relative scroll-mt-24 border-t border-white/10 bg-bg-void px-5 py-24 lg:px-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-8 select-none text-center font-display tracking-tighter text-white/[0.035]"
        style={{ fontSize: "14vw", lineHeight: 0.9 }}
      >
        DEALS
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-display text-xs tracking-[0.4em] text-accent-blood">{t("offers.eyebrow")}</div>
            <h2 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">{t("offers.title")}</h2>
            <p className="mt-2 max-w-lg text-sm text-text-muted">{t("offers.subtitle")}</p>
          </div>
          <button
            type="button"
            data-cursor="button"
            onClick={() => goToNowShowing(dispatch, state.stage)}
            className="inline-flex items-center gap-2 self-start rounded-md bg-accent-blood px-5 py-3 font-display text-xs tracking-[0.25em] text-white shadow-[0_0_24px_rgba(229,9,20,0.45)] transition active:scale-95"
          >
            <Ticket size={14} />
            {t("offers.cta")}
          </button>
        </div>

        <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-2">
          {OFFER_CATEGORY_IDS.map((id) => {
            const active = category === id;
            const label = t(`offers.categories.${id}`);
            return (
              <button
                key={id}
                type="button"
                data-cursor="button"
                onClick={() => setCategory(id)}
                className={`shrink-0 rounded-full border px-4 py-1.5 font-display text-[11px] tracking-[0.2em] transition ${
                  active
                    ? "scale-105 border-accent-blood bg-accent-blood text-white shadow-[0_0_18px_rgba(229,9,20,0.45)]"
                    : "border-white/12 bg-white/[0.03] text-text-primary/80 hover:border-accent-ember hover:text-accent-ember"
                }`}
              >
                {label.toUpperCase()}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${category}-${locale}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {filtered.length === 0 ? (
              <p className="col-span-full py-16 text-center text-text-muted">{t("offers.empty")}</p>
            ) : (
              <>
                {featured && (
                  <OfferCard
                    offer={featured}
                    validLabel={t("offers.validUntil")}
                    copied={copiedId === featured.id}
                    onCopy={() => copyCode(featured)}
                  />
                )}
                {rest.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    validLabel={t("offers.validUntil")}
                    copied={copiedId === offer.id}
                    onCopy={() => copyCode(offer)}
                  />
                ))}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <p className="mt-10 text-center text-[11px] tracking-widest text-text-muted">
          {t("offers.hint", {
            step: t("offers.paymentStep"),
            codes: "REEL10, STUDENT30",
          })}
        </p>
      </div>
    </section>
  );
}
