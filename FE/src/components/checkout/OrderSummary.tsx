import type { OfferMeta } from "@/data/offers";
import { useLocale } from "@/context/LocaleContext";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { applyDiscount } from "@/lib/booking-total";

type AppliedOffer = OfferMeta | {
  ma_giam_gia: string;
  phan_tram_giam: number;
};

function getDiscountPercent(offer: AppliedOffer) {
  return "discountPercent" in offer ? offer.discountPercent : offer.phan_tram_giam;
}

function getOfferCode(offer: AppliedOffer) {
  return "code" in offer ? offer.code : offer.ma_giam_gia;
}

export function OrderSummary({
  movieTitle,
  showtimeLabel,
  seats,
  subtotalUsd,
  appliedOffer,
  compact,
}: {
  movieTitle: string;
  showtimeLabel: string;
  seats: string[];
  subtotalUsd: number;
  appliedOffer?: AppliedOffer;
  compact?: boolean;
}) {
  const { t } = useLocale();
  const { format } = useFormatMoney();
  const { discount, total } = appliedOffer
    ? applyDiscount(subtotalUsd, getDiscountPercent(appliedOffer))
    : { discount: 0, total: subtotalUsd };

  return (
    <div
      className={`rounded-xl border border-white/10 bg-black/30 ${compact ? "p-4" : "p-5"}`}
    >
      <div className="font-display text-[10px] tracking-[0.3em] text-accent-blood">
        {t("checkout.summaryTitle").toUpperCase()}
      </div>
      <dl className={`mt-3 space-y-2 text-sm ${compact ? "text-xs" : ""}`}>
        <div className="flex justify-between gap-4">
          <dt className="text-text-muted">{t("checkout.movie")}</dt>
          <dd className="text-right font-medium text-text-primary">{movieTitle}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-muted">{t("checkout.showtime")}</dt>
          <dd className="text-right text-text-primary">{showtimeLabel}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-muted">{t("checkout.seats")}</dt>
          <dd className="text-right font-display text-accent-ember">{seats.join(", ") || "—"}</dd>
        </div>
        <div className="border-t border-white/10 pt-2">
          <div className="flex justify-between gap-4">
            <dt className="text-text-muted">{t("checkout.subtotal")}</dt>
            <dd className="font-display text-lg text-text-primary">{format(subtotalUsd)}</dd>
          </div>
          {appliedOffer && discount > 0 && (
            <div className="mt-1 flex justify-between gap-4 text-emerald-400">
              <dt>
                {t("checkout.discount")} ({getOfferCode(appliedOffer)})
              </dt>
              <dd className="font-display">−{format(discount)}</dd>
            </div>
          )}
          <div className="mt-2 flex justify-between gap-4 border-t border-white/10 pt-2">
            <dt className="font-display tracking-widest text-text-muted">{t("checkout.total")}</dt>
            <dd className="font-display text-2xl text-accent-gold">{format(total)}</dd>
          </div>
        </div>
      </dl>
    </div>
  );
}
