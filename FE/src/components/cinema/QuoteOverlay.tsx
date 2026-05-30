export function QuoteOverlay() {
  return (
    <div className="pointer-events-none absolute bottom-10 left-12 right-12 z-20 max-w-md">
      <div
        className="font-display leading-none text-blood"
        style={{ fontSize: "8rem", opacity: 0.3 }}
        aria-hidden
      >
        &ldquo;
      </div>
      <p className="-mt-10 text-lg italic text-text-primary/90">
        The best seat in the house is the one you booked.
      </p>
      <p className="mt-2 font-mono text-xs tracking-[0.3em] text-gold">— CINEMAX</p>
    </div>
  );
}
