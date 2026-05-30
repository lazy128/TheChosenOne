import { useMemo, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowLeft, ArrowRight, Check, Download, Share2, Ticket, CreditCard, Plus, Trash2, Shield, Lock } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { useNavigate } from "@tanstack/react-router";
import { useSound } from "@/hooks/useSound";
import type { OfferMeta } from "@/data/offers";
import { formatPromoSuccess, getOfferMetaByCode } from "@/data/offers";
import { useLocale } from "@/context/LocaleContext";
import { CheckoutProgress } from "./checkout/CheckoutProgress";
import { OrderSummary } from "./checkout/OrderSummary";
import { StepReview } from "./checkout/StepReview";
import { PaymentMethodTabs, QrPaymentPanel } from "./checkout/PaymentMethods";
import { calcBookingSubtotalUsd, applyDiscount } from "@/lib/booking-total";
import { startNewBooking } from "@/lib/navigation";

// ─── Saved cards logic (localStorage) ───
type SavedCard = {
  id: string;
  last4: string;
  brand: string;
  name: string;
  expiry: string;
};

const STORAGE_KEY = "cinemax_saved_cards";

function loadSavedCards(): SavedCard[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSavedCards(cards: SavedCard[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch { /* storage blocked */ }
}

function detectBrand(num: string): string {
  const d = num.replace(/\s/g, "");
  if (d.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return "Mastercard";
  if (d.startsWith("34") || d.startsWith("37")) return "Amex";
  if (d.startsWith("62") || d.startsWith("81")) return "UnionPay";
  return "Card";
}

// ─── Field component ───
function Field({
  label, value, onChange, type = "text", placeholder, maxLength, error, icon: Icon,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; maxLength?: number; error?: string;
  icon?: typeof CreditCard;
}) {
  const [focused, setFocused] = useState(false);
  const float = focused || value.length > 0;
  return (
    <label className="relative block">
      <span
        className={`pointer-events-none absolute left-3 z-10 origin-left font-display tracking-[0.2em] transition-all duration-200 ${float ? "top-1 text-[9px] text-accent-ember" : "top-3.5 text-[11px] text-text-muted"
          }`}
      >
        {label.toUpperCase()}
      </span>
      {Icon && (
        <Icon size={14} className="pointer-events-none absolute right-3 top-4 text-text-muted" />
      )}
      <input
        value={value}
        type={type}
        placeholder={focused ? placeholder : ""}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-bg-surface/70 px-3 pb-2 pt-5 text-sm text-text-primary outline-none transition focus:border-accent-blood focus:ring-2 focus:ring-accent-blood/30"
      />
      {error && <span className="mt-1 block text-[10px] text-accent-blood">{error}</span>}
    </label>
  );
}

function StepDetails() {
  const { state, dispatch } = useBooking();
  const d = state.details;

  useEffect(() => {
    if (d.name || d.email || d.phone) return;

    try {
      const raw = localStorage.getItem("currentUser");
      if (!raw) return;

      const user = JSON.parse(raw) as {
        hoTen?: string;
        email?: string;
        soDt?: string;
      };

      dispatch({
        type: "SET_DETAILS",
        patch: {
          name: user.hoTen?.trim() || "",
          email: user.email?.trim() || "",
          phone: user.soDt?.trim() || "",
        },
      });
    } catch {
      return;
    }
  }, [d.name, d.email, d.phone, dispatch]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Full Name" value={d.name} onChange={(v) => dispatch({ type: "SET_DETAILS", patch: { name: v } })} placeholder="Vu Thi Linh" />
      </div>
      <Field label="Email" type="email" value={d.email} onChange={(v) => dispatch({ type: "SET_DETAILS", patch: { email: v } })} placeholder="you@cinemax.vn" />
      <Field label="Phone" type="tel" value={d.phone} onChange={(v) => dispatch({ type: "SET_DETAILS", patch: { phone: v } })} placeholder="+84 901 234 567" />
    </div>
  );
}

// ─── Credit card visual ───
function CreditCardVisual({ d, flipped }: { d: { cardNumber: string; cardName: string; cardExpiry: string; cardCvv: string }; flipped: boolean }) {
  const number = (d.cardNumber || "0000 0000 0000 0000").padEnd(19, "•").slice(0, 19);
  const brand = detectBrand(d.cardNumber);
  return (
    <div className="perspective-1000 w-full max-w-sm">
      <div className="relative aspect-[1.6/1] preserve-3d transition-transform duration-700" style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0)" }}>
        <div className="absolute inset-0 backface-hidden overflow-hidden rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #050508 60%, #2a0a0e 100%)", boxShadow: "0 30px 60px -20px rgba(229,9,20,0.6), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between">
            <div className="font-display text-sm tracking-[0.3em] text-accent-ember">CINEMAX • BLACK</div>
            <div className="font-display text-[10px] tracking-widest text-white/40">{brand.toUpperCase()}</div>
          </div>
          <div className="mt-8 h-9 w-12 rounded bg-gradient-to-br from-accent-gold to-yellow-700/70" />
          <div className="mt-5 font-mono text-lg tracking-[0.25em]">{number}</div>
          <div className="mt-3 flex items-end justify-between text-[10px] uppercase tracking-widest">
            <div>
              <div className="text-white/50">Card Holder</div>
              <div className="text-sm font-medium tracking-wider">{d.cardName || "YOUR NAME"}</div>
            </div>
            <div>
              <div className="text-white/50">Expires</div>
              <div className="text-sm font-medium">{d.cardExpiry || "MM/YY"}</div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 backface-hidden overflow-hidden rounded-2xl text-white" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #050508 60%, #2a0a0e 100%)", transform: "rotateY(180deg)" }}>
          <div className="mt-6 h-10 w-full bg-black/60" />
          <div className="mx-4 mt-4 flex items-center justify-between rounded bg-white/95 px-3 py-2 text-black">
            <span className="font-mono italic text-sm tracking-wider">Authorized signature</span>
            <span className="font-mono text-sm">{d.cardCvv || "•••"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCardNumber(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(v: string) {
  const x = v.replace(/\D/g, "").slice(0, 4);
  return x.length > 2 ? x.slice(0, 2) + "/" + x.slice(2) : x;
}

// ─── Step 2: Payment (with saved cards) ───
function StepPayment({
  appliedOffer,
  setAppliedOffer,
  onConfirmBooking,
}: {
  appliedOffer?: OfferMeta;
  setAppliedOffer: (o: OfferMeta | undefined) => void;
  onConfirmBooking: () => Promise<boolean>;
}) {
  const { state, dispatch } = useBooking();
  const { t } = useLocale();
  const d = state.details;
  const [cvvFocus, setCvvFocus] = useState(false);
  const [promo, setPromo] = useState("");
  const [promoError, setPromoError] = useState("");
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showNewCard, setShowNewCard] = useState(false);
  const [saveThisCard, setSaveThisCard] = useState(true);

  // Load saved cards on mount
  useEffect(() => {
    const cards = loadSavedCards();
    setSavedCards(cards);
    if (cards.length > 0) {
      // Auto-select the first saved card
      const card = cards[0];
      setSelectedCardId(card.id);
      dispatch({
        type: "SET_DETAILS",
        patch: {
          cardNumber: `•••• •••• •••• ${card.last4}`,
          cardName: card.name,
          cardExpiry: card.expiry,
          cardCvv: "",
        },
      });
    } else {
      setShowNewCard(true);
    }
  }, []);

  const selectSavedCard = (card: SavedCard) => {
    setSelectedCardId(card.id);
    setShowNewCard(false);
    dispatch({
      type: "SET_DETAILS",
      patch: {
        cardNumber: `•••• •••• •••• ${card.last4}`,
        cardName: card.name,
        cardExpiry: card.expiry,
        cardCvv: "",
      },
    });
  };

  const startNewCard = () => {
    setSelectedCardId(null);
    setShowNewCard(true);
    dispatch({
      type: "SET_DETAILS",
      patch: { cardNumber: "", cardName: "", cardExpiry: "", cardCvv: "" },
    });
  };

  const deleteSavedCard = (id: string) => {
    const updated = savedCards.filter((c) => c.id !== id);
    setSavedCards(updated);
    saveSavedCards(updated);
    if (selectedCardId === id) {
      if (updated.length > 0) selectSavedCard(updated[0]);
      else startNewCard();
    }
  };

  // Save card on successful submission (called from parent before NEXT_STEP)
  // We expose via a global event for simplicity
  useEffect(() => {
    const onSave = () => {
      if (saveThisCard && showNewCard && d.cardNumber.replace(/[•\s]/g, "").length === 16) {
        const digits = d.cardNumber.replace(/\s/g, "");
        const newCard: SavedCard = {
          id: "card-" + Date.now(),
          last4: digits.slice(-4),
          brand: detectBrand(digits),
          name: d.cardName,
          expiry: d.cardExpiry,
        };
        const updated = [...savedCards, newCard];
        setSavedCards(updated);
        saveSavedCards(updated);
      }
    };
    window.addEventListener("cinemax:save-card", onSave);
    return () => window.removeEventListener("cinemax:save-card", onSave);
  }, [saveThisCard, showNewCard, d, savedCards]);

  const applyPromo = () => {
    const offer = getOfferMetaByCode(promo);
    if (offer) {
      setAppliedOffer(offer);
      setPromoError("");
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 }, colors: ["#e50914", "#f5c518", "#ffffff"] });
    } else {
      setAppliedOffer(undefined);
      setPromoError(t("checkout.promoInvalid"));
    }
  };

  const subtotalUsd = state.selectedMovie && state.selectedShowtime
    ? calcBookingSubtotalUsd(state.selectedMovie, state.selectedShowtime, state.selectedSeats)
    : 0;
  const totalUsd = appliedOffer
    ? applyDiscount(subtotalUsd, appliedOffer.discountPercent).total
    : subtotalUsd;

  return (
    <div className="space-y-6">
      <PaymentMethodTabs />

      {state.bookingError && (
        <div className="rounded-lg border border-accent-blood/40 bg-accent-blood/10 px-4 py-3 text-sm text-accent-blood">
          {state.bookingError}
        </div>
      )}

      {d.method === "card" && (
        <div className="space-y-4">
          {/* Saved cards section */}
          {savedCards.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-text-muted">
                <Shield size={12} />
                <span>Saved Payment Methods</span>
              </div>
              <div className="space-y-2">
                {savedCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => selectSavedCard(card)}
                    className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${selectedCardId === card.id && !showNewCard
                      ? "border-accent-blood/60 bg-accent-blood/10 ring-1 ring-accent-blood/40"
                      : "border-white/10 bg-bg-surface/50 hover:border-white/20"
                      }`}
                  >
                    <div className="grid h-9 w-14 place-items-center rounded-md bg-gradient-to-br from-gray-700 to-gray-900 text-[9px] font-bold text-white/80">
                      {card.brand.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-mono text-sm tracking-wider text-text-primary">
                        •••• •••• •••• {card.last4}
                      </div>
                      <div className="text-[10px] text-text-muted">
                        {card.name} · Expires {card.expiry}
                      </div>
                    </div>
                    {selectedCardId === card.id && !showNewCard && (
                      <Check size={16} className="text-emerald-400" />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSavedCard(card.id);
                      }}
                      className="rounded-md p-1.5 text-text-muted opacity-0 transition hover:bg-white/10 hover:text-accent-blood group-hover:opacity-100"
                      aria-label="Remove card"
                    >
                      <Trash2 size={12} />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add new card button */}
          {!showNewCard && (
            <button
              type="button"
              onClick={startNewCard}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-3 font-display text-[11px] tracking-widest text-text-muted transition hover:border-accent-ember hover:text-accent-ember"
            >
              <Plus size={14} />
              ADD NEW CARD
            </button>
          )}

          {/* New card form or CVV for saved card */}
          {showNewCard ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex justify-center">
                  <CreditCardVisual d={d} flipped={cvvFocus} />
                </div>
                <div className="space-y-3">
                  <Field
                    label="Card Number"
                    value={d.cardNumber}
                    onChange={(v) => dispatch({ type: "SET_DETAILS", patch: { cardNumber: formatCardNumber(v) } })}
                    placeholder="0000 0000 0000 0000"
                    icon={CreditCard}
                  />
                  <Field
                    label="Name on Card"
                    value={d.cardName}
                    onChange={(v) => dispatch({ type: "SET_DETAILS", patch: { cardName: v.toUpperCase() } })}
                    placeholder="VU THI LINH"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Expiry"
                      value={d.cardExpiry}
                      onChange={(v) => dispatch({ type: "SET_DETAILS", patch: { cardExpiry: formatExpiry(v) } })}
                      placeholder="MM/YY"
                    />
                    <label className="relative block">
                      <span
                        className={`pointer-events-none absolute left-3 z-10 origin-left font-display tracking-[0.2em] transition-all duration-200 ${d.cardCvv || cvvFocus ? "top-1 text-[9px] text-accent-ember" : "top-3.5 text-[11px] text-text-muted"
                          }`}
                      >
                        CVV
                      </span>
                      <Lock size={14} className="pointer-events-none absolute right-3 top-4 text-text-muted" />
                      <input
                        value={d.cardCvv}
                        maxLength={4}
                        onFocus={() => setCvvFocus(true)}
                        onBlur={() => setCvvFocus(false)}
                        onChange={(e) =>
                          dispatch({ type: "SET_DETAILS", patch: { cardCvv: e.target.value.replace(/\D/g, "") } })
                        }
                        className="w-full rounded-lg border border-white/10 bg-bg-surface/70 px-3 pb-2 pt-5 text-sm text-text-primary outline-none focus:border-accent-blood focus:ring-2 focus:ring-accent-blood/30"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Save card checkbox */}
              <label className="flex cursor-pointer items-center gap-2 text-xs text-text-muted select-none">
                <input
                  type="checkbox"
                  checked={saveThisCard}
                  onChange={(e) => setSaveThisCard(e.target.checked)}
                  className="h-3.5 w-3.5 rounded accent-accent-blood"
                />
                <Shield size={12} className="text-emerald-400/70" />
                Save this card for faster checkout next time
              </label>

              {savedCards.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    selectSavedCard(savedCards[0]);
                    setShowNewCard(false);
                  }}
                  className="text-[10px] tracking-widest text-text-muted transition hover:text-accent-ember"
                >
                  ← USE SAVED CARD
                </button>
              )}
            </motion.div>
          ) : selectedCardId ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-white/10 bg-bg-surface/40 p-4"
            >
              <div className="mb-2 text-[10px] uppercase tracking-widest text-text-muted">
                Enter CVV to confirm
              </div>
              <div className="flex items-center gap-3">
                <label className="relative block flex-1">
                  <Lock size={14} className="pointer-events-none absolute right-3 top-4 text-text-muted" />
                  <input
                    value={d.cardCvv}
                    maxLength={4}
                    type="password"
                    placeholder="•••"
                    onChange={(e) =>
                      dispatch({ type: "SET_DETAILS", patch: { cardCvv: e.target.value.replace(/\D/g, "") } })
                    }
                    className="w-full rounded-lg border border-white/10 bg-bg-surface/70 px-3 py-3 text-center font-mono text-lg tracking-[0.5em] text-text-primary outline-none focus:border-accent-blood focus:ring-2 focus:ring-accent-blood/30"
                  />
                </label>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400/80">
                  <Shield size={12} />
                  <span>Encrypted</span>
                </div>
              </div>
            </motion.div>
          ) : null}
        </div>
      )}

      {d.method === "qr" && (
        <QrPaymentPanel
          amountUsd={totalUsd}
          onConfirmTransfer={onConfirmBooking}
        />
      )}

      {/* Promo code */}
      <div className="space-y-3 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2">
          <input
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            placeholder={t("checkout.promoPlaceholder")}
            className="w-full rounded-lg border border-white/10 bg-bg-surface/70 px-3 py-2 text-sm outline-none focus:border-accent-ember"
          />
          <button
            type="button"
            data-cursor="button"
            onClick={applyPromo}
            className="rounded-lg border border-accent-ember/60 px-3 py-2 font-display text-[11px] tracking-widest text-accent-ember hover:bg-accent-ember/10"
          >
            APPLY
          </button>
        </div>
        {appliedOffer && (
          <div className="text-xs text-emerald-400">
            {formatPromoSuccess(appliedOffer.code, appliedOffer.discountLabel, t)}
          </div>
        )}
        {promoError && <div className="text-xs text-accent-blood">{promoError}</div>}
      </div>
    </div>
  );
}

// ─── Barcode & QR ───
function Barcode() {
  const bars = useMemo(() => Array.from({ length: 60 }).map(() => 1 + Math.random() * 3), []);
  return (
    <div className="flex items-end gap-[2px] h-12">
      {bars.map((w, i) => (
        <span key={i} style={{ width: w, height: 48 }} className="bg-black" />
      ))}
    </div>
  );
}

function QRPattern() {
  const cells = useMemo(() => Array.from({ length: 169 }).map(() => Math.random() > 0.45), []);
  return (
    <div className="grid h-24 w-24 grid-cols-13 gap-px bg-white p-1" style={{ gridTemplateColumns: "repeat(13, minmax(0,1fr))" }}>
      {cells.map((b, i) => (
        <span key={i} className={b ? "bg-black" : "bg-white"} />
      ))}
    </div>
  );
}

// ─── Step 3: Confirmation ───
function StepConfirmation() {
  const { state, dispatch } = useBooking();
  const { t } = useLocale();
  const m = state.selectedMovie!;
  const showtime = state.selectedShowtime!;
  const [flip, setFlip] = useState(false);

  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 ring-2 ring-emerald-400/60"
      >
        <Check size={32} className="text-emerald-400" strokeWidth={3} />
      </motion.div>
      <motion.div
        className="mt-4 font-display text-3xl tracking-[0.18em] text-text-primary"
        aria-label={t("checkout.confirmedTitle")}
      >
        {t("checkout.confirmedTitle").split("").map((ch, i) => (
          <motion.span key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.04 * i }} className="inline-block">
            {ch === " " ? "\u00A0" : ch}
          </motion.span>
        ))}
      </motion.div>
      <p className="mt-1 text-sm text-text-muted">
        {t("checkout.confirmedSubtitle", { ref: state.bookingRef ?? "" })}
      </p>
      <p className="mt-2 text-[10px] tracking-widest text-text-muted">{t("checkout.ticketFlip")}</p>

      {/* 3D Ticket */}
      <div className="perspective-1000 mt-8 w-full max-w-md">
        <div
          className="relative aspect-[1.85/1] cursor-pointer preserve-3d transition-transform duration-700"
          style={{ transform: flip ? "rotateY(180deg)" : "rotateY(0)" }}
          onClick={() => setFlip((f) => !f)}
          data-cursor="card"
        >
          <div className="absolute inset-0 backface-hidden overflow-hidden rounded-2xl bg-gradient-to-br from-bg-elevated to-black ring-1 ring-accent-blood/40 shadow-[0_30px_70px_-20px_rgba(229,9,20,0.6)]">
            <div className="grid h-full grid-cols-[100px_1fr_auto]">
              <img src={m.poster} alt={m.title} className="h-full w-full object-cover" />
              <div className="p-4 text-left">
                <div className="font-display text-lg leading-tight">{m.title}</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-text-muted">{showtime.type} · {showtime.time}</div>
                <div className="mt-1 text-xs">{state.selectedDate}</div>
                <div className="mt-3 text-[10px] uppercase tracking-widest text-text-muted">Seats</div>
                <div className="flex flex-wrap gap-1">
                  {state.selectedSeats.map((s) => (
                    <span key={s} className="rounded bg-accent-blood/20 px-1.5 text-[11px] font-display text-accent-ember">{s}</span>
                  ))}
                </div>
              </div>
              <div className="grid place-items-center border-l border-dashed border-white/15 bg-white p-3">
                <QRPattern />
              </div>
            </div>
          </div>
          <div className="absolute inset-0 backface-hidden overflow-hidden rounded-2xl bg-white p-4 text-black" style={{ transform: "rotateY(180deg)" }}>
            <div className="font-display text-xs tracking-widest text-accent-blood">CINEMAX • E-TICKET</div>
            <div className="mt-2 text-[11px] text-black/70">Show this barcode at the gate. Snacks are non-refundable. Phones are.</div>
            <div className="mt-4 grid place-items-center"><Barcode /></div>
            <div className="mt-3 text-center font-mono text-xs">{state.bookingRef}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          data-cursor="button"
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-4 py-2 font-display text-[11px] tracking-widest hover:border-accent-ember hover:text-accent-ember"
        >
          <Download size={12} /> {t("checkout.download")}
        </button>
        <button
          data-cursor="button"
          type="button"
          onClick={async () => {
            const text = `CINEMAX booking ${state.bookingRef} — ${m.title}, ${showtime.time}, seats ${state.selectedSeats.join(", ")}`;
            try {
              if (navigator.share) await navigator.share({ title: "CINEMAX Ticket", text });
              else await navigator.clipboard.writeText(text);
              window.alert(t("checkout.shareCopied"));
            } catch { /* user cancelled */ }
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-4 py-2 font-display text-[11px] tracking-widest hover:border-accent-ember hover:text-accent-ember"
        >
          <Share2 size={12} /> {t("checkout.share")}
        </button>
        <button
          data-cursor="button"
          type="button"
          onClick={() => {
            startNewBooking(dispatch);
            navigate({ to: "/" });
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent-blood px-4 py-2 font-display text-[11px] tracking-widest text-white shadow-[0_0_18px_rgba(229,9,20,0.5)]"
        >
          {t("checkout.bookAnother")}
        </button>
      </div>
    </div>
  );
}

// ─── Main Checkout ───
export function Checkout() {
  const queryClient = useQueryClient();
  const { state, dispatch } = useBooking();
  const navigate = useNavigate();
  const { t } = useLocale();
  const { chime } = useSound();
  const step = state.checkoutStep;
  const confirmed = !!state.bookingRef && step === 3;
  const [appliedOffer, setAppliedOffer] = useState<OfferMeta | undefined>();

  const movie = state.selectedMovie;
  const showtime = state.selectedShowtime;

  if (!movie || !showtime || state.selectedSeats.length === 0) {
    return (
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center gap-4 bg-mesh grain px-4 py-24">
        <p className="text-sm text-text-muted">{t("checkout.sessionEnded")}</p>
        <button
          type="button"
          data-cursor="button"
          onClick={() => {
            startNewBooking(dispatch);
            navigate({ to: "/" });
          }}
          className="rounded-md bg-accent-blood px-5 py-3 font-display text-xs tracking-[0.25em] text-white"
        >
          {t("checkout.bookAnother")}
        </button>
      </section>
    );
  }

  const subtotalUsd = useMemo(
    () => calcBookingSubtotalUsd(movie, showtime, state.selectedSeats),
    [movie, showtime, state.selectedSeats],
  );

  const handleConfirmBooking = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      dispatch({ type: "BOOKING_ERROR", message: "Vui lòng đăng nhập lại để thanh toán." });
      return false;
    }
    if (!state.selectedShowtime) {
      dispatch({ type: "BOOKING_ERROR", message: "Vui lòng chọn suất chiếu." });
      return false;
    }
    const maLichChieu = state.selectedShowtime.maLichChieu;
    if (!maLichChieu) {
      dispatch({ type: "BOOKING_ERROR", message: "Lịch chiếu không hợp lệ (Mock data). Vui lòng chọn lịch chiếu có thật từ API." });
      return false;
    }
    try {
      const { quanLyDatVeApi } = await import("@/lib/cinema-api");
      const missingSeats: string[] = [];
      const danhSachVe = state.selectedSeats.map((seatLabel) => {
        const found = state.seatData.find((g) => g.tenGhe === seatLabel);
        if (!found?.maGhe) {
          missingSeats.push(seatLabel);
        }
        return {
          maGhe: found?.maGhe ?? 0,
          giaVe: found?.giaVe ?? state.selectedShowtime!.price ?? 0,
        };
      });

      if (missingSeats.length > 0 || danhSachVe.length !== state.selectedSeats.length) {
        throw new Error(`Không tìm thấy mã ghế cho: ${missingSeats.join(", ")}. Vui lòng quay lại chọn ghế và thử lại.`);
      }

      await quanLyDatVeApi.datVe({ maLichChieu, danhSachVe });

      const tongTien = Math.round(subtotalUsd);
      const bookingRef = `CMX${Date.now().toString(36).slice(-6).toUpperCase()}`;
      await quanLyDatVeApi.luuGiaoDich({
        maLichChieu,
        tongTien,
        noiDungCk: `CINEMAX ${bookingRef}`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đặt vé hoặc thanh toán thất bại";
      dispatch({ type: "BOOKING_ERROR", message });
      return false;
    }
    dispatch({ type: "CONFIRM" });
    queryClient.invalidateQueries({ queryKey: ["tickets"] });
    dispatch({ type: "NEXT_STEP" }); // Force step 3 so it shows Success screen
    chime();
    const colors = ["#e50914", "#f5c518", "#ffffff", "#ff6b35"];
    confetti({ particleCount: 120, spread: 80, startVelocity: 45, origin: { y: 0.5 }, colors });
    setTimeout(() => confetti({ particleCount: 80, spread: 100, angle: 60, origin: { x: 0, y: 0.7 }, colors }), 250);
    setTimeout(() => confetti({ particleCount: 80, spread: 100, angle: 120, origin: { x: 1, y: 0.7 }, colors }), 450);
    return true;
  };

  const handleNextStep = () => {
    // Save card if on payment step
    if (step === 2 && state.details.method === "card") {
      window.dispatchEvent(new Event("cinemax:save-card"));
    }
    dispatch({ type: "NEXT_STEP" });
  };

  const canAdvance = useMemo(() => {
    const d = state.details;
    if (step === 1) return d.name.length >= 2 && /.+@.+\..+/.test(d.email) && d.phone.length >= 7;
    if (step === 2) {
      if (d.method === "card") {
        const isSaved = d.cardNumber.includes("••••");
        if (isSaved) return d.cardCvv.length >= 3;
        return (
          d.cardNumber.replace(/\s/g, "").length === 16 &&
          d.cardName.length >= 2 &&
          d.cardExpiry.length === 5 &&
          d.cardCvv.length >= 3
        );
      }
      // QR: handled by its own "Đã chuyển khoản" button, hide the bottom nav button
      if (d.method === "qr") return false;
      return false;
    }
    return true;
  }, [step, state.details]);

  return (
    <section className="relative min-h-[100svh] bg-mesh grain vignette px-4 py-24 lg:px-10">
      <div className="mx-auto max-w-3xl">
        {!confirmed && (
          <button
            data-cursor="button"
            type="button"
            onClick={() => dispatch({ type: "GO_SEATS" })}
            className="mb-6 flex items-center gap-2 text-sm text-text-muted hover:text-text-primary"
          >
            <ArrowLeft size={14} /> {t("checkout.backSeats")}
          </button>
        )}

        <div className="font-display text-xs tracking-[0.4em] text-accent-blood">{t("checkout.eyebrow")}</div>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl">{t("checkout.title")}</h2>

        <CheckoutProgress step={step} confirmed={confirmed} />

        <div className="mt-10 glass rounded-2xl p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 && <StepDetails />}
              {step === 2 && (
                <div className="space-y-6">
                  <StepPayment appliedOffer={appliedOffer} setAppliedOffer={setAppliedOffer} onConfirmBooking={handleConfirmBooking} />
                  <OrderSummary
                    compact
                    movieTitle={movie.title}
                    showtimeLabel={`${showtime.type} · ${showtime.time}`}
                    seats={state.selectedSeats}
                    subtotalUsd={subtotalUsd}
                    appliedOffer={appliedOffer}
                  />
                </div>
              )}
              {step === 3 && (
                <>
                  {state.bookingError && (
                    <div className="mb-4 rounded-lg border border-accent-blood/40 bg-accent-blood/10 px-4 py-3 text-sm text-accent-blood">
                      {state.bookingError}
                    </div>
                  )}
                  {confirmed ? <StepConfirmation /> : <StepReview appliedOffer={appliedOffer} onConfirm={handleConfirmBooking} />}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {step < 3 && (
          <div className="mt-6 flex items-center justify-between">
            <button
              data-cursor="button"
              type="button"
              onClick={() =>
                step === 1 ? dispatch({ type: "GO_SEATS" }) : dispatch({ type: "PREV_STEP" })
              }
              className="text-sm text-text-muted hover:text-text-primary"
            >
              {step === 1 ? t("checkout.backSeats") : t("checkout.back")}
            </button>
            <button
              data-cursor={canAdvance ? "button" : undefined}
              type="button"
              disabled={!canAdvance}
              onClick={handleNextStep}
              className={`inline-flex items-center gap-2 rounded-md px-5 py-3 font-display text-xs tracking-[0.25em] transition active:scale-95 ${canAdvance ? "bg-accent-blood text-white shadow-[0_0_24px_rgba(229,9,20,0.55)]" : "cursor-not-allowed bg-white/10 text-white/40"
                }`}
            >
              {step === 2 ? t("checkout.continueReview") : t("checkout.continue")}{" "}
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {step === 3 && !confirmed && (
          <div className="mt-6">
            <button
              data-cursor="button"
              type="button"
              onClick={() => dispatch({ type: "PREV_STEP" })}
              className="text-sm text-text-muted hover:text-text-primary"
            >
              {t("checkout.back")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
