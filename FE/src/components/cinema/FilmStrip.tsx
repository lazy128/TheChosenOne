export function FilmStrip() {
  const cells = Array.from({ length: 40 });
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 overflow-hidden bg-black/80"
      aria-hidden
    >
      <div
        className="flex flex-col gap-2 py-2"
        style={{ animation: "film-scroll 20s linear infinite" }}
      >
        {[...cells, ...cells].map((_, i) => (
          <div
            key={i}
            className="mx-auto h-10 w-4 rounded-sm"
            style={{
              background: i % 2 === 0 ? "#1a1a24" : "#0a0a10",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
