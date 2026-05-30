import type { Movie, Showtime } from "@/data/movies";

type SeatType = "standard" | "vip" | "couple" | "taken";

function seatType(
  seat: string,
  taken: Set<string>,
  vipRows: string[],
  coupleSet: Set<string>,
): SeatType {
  if (taken.has(seat)) return "taken";
  if (coupleSet.has(seat)) return "couple";
  if (vipRows.includes(seat[0])) return "vip";
  return "standard";
}

function priceFor(base: number, type: SeatType) {
  if (type === "vip") return Math.round(base * 1.5);
  if (type === "couple") return Math.round(base * 1.8);
  return base;
}

export function calcBookingSubtotalUsd(movie: Movie, showtime: Showtime, seats: string[]): number {
  const taken = new Set(movie.seatMap.takenSeats);
  const coupleSet = new Set<string>();
  movie.seatMap.coupleSeats.forEach((p) => p.split("-").forEach((x) => coupleSet.add(x)));

  return seats.reduce((sum, st) => {
    const t = seatType(st, taken, movie.seatMap.vipRows, coupleSet);
    return sum + priceFor(showtime.price, t);
  }, 0);
}

export function applyDiscount(subtotalUsd: number, discountPercent: number) {
  const discount = subtotalUsd * (discountPercent / 100);
  return { discount, total: Math.max(0, subtotalUsd - discount) };
}
