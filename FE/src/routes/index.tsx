import { createFileRoute } from "@tanstack/react-router";
import { CinemaxApp } from "@/components/CinemaxApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CINEMAX — Book Your Cinema Experience" },
      { name: "description", content: "A cinematic noir movie ticket booking experience. Pick a film, pick a seat, step inside the dark." },
      { property: "og:title", content: "CINEMAX — Book Your Cinema Experience" },
      { property: "og:description", content: "Hand-curated cinema, IMAX/Dolby/4DX showtimes, and a seat picker that feels like the room." },
    ],
  }),
  component: Index,
});

function Index() {
  return <CinemaxApp />;
}
