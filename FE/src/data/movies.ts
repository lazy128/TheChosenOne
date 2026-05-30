export type Cinema = { id: string; name: string; address: string; distance: string };

export type Showtime = {
  maLichChieu?: number;
  maRap?: number;
  maPhim?: number;
  ngayGioChieu?: string;
  time: string;
  type: "IMAX" | "DOLBY" | "4DX" | "STANDARD";
  price: number;
  seatsAvailable: number;
  totalSeats: number;
};

export type CastMember = { name: string; role: string; avatar: string };

export type Movie = {
  id: string;
  title: string;
  tagline: string;
  genre: string[];
  rating: string; // age rating
  imdbScore: number;
  runtime: number;
  language: string;
  synopsis: string;
  cast: CastMember[];
  director: string;
  status: "now_showing" | "coming_soon";
  releaseDate: string; // ISO
  trailerUrl: string;
  poster: string;
  backdrop: string;
  accent: string; // hex
  showtimes: Record<string, Record<string, Showtime[]>>;
  seatMap: {
    rows: number;
    cols: number;
    takenSeats: string[];
    vipRows: string[];
    coupleSeats: string[];
  };
};

export const CINEMAS: Cinema[] = [
  { id: "CGV", name: "CGV Vincom Center", address: "72 Le Thanh Ton, District 1, HCMC", distance: "1.2 km" },
  { id: "LotteCinima", name: "Lotte Cinema Landmark 81", address: "208 Nguyen Huu Canh, Binh Thanh, HCMC", distance: "3.8 km" },
  { id: "BHDStar", name: "BHD Star Bitexco", address: "2 Hai Trieu, District 1, HCMC", distance: "0.6 km" },
];

const today = new Date();
today.setHours(0, 0, 0, 0);
export const DATES: { iso: string; day: string; date: string }[] = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date(today);
  d.setDate(today.getDate() + i);
  return {
    iso: d.toISOString().slice(0, 10),
    day: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
    date: String(d.getDate()).padStart(2, "0"),
  };
});

const seatPool = (rows: number, cols: number, density = 0.18): string[] => {
  const letters = "ABCDEFGHIJKLMNOPQR";
  const taken: string[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 1; c <= cols; c++) {
      if (Math.random() < density) taken.push(`${letters[r]}${c}`);
    }
  }
  return taken;
};

const buildShowtimes = (basePrice: number): Movie["showtimes"] => {
  const types: Showtime["type"][] = ["STANDARD", "DOLBY", "IMAX", "4DX"];
  const times = ["10:30", "13:15", "16:00", "18:45", "21:30", "23:15"];
  const out: Movie["showtimes"] = {};
  for (const c of CINEMAS) {
    out[c.id] = {};
    for (const d of DATES) {
      out[c.id][d.iso] = times.map((time, i) => {
        const type = types[(i + c.id.charCodeAt(1)) % types.length];
        const total = 120;
        const avail = Math.max(0, Math.round(total * (0.05 + Math.random() * 0.95)));
        const mult = type === "IMAX" ? 1.5 : type === "4DX" ? 1.7 : type === "DOLBY" ? 1.25 : 1;
        return {
          time,
          type,
          price: Math.round(basePrice * mult),
          seatsAvailable: avail,
          totalSeats: total,
        };
      });
    }
  }
  return out;
};

const inDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

export const MOVIES: Movie[] = [
  {
    id: "voidwalker",
    title: "VOIDWALKER",
    tagline: "Beyond the edge of everything, she remembered her name.",
    genre: ["Sci-Fi", "Thriller"],
    rating: "16+",
    imdbScore: 8.7,
    runtime: 142,
    language: "English",
    synopsis:
      "When a deep-space salvage pilot crosses an uncharted rift, the laws of memory and gravity begin to negotiate her survival in real time.",
    cast: [
      { name: "Mara Vance", role: "Captain Halloran", avatar: "https://i.pravatar.cc/80?img=47" },
      { name: "Idris Cole", role: "Engineer Sato", avatar: "https://i.pravatar.cc/80?img=12" },
      { name: "Lin Tao", role: "The Cartographer", avatar: "https://i.pravatar.cc/80?img=32" },
    ],
    director: "Aurelia Quinn",
    status: "now_showing",
    releaseDate: inDays(-3),
    trailerUrl: "#",
    poster: "https://picsum.photos/seed/void/400/600",
    backdrop: "https://picsum.photos/seed/void/1600/900",
    accent: "#e50914",
    showtimes: buildShowtimes(12),
    seatMap: { rows: 12, cols: 14, takenSeats: seatPool(12, 14), vipRows: ["A", "B"], coupleSeats: ["L7-L8", "L9-L10"] },
  },
  {
    id: "crimson-protocol",
    title: "CRIMSON PROTOCOL",
    tagline: "Trust nothing. Especially the order to stand down.",
    genre: ["Action", "Thriller"],
    rating: "18+",
    imdbScore: 8.1,
    runtime: 128,
    language: "English",
    synopsis:
      "An ex-intelligence operative is reactivated for a single night op in Hanoi — only to discover the protocol was written to bury her.",
    cast: [
      { name: "Noor Reyes", role: "Agent Vega", avatar: "https://i.pravatar.cc/80?img=48" },
      { name: "Daniel Park", role: "Handler", avatar: "https://i.pravatar.cc/80?img=15" },
      { name: "Anya Sokolov", role: "The Architect", avatar: "https://i.pravatar.cc/80?img=39" },
    ],
    director: "Marcus Halberd",
    status: "now_showing",
    releaseDate: inDays(-10),
    trailerUrl: "#",
    poster: "https://picsum.photos/seed/crimson/400/600",
    backdrop: "https://picsum.photos/seed/crimson/1600/900",
    accent: "#ff3b3b",
    showtimes: buildShowtimes(11),
    seatMap: { rows: 12, cols: 14, takenSeats: seatPool(12, 14, 0.22), vipRows: ["A", "B"], coupleSeats: ["L7-L8", "L9-L10"] },
  },
  {
    id: "neon-requiem",
    title: "NEON REQUIEM",
    tagline: "A love song for a city that forgot how to sleep.",
    genre: ["Drama", "Sci-Fi"],
    rating: "16+",
    imdbScore: 8.9,
    runtime: 134,
    language: "English",
    synopsis:
      "In 2049 Saigon, a memory courier and a synthetic singer trade fragments of a vanished decade to outrun a corporation that owns them both.",
    cast: [
      { name: "Yuki Mori", role: "Ren", avatar: "https://i.pravatar.cc/80?img=44" },
      { name: "Caleb Frost", role: "Atlas", avatar: "https://i.pravatar.cc/80?img=14" },
      { name: "Sage Adekunle", role: "Mira", avatar: "https://i.pravatar.cc/80?img=20" },
    ],
    director: "Linh Pham",
    status: "now_showing",
    releaseDate: inDays(-1),
    trailerUrl: "#",
    poster: "https://picsum.photos/seed/neon/400/600",
    backdrop: "https://picsum.photos/seed/neon/1600/900",
    accent: "#ff6b35",
    showtimes: buildShowtimes(13),
    seatMap: { rows: 12, cols: 14, takenSeats: seatPool(12, 14, 0.14), vipRows: ["A", "B"], coupleSeats: ["L7-L8", "L9-L10"] },
  },
  {
    id: "last-signal",
    title: "THE LAST SIGNAL",
    tagline: "The transmission was never meant to be answered.",
    genre: ["Horror", "Thriller"],
    rating: "18+",
    imdbScore: 7.6,
    runtime: 109,
    language: "English",
    synopsis:
      "Three radio astronomers in the Atacama desert catch a 47-second pulse repeating from a dead star — and something starts answering through the static.",
    cast: [
      { name: "Hollis Vega", role: "Dr. Arroyo", avatar: "https://i.pravatar.cc/80?img=5" },
      { name: "Theo Banister", role: "Sam", avatar: "https://i.pravatar.cc/80?img=68" },
      { name: "Rune Halvorsen", role: "Pia", avatar: "https://i.pravatar.cc/80?img=49" },
    ],
    director: "Saoirse Quinn",
    status: "coming_soon",
    releaseDate: inDays(12),
    trailerUrl: "#",
    poster: "https://picsum.photos/seed/signal/400/600",
    backdrop: "https://picsum.photos/seed/signal/1600/900",
    accent: "#00d4ff",
    showtimes: buildShowtimes(12),
    seatMap: { rows: 12, cols: 14, takenSeats: seatPool(12, 14), vipRows: ["A", "B"], coupleSeats: ["L7-L8", "L9-L10"] },
  },
  {
    id: "fracture-point",
    title: "FRACTURE POINT",
    tagline: "Every second choice rewrites the first.",
    genre: ["Action", "Sci-Fi"],
    rating: "16+",
    imdbScore: 8.3,
    runtime: 121,
    language: "English",
    synopsis:
      "A homicide detective who can rewind 90 seconds of her own life races to undo a serial bombing — and discovers each rewind costs her something she loves.",
    cast: [
      { name: "Kira Aldana", role: "Det. Vásquez", avatar: "https://i.pravatar.cc/80?img=29" },
      { name: "Owen Mercer", role: "Cooper", avatar: "https://i.pravatar.cc/80?img=11" },
      { name: "Sela Bright", role: "Dr. Han", avatar: "https://i.pravatar.cc/80?img=25" },
    ],
    director: "Tomás Whitfield",
    status: "coming_soon",
    releaseDate: inDays(26),
    trailerUrl: "#",
    poster: "https://picsum.photos/seed/fracture/400/600",
    backdrop: "https://picsum.photos/seed/fracture/1600/900",
    accent: "#f5c518",
    showtimes: buildShowtimes(13),
    seatMap: { rows: 12, cols: 14, takenSeats: seatPool(12, 14), vipRows: ["A", "B"], coupleSeats: ["L7-L8", "L9-L10"] },
  },
  {
    id: "aria",
    title: "ARIA",
    tagline: "The first AI to compose grief.",
    genre: ["Drama"],
    rating: "12+",
    imdbScore: 8.4,
    runtime: 118,
    language: "English",
    synopsis:
      "A widowed composer commissions a sentient instrument to finish her late wife's final symphony — and finds the music is composing her back.",
    cast: [
      { name: "Esme Calder", role: "Beatrix", avatar: "https://i.pravatar.cc/80?img=23" },
      { name: "Nadia Ko", role: "ARIA (voice)", avatar: "https://i.pravatar.cc/80?img=45" },
      { name: "Ravi Anand", role: "Maestro Solis", avatar: "https://i.pravatar.cc/80?img=33" },
    ],
    director: "June Marchetti",
    status: "coming_soon",
    releaseDate: inDays(40),
    trailerUrl: "#",
    poster: "https://picsum.photos/seed/aria/400/600",
    backdrop: "https://picsum.photos/seed/aria/1600/900",
    accent: "#a78bfa",
    showtimes: buildShowtimes(12),
    seatMap: { rows: 12, cols: 14, takenSeats: seatPool(12, 14), vipRows: ["A", "B"], coupleSeats: ["L7-L8", "L9-L10"] },
  },
];

export const ALL_GENRES = ["All", "Action", "Drama", "Sci-Fi", "Horror", "Comedy", "Thriller"];
