import { memo, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Crown, Heart } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { useSound } from "@/hooks/useSound";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { quanLyDatVeApi } from "@/lib/cinema-api";

const LETTERS = "ABCDEFGHIJKLMNO";
const MAX_SEATS = 6;

type SeatType = "standard" | "vip" | "couple" | "taken";

function parseSeatLabel(label: string) {
  const match = label.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  return { row: match[1], col: Number(match[2]) };
}

function backendSeatType(
  seatName: string,
  seat: { daDat: boolean; loaiGhe?: string } | undefined,
  vipRows: string[],
  coupleSet: Set<string>,
): SeatType | null {
  if (!seat) return null;
  if (seat.daDat) return "taken";
  if (coupleSet.has(seatName)) return "couple";
  if (vipRows.includes(seatName[0])) return "vip";
  return "standard";
}

function seatType(seat: string, taken: Set<string>, vipRows: string[], coupleSet: Set<string>): SeatType {
  if (taken.has(seat)) return "taken";
  if (coupleSet.has(seat)) return "couple";
  if (vipRows.includes(seat[0])) return "vip";
  return "standard";
}

function priceFor(type: SeatType) {
  if (type === "vip") return 90000;
  if (type === "couple") return 160000;
  return 75000;
}

const SeatButton = memo(function SeatButton({
  seat, type, selected, onClick, selectionIndex,
}: { seat: string; type: SeatType; selected: boolean; onClick: () => void; selectionIndex: number }) {
  const [hover, setHover] = useState(false);
  const taken = type === "taken";
  const base = "relative grid place-items-center rounded-md transition-all";
  const size = type === "vip" ? "h-8 w-8" : type === "couple" ? "h-8 w-[68px]" : "h-7 w-7";
  let cls = "bg-[#1a1a3a] text-text-primary/40 hover:scale-110 hover:bg-accent-ice/30 hover:text-accent-ice";
  if (type === "vip" && !selected) cls = "bg-[#241a08] text-accent-gold border border-accent-gold/60 hover:scale-110 hover:bg-accent-gold/20";
  if (type === "couple" && !selected) cls = "bg-[#2a1320] text-pink-300 border border-pink-400/60 hover:scale-105";
  if (taken) cls = "bg-white/[0.04] text-white/15 cursor-not-allowed";
  if (selected) cls = "bg-accent-blood text-white scale-110 ring-2 ring-accent-blood/40 shadow-[0_0_14px_rgba(229,9,20,0.7)]";

  return (
    <motion.button
      disabled={taken}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-cursor={taken ? undefined : "button"}
      whileTap={{ scale: 0.9 }}
      animate={selected ? { scale: [1, 1.35, 1.1] } : { scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`${base} ${size} ${cls}`}
      style={{ fontSize: 10 }}
    >
      {type === "couple" && !selected && <Heart size={11} className="opacity-70" />}
      {type === "vip" && !selected && <Crown size={11} className="opacity-80" />}
      {selected && <span className="font-display text-[11px] tracking-tighter">{selectionIndex + 1}</span>}
      {taken && <span className="text-[9px]">×</span>}

      {hover && !taken && (
        <span className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-bg-elevated px-2 py-1 text-[10px] font-medium text-text-primary shadow-lg ring-1 ring-white/10">
          {seat} · {type.toUpperCase()}
        </span>
      )}
    </motion.button>
  );
});

export function SeatPicker() {
  const { state, dispatch } = useBooking();
  const { tick } = useSound();
  const { format } = useFormatMoney();
  const movie = state.selectedMovie!;
  const showtime = state.selectedShowtime!;
  const [seatsLoaded, setSeatsLoaded] = useState(!showtime?.maLichChieu);
  const hasApiSeatMap = !!showtime?.maLichChieu && state.seatData.length > 0;
  const canRenderSeatMap = !showtime?.maLichChieu || hasApiSeatMap;

  const seatByName = useMemo(() => {
    return new Map(state.seatData.map((seat) => [seat.tenGhe, seat]));
  }, [state.seatData]);

  const apiRows = useMemo(() => {
    if (!hasApiSeatMap) return [];
    return Array.from(new Set(state.seatData.map((seat) => parseSeatLabel(seat.tenGhe)?.row).filter(Boolean) as string[]))
      .sort((a, b) => LETTERS.indexOf(a) - LETTERS.indexOf(b));
  }, [hasApiSeatMap, state.seatData]);

  const cols = useMemo(() => {
    if (!hasApiSeatMap) return movie.seatMap.cols;
    return state.seatData.reduce((max, seat) => Math.max(max, parseSeatLabel(seat.tenGhe)?.col ?? 0), 0);
  }, [hasApiSeatMap, movie.seatMap.cols, state.seatData]);

  const rows = hasApiSeatMap ? apiRows.length : Math.min(movie.seatMap.rows, LETTERS.length);
  const effectiveVipRows = movie.seatMap.vipRows;

  useEffect(() => {
    if (!showtime?.maLichChieu) {
      setSeatsLoaded(true);
      return;
    }

    let mounted = true;
    setSeatsLoaded(false);
    (async () => {
      try {
        const room = await quanLyDatVeApi.layDanhSachPhongVe(showtime.maLichChieu!);
        if (!mounted) return;
        dispatch({ type: "SET_SEAT_DATA", seats: room.danhSachGhe });
      } catch {
        if (!mounted) return;
        dispatch({ type: "SET_SEAT_DATA", seats: [] });
      } finally {
        if (mounted) setSeatsLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [showtime?.maLichChieu, dispatch]);

  useEffect(() => {
    if (!hasApiSeatMap || state.selectedSeats.length === 0) return;
    const hasInvalidSelection = state.selectedSeats.some((seat) => !seatByName.has(seat));
    if (hasInvalidSelection) {
      dispatch({ type: "CLEAR_SEATS" });
    }
  }, [hasApiSeatMap, state.selectedSeats, seatByName, dispatch]);

  const taken = useMemo(() => {
    if (state.seatData.length > 0) {
      return new Set(state.seatData.filter((seat) => seat.daDat).map((seat) => seat.tenGhe));
    }
    return new Set(movie.seatMap.takenSeats);
  }, [state.seatData, movie]);

  const effectiveCoupleSeats = useMemo(() => {
    if (!hasApiSeatMap) return movie.seatMap.coupleSeats;
    const lastRow = apiRows.at(-1);
    if (!lastRow || cols < 10) return [];
    return [`${lastRow}7-${lastRow}8`, `${lastRow}9-${lastRow}10`];
  }, [hasApiSeatMap, movie.seatMap.coupleSeats, apiRows, cols]);

  const coupleSet = useMemo(() => {
    const s = new Set<string>();
    effectiveCoupleSeats.forEach((p) => p.split("-").forEach((x) => s.add(x)));
    return s;
  }, [effectiveCoupleSeats]);

  const total = useMemo(() => {
    return state.selectedSeats.reduce((sum, st) => {
      let apiSeat = undefined;
      if (state.seatData.length > 0) {
        apiSeat = state.seatData.find((g) => g.tenGhe === st);
      }
      const t = backendSeatType(st, apiSeat, effectiveVipRows, coupleSet) ?? seatType(st, taken, effectiveVipRows, coupleSet);
      return sum + priceFor(t);
    }, 0);
  }, [state.selectedSeats, taken, effectiveVipRows, coupleSet, state.seatData]);

  const rowOffset = (r: number) => {
    const center = (rows - 1) / 2;
    return Math.abs(r - center) * 3;
  };

  return (
    <section className="relative min-h-[100svh] px-4 py-24 bg-mesh grain vignette overflow-hidden lg:px-10">
      <button
        data-cursor="button"
        onClick={() => dispatch({ type: "GO_SHOWTIMES" })}
        className="mx-auto mb-6 flex max-w-5xl items-center gap-2 text-sm text-text-muted hover:text-text-primary"
      >
        <ArrowLeft size={14} /> Back to showtimes
      </button>

      <div className="mx-auto max-w-5xl text-center">
        <div className="font-display text-xs tracking-[0.4em] text-accent-blood">/// PICK YOUR SEATS</div>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl">{movie.title}</h2>
        <p className="mt-1 text-xs text-text-muted">{showtime.type} · {showtime.time}</p>
      </div>

      <div className="relative mx-auto mt-10 max-w-3xl">
        <div
          className="screen-shimmer relative mx-auto h-3 w-[88%] overflow-hidden rounded-t-[100%] bg-gradient-to-b from-white/60 to-white/10"
          style={{
            transform: "perspective(600px) rotateX(-30deg)",
            boxShadow: "0 0 80px 10px rgba(255,255,255,0.25)",
          }}
        />
        <div className="mt-1 text-center font-display text-[11px] tracking-[0.6em] text-text-muted">SCREEN</div>
        <div
          className="absolute inset-x-[10%] top-3 -z-10 h-44"
          style={{
            background: "radial-gradient(ellipse at top, rgba(255,255,255,0.18), transparent 70%)",
          }}
        />
      </div>

      {!seatsLoaded ? (
        <div className="mx-auto mt-12 max-w-3xl rounded-xl border border-white/10 bg-black/20 px-4 py-8 text-center text-sm text-text-muted">
          Đang tải sơ đồ ghế...
        </div>
      ) : !canRenderSeatMap ? (
        <div className="mx-auto mt-12 max-w-3xl rounded-xl border border-accent-blood/40 bg-accent-blood/10 px-4 py-8 text-center text-sm text-accent-blood">
          Không tải được sơ đồ ghế thật từ API. Vui lòng chọn lại suất chiếu hoặc kiểm tra backend.
        </div>
      ) : (
        <div className="perspective-1000 mx-auto mt-12 w-full max-w-4xl">
          <div className="mx-auto flex flex-col items-center gap-2" style={{ transform: "rotateX(14deg)" }}>
            {Array.from({ length: rows }).map((_, r) => {
              const row = hasApiSeatMap ? apiRows[r] : LETTERS[r];
              return (
                <div key={row} className="flex items-center gap-3" style={{ transform: `translateY(${rowOffset(r)}px)` }}>
                  <span className="w-4 text-center font-display text-[10px] text-text-muted">{row}</span>
                  <div className="flex gap-1.5">
                    {Array.from({ length: cols }).map((_, c) => {
                      const seat = `${row}${c + 1}`;
                      const apiSeat = seatByName.get(seat);
                      if (hasApiSeatMap && !apiSeat) return null;
                      const t = backendSeatType(seat, apiSeat, effectiveVipRows, coupleSet) ?? seatType(seat, taken, effectiveVipRows, coupleSet);
                      if (t === "couple") {
                        const idx = effectiveCoupleSeats.findIndex((p) => p.split("-")[1] === seat);
                        if (idx !== -1) return null;
                      }
                      const selected = state.selectedSeats.includes(seat);
                      const selectionIndex = state.selectedSeats.indexOf(seat);
                      const aisle = c === Math.floor(cols / 2) - 1;
                      return (
                        <div key={seat} className={aisle ? "mr-4" : ""}>
                          <SeatButton
                            seat={seat}
                            type={t}
                            selected={selected}
                            selectionIndex={selectionIndex}
                            onClick={() => {
                              tick();
                              dispatch({ type: "TOGGLE_SEAT", seat, max: MAX_SEATS });
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <span className="w-4 text-center font-display text-[10px] text-text-muted">{row}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-4 text-[11px] text-text-muted">
        <div className="flex items-center gap-2"><span className="h-4 w-4 rounded bg-[#1a1a3a]" /> Standard</div>
        <div className="flex items-center gap-2"><span className="h-4 w-4 rounded bg-[#241a08] border border-accent-gold/60" /> VIP</div>
        <div className="flex items-center gap-2"><span className="h-4 w-6 rounded bg-[#2a1320] border border-pink-400/60" /> Couple</div>
        <div className="flex items-center gap-2"><span className="h-4 w-4 rounded bg-accent-blood" /> Selected</div>
        <div className="flex items-center gap-2"><span className="h-4 w-4 rounded bg-white/10" /> Taken</div>
      </div>

      <AnimatePresence>
        {state.selectedSeats.length > 0 && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="fixed inset-x-0 bottom-0 z-40"
          >
            <div className="mx-auto max-w-5xl m-3">
              <div className="glass flex flex-col items-stretch gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                <div>
                  <div className="font-display text-[10px] tracking-[0.3em] text-text-muted">SELECTED ({state.selectedSeats.length}/{MAX_SEATS})</div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {state.selectedSeats.map((s) => (
                      <motion.span
                        key={s}
                        layout
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="rounded-md bg-accent-blood/20 px-2 py-0.5 font-display text-xs text-accent-ember"
                      >
                        {s}
                      </motion.span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-display text-[10px] tracking-[0.3em] text-text-muted">TOTAL</div>
                    <motion.div
                      key={total}
                      initial={{ scale: 1.2, color: "#ff6b35" }}
                      animate={{ scale: 1, color: "#f0f0f0" }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="font-display text-3xl"
                    >
                      {format(total)}
                    </motion.div>
                  </div>
                  <button
                    data-cursor="button"
                    onClick={() => dispatch({ type: "GO_CHECKOUT" })}
                    className="inline-flex items-center gap-2 rounded-md bg-accent-blood px-5 py-3 font-display text-xs tracking-[0.25em] text-white shadow-[0_0_24px_rgba(229,9,20,0.55)] transition active:scale-95"
                  >
                    CHECKOUT <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
