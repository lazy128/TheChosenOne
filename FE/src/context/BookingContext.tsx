import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { Movie, Showtime } from "@/data/movies";
import type { Ghe } from "@/lib/cinema-api";

type CurrentUser = {
  hoTen?: string;
  email?: string;
  soDt?: string;
};

export type Stage = "browse" | "showtimes" | "seats" | "checkout";

export type BookingDetails = {
  name: string;
  email: string;
  phone: string;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvv: string;
  method: "card" | "qr";
  paymentReady: boolean;
};

type State = {
  stage: Stage;
  checkoutStep: 1 | 2 | 3;
  selectedMovie: Movie | null;
  selectedCinema: string | null;
  selectedDate: string | null;
  selectedShowtime: Showtime | null;
  selectedSeats: string[];
  seatData: Ghe[];
  details: BookingDetails;
  bookingRef: string | null;
  bookingError: string | null;
};

type Action =
  | { type: "OPEN_SHOWTIMES"; movie: Movie }
  | { type: "CLOSE_SHOWTIMES" }
  | { type: "SET_CINEMA"; id: string }
  | { type: "SET_DATE"; iso: string }
  | { type: "SET_SHOWTIME"; showtime: Showtime }
  | { type: "GO_SHOWTIMES" }
  | { type: "GO_BROWSE" }
  | { type: "GO_SEATS" }
  | { type: "TOGGLE_SEAT"; seat: string; max?: number }
  | { type: "CLEAR_SEATS" }
  | { type: "SET_SEAT_DATA"; seats: Ghe[] }
  | { type: "GO_CHECKOUT" }
  | { type: "SET_DETAILS"; patch: Partial<BookingDetails> }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "CONFIRM" }
  | { type: "BOOKING_ERROR"; message: string }
  | { type: "RESET" };

function createInitialState(): State {
  return {
    stage: "browse",
    checkoutStep: 1,
    selectedMovie: null,
    selectedCinema: null,
    selectedDate: null,
    selectedShowtime: null,
    selectedSeats: [],
    seatData: [],
    details: {
      name: "",
      email: "",
      phone: "",
      cardNumber: "",
      cardName: "",
      cardExpiry: "",
      cardCvv: "",
      method: "card",
      paymentReady: false,
    },
    bookingRef: null,
    bookingError: null,
  };
}

const initial = createInitialState();

function getStoredUserDetails() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("currentUser");
    if (!raw) return null;
    const user = JSON.parse(raw) as CurrentUser;
    return {
      name: user.hoTen?.trim() || "",
      email: user.email?.trim() || "",
      phone: user.soDt?.trim() || "",
    };
  } catch {
    return null;
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "OPEN_SHOWTIMES":
      return { ...state, stage: "showtimes", selectedMovie: action.movie, selectedCinema: null, selectedDate: null, selectedShowtime: null, selectedSeats: [], seatData: [] };
    case "CLOSE_SHOWTIMES":
      return { ...state, stage: "browse" };
    case "SET_CINEMA":
      return { ...state, selectedCinema: action.id, selectedShowtime: null };
    case "SET_DATE":
      return { ...state, selectedDate: action.iso, selectedShowtime: null };
    case "SET_SHOWTIME":
      return { ...state, selectedShowtime: action.showtime, selectedSeats: [], seatData: [] };
    case "GO_SHOWTIMES":
      if (!state.selectedMovie) return state;
      return { ...state, stage: "showtimes" };
    case "GO_BROWSE":
      return { ...state, stage: "browse" };
    case "GO_SEATS":
      return { ...state, stage: "seats" };
    case "TOGGLE_SEAT": {
      const exists = state.selectedSeats.includes(action.seat);
      if (exists) return { ...state, selectedSeats: state.selectedSeats.filter((s) => s !== action.seat) };
      if (state.selectedSeats.length >= (action.max ?? 5)) return state;
      return { ...state, selectedSeats: [...state.selectedSeats, action.seat] };
    }
    case "CLEAR_SEATS":
      return { ...state, selectedSeats: [] };
    case "SET_SEAT_DATA":
      return { ...state, seatData: action.seats };
    case "GO_CHECKOUT": {
      const userDetails = getStoredUserDetails();
      return {
        ...state,
        stage: "checkout",
        checkoutStep: 1,
        bookingRef: null,
        bookingError: null,
        details: {
          ...state.details,
          name: state.details.name || userDetails?.name || "",
          email: state.details.email || userDetails?.email || "",
          phone: state.details.phone || userDetails?.phone || "",
        },
      };
    }
    case "SET_DETAILS":
      return { ...state, details: { ...state.details, ...action.patch } };
    case "NEXT_STEP":
      return { ...state, checkoutStep: Math.min(3, state.checkoutStep + 1) as 1 | 2 | 3 };
    case "PREV_STEP":
      return { ...state, checkoutStep: Math.max(1, state.checkoutStep - 1) as 1 | 2 | 3 };
    case "CONFIRM":
      return { ...state, bookingRef: "CMX-" + Math.random().toString(36).slice(2, 8).toUpperCase(), bookingError: null };
    case "BOOKING_ERROR":
      return { ...state, bookingError: action.message };
    case "RESET":
      return createInitialState();
    default:
      return state;
  }
}

const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useBooking() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
