import { motion } from "framer-motion";
import { Ticket } from "lucide-react";
import type { OfferMeta } from "@/data/offers";
import { useBooking } from "@/context/BookingContext";
import { useLocale } from "@/context/LocaleContext";
import { calcBookingSubtotalUsd } from "@/lib/booking-total";
import { OrderSummary } from "./OrderSummary";

export function StepReview({
  appliedOffer,
  onConfirm,
}: {
  appliedOffer?: OfferMeta;
  onConfirm: () => void;
}) {
  const { state } = useBooking();
  const { t } = useLocale();
  const movie = state.selectedMovie!;
  const showtime = state.selectedShowtime!;
  const subtotal = calcBookingSubtotalUsd(movie, showtime, state.selectedSeats);

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-text-muted">{t("checkout.reviewHint")}</p>

      <OrderSummary
        movieTitle={movie.title}
        showtimeLabel={`${showtime.type} · ${showtime.time}`}
        seats={state.selectedSeats}
        subtotalUsd={subtotal}
        appliedOffer={appliedOffer}
      />

      <div className="rounded-xl border border-white/10 bg-bg-surface/50 p-4 text-sm">
        <div className="font-display text-[10px] tracking-[0.25em] text-text-muted">CONTACT</div>
        <p className="mt-2 text-text-primary">{state.details.name}</p>
        <p className="text-text-primary/80">{state.details.email}</p>
        <p className="text-text-primary/80">{state.details.phone}</p>
        <div className="mt-3 font-display text-[10px] tracking-[0.25em] text-text-muted">PAYMENT</div>
        <p className="mt-1 text-text-primary/80">
          {state.details.method === "card" &&
            `${t("checkout.paymentCard")} ·••• ${state.details.cardNumber.slice(-4) || "----"}`}
          {state.details.method === "qr" && t("checkout.paymentQr")}
        </p>
      </div>

      <motion.button
        type="button"
        data-cursor="button"
        whileTap={{ scale: 0.98 }}
        onClick={onConfirm}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-accent-blood px-5 py-4 font-display text-sm tracking-[0.25em] text-white shadow-[0_0_28px_rgba(229,9,20,0.55)]"
      >
        <Ticket size={16} />
        {t("checkout.confirmBooking")}
      </motion.button>
    </div>
  );
}
