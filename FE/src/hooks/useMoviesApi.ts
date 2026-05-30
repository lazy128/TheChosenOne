import { useEffect, useMemo, useState } from "react";
import type { Movie } from "@/data/movies";
import { MOVIES } from "@/data/movies";
import { quanLyPhimApi, quanLyRapApi } from "@/lib/cinema-api";
import { adaptPhimToMovie } from "@/lib/movie-adapter";

export function useMoviesApi() {
  const [movies, setMovies] = useState<Movie[]>(MOVIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const items = await quanLyPhimApi.layDanhSachPhim("GP00");
        const adapted = await Promise.all(
          items.map(async (item) => {
            try {
              const detail = await quanLyRapApi.layThongTinLichChieuPhim(item.maPhim);
              return adaptPhimToMovie(item, detail);
            } catch {
              return adaptPhimToMovie(item);
            }
          }),
        );

        if (!mounted) return;
        setMovies(adapted);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : "Failed to load movies";
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const featured = useMemo(() => movies.filter((m) => m.status === "now_showing"), [movies]);

  return {
    movies,
    featured: featured.length > 0 ? featured : MOVIES.filter((m) => m.status === "now_showing"),
    loading,
    error,
  };
}
