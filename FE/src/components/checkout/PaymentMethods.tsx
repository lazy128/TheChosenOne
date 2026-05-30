import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, QrCode, Copy, Check, Clock, ArrowRight, Building2 } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { useLocale } from "@/context/LocaleContext";
import { useFormatMoney } from "@/hooks/useFormatMoney";

// ─── Payment method tabs: only Card + QR ───
export function PaymentMethodTabs() {
  const { state, dispatch } = useBooking();
  const { t } = useLocale();
  const d = state.details;

  const methods = [
    { key: "card" as const, label: t("checkout.payCard"), icon: CreditCard },
    { key: "qr" as const, label: t("checkout.payQr"), icon: QrCode },
  ];

  const setMethod = (key: "card" | "qr") => {
    dispatch({
      type: "SET_DETAILS",
      patch: {
        method: key,
        paymentReady: false,
      },
    });
  };

  return (
    <div className="relative flex items-center gap-1 rounded-full border border-white/10 bg-bg-surface/60 p-1 text-sm">
      {methods.map((m) => (
        <button
          key={m.key}
          type="button"
          data-cursor="button"
          onClick={() => setMethod(m.key)}
          className="relative flex-1 px-3 py-2.5 font-display text-[11px] tracking-[0.2em]"
        >
          {d.method === m.key && (
            <motion.span layoutId="pay-pill" className="absolute inset-0 -z-10 rounded-full bg-accent-blood/15 ring-1 ring-accent-blood/40" />
          )}
          <span className={`inline-flex items-center justify-center gap-1.5 ${d.method === m.key ? "text-accent-ember" : "text-text-primary/75"}`}>
            <m.icon size={14} className="shrink-0" />
            <span>{m.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Realistic QR code generator (proper pattern with finder patterns) ───
function VietQrCode({ seed, size = 180 }: { seed: string; size?: number }) {
  const grid = useMemo(() => {
    // Generate deterministic QR-like pattern from seed
    let h = 5381;
    for (const c of seed) h = ((h << 5) + h + c.charCodeAt(0)) & 0xffffffff;

    const N = 25; // 25x25 modules (QR version 2)
    const cells: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));

    // Finder patterns (3 corners)
    const drawFinder = (r: number, c: number) => {
      for (let dr = 0; dr < 7; dr++) {
        for (let dc = 0; dc < 7; dc++) {
          const edge = dr === 0 || dr === 6 || dc === 0 || dc === 6;
          const inner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
          cells[r + dr][c + dc] = edge || inner;
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(0, N - 7);
    drawFinder(N - 7, 0);

    // Timing patterns
    for (let i = 8; i < N - 8; i++) {
      cells[6][i] = i % 2 === 0;
      cells[i][6] = i % 2 === 0;
    }

    // Alignment pattern (center)
    const ac = Math.floor(N / 2);
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const edge = Math.abs(dr) === 2 || Math.abs(dc) === 2;
        const center = dr === 0 && dc === 0;
        cells[ac + dr][ac + dc] = edge || center;
      }
    }

    // Fill data area with seeded pseudo-random
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        // Skip finder, timing, alignment
        const inFinder =
          (r < 8 && c < 8) || (r < 8 && c >= N - 8) || (r >= N - 8 && c < 8);
        const inTiming = r === 6 || c === 6;
        const inAlign = Math.abs(r - ac) <= 2 && Math.abs(c - ac) <= 2;
        if (inFinder || inTiming || inAlign) continue;

        h = ((h * 1103515245 + 12345) >>> 0) & 0x7fffffff;
        cells[r][c] = (h % 3) !== 0;
      }
    }

    return cells;
  }, [seed]);

  const cellSize = size / 25;

  return (
    <div
      className="rounded-xl bg-white p-3 shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
      style={{ width: size + 24, height: size + 24 }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {grid.map((row, r) =>
          row.map((on, c) =>
            on ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#000"
                rx={cellSize * 0.15}
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}

// ─── Copy button helper ───
function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  }, [value]);

  return (
    <div className="flex items-center justify-between rounded-lg border border-white/8 bg-black/30 px-3 py-2">
      <div>
        <div className="text-[9px] uppercase tracking-widest text-text-muted">{label}</div>
        <div className="font-mono text-sm text-text-primary">{value}</div>
      </div>
      <button
        type="button"
        onClick={copy}
        className="rounded-md p-1.5 text-text-muted transition hover:bg-white/10 hover:text-text-primary"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
      </button>
    </div>
  );
}

// ─── QR Payment Panel (VietQR style bank transfer) ───
export function QrPaymentPanel({
  amountUsd,
  onConfirmTransfer,
}: {
  amountUsd: number;
  onConfirmTransfer: () => Promise<boolean | void> | boolean | void;
}) {
  const { state } = useBooking();
  const { t } = useLocale();
  const { format } = useFormatMoney();
  const [confirming, setConfirming] = useState(false);
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutes
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Booking reference for transfer content
  const bookingRef = `CMX${Date.now().toString(36).slice(-6).toUpperCase()}`;
  const seed = `${state.selectedMovie?.id}-${bookingRef}-${amountUsd}`;

  // amountUsd is actually the base price in VND because our API returns VND prices
  const amountVnd = Math.round(amountUsd);

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      // Simulate verification delay
      await new Promise((resolve) => setTimeout(resolve, 1800));
      const ok = await onConfirmTransfer();
      if (ok === false) {
        setConfirming(false);
      }
    } catch {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bank info header */}
      <div className="flex items-center gap-3 rounded-xl border border-accent-ice/20 bg-accent-ice/5 px-4 py-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-white">
          <Building2 size={18} />
        </div>
        <div>
          <div className="font-display text-sm tracking-wider text-text-primary">
            Ngân hàng BIDV
          </div>
          <div className="text-[10px] tracking-widest text-text-muted">
            CINEMAX ENTERTAINMENT JSC
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[10px] text-accent-ember">
          <Clock size={11} />
          <span className="font-mono">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* QR + Transfer info */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[auto_1fr]">
        {/* QR Code */}
        <div className="flex flex-col items-center gap-2">
          <VietQrCode seed={seed} size={180} />
          <div className="flex items-center gap-1 text-[9px] tracking-widest text-text-muted">
            <QrCode size={10} />
            <span>VIETQR · NAPAS 247</span>
          </div>
        </div>

        {/* Transfer details */}
        <div className="space-y-2">
          <CopyField label="Số tài khoản" value="4170 1188 6868" />
          <CopyField label="Chủ tài khoản" value="CINEMAX ENTERTAINMENT JSC" />
          <CopyField label="Nội dung CK" value={`CINEMAX ${bookingRef}`} />

          <div className="rounded-lg border border-accent-gold/30 bg-accent-gold/5 px-3 py-2.5">
            <div className="text-[9px] uppercase tracking-widest text-accent-gold/80">
              Số tiền chuyển khoản
            </div>
            <div className="font-display text-2xl tracking-wider text-accent-gold">
              {amountVnd.toLocaleString("vi-VN")}₫
            </div>
            <div className="text-[10px] text-text-muted">
              ≈ {format(amountUsd)}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
        <div className="text-[10px] font-medium uppercase tracking-widest text-text-muted">
          Hướng dẫn
        </div>
        <ol className="mt-1.5 space-y-1 text-[11px] text-text-primary/70">
          <li className="flex gap-2">
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent-blood/20 text-[9px] font-bold text-accent-ember">1</span>
            Mở app ngân hàng & quét mã QR hoặc chuyển khoản thủ công
          </li>
          <li className="flex gap-2">
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent-blood/20 text-[9px] font-bold text-accent-ember">2</span>
            Nhập <strong>đúng số tiền</strong> và <strong>nội dung CK</strong> như trên
          </li>
          <li className="flex gap-2">
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent-blood/20 text-[9px] font-bold text-accent-ember">3</span>
            Sau khi CK thành công, nhấn <strong>"Đã chuyển khoản"</strong> bên dưới
          </li>
        </ol>
      </div>

      {/* Confirm transfer button */}
      <AnimatePresence mode="wait">
        {confirming ? (
          <motion.div
            key="verifying"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-2 py-3"
          >
            <div className="flex items-center gap-2">
              {[0, 0.15, 0.3].map((delay, i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-accent-ice"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay }}
                />
              ))}
            </div>
            <span className="font-display text-[11px] tracking-widest text-accent-ice">
              ĐANG XÁC MINH GIAO DỊCH...
            </span>
          </motion.div>
        ) : (
          <motion.button
            key="confirm-btn"
            type="button"
            data-cursor="button"
            onClick={handleConfirm}
            disabled={countdown === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-blood px-6 py-3.5 font-display text-sm tracking-[0.2em] text-white shadow-[0_0_30px_rgba(229,9,20,0.5)] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            whileTap={{ scale: 0.97 }}
          >
            <Check size={16} />
            ĐÃ CHUYỂN KHOẢN
            <ArrowRight size={14} />
          </motion.button>
        )}
      </AnimatePresence>

      {countdown === 0 && (
        <p className="text-center text-xs text-accent-blood">
          Phiên thanh toán đã hết hạn. Vui lòng đặt vé lại.
        </p>
      )}
    </div>
  );
}
