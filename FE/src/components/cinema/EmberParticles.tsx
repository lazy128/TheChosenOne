export function EmberParticles({ count = 40 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 53) % 100;
        const size = 2 + ((i * 7) % 4);
        const duration = 8 + ((i * 3) % 12);
        const delay = (i * 0.7) % 12;
        const drift = ((i % 5) - 2) * 30;
        const hue = i % 3 === 0 ? "#f5c518" : "#ff6b35";
        return (
          <span
            key={i}
            className="absolute bottom-[-10vh] rounded-full"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              background: hue,
              boxShadow: `0 0 ${size * 3}px ${hue}`,
              animation: `ember-float ${duration}s linear ${delay}s infinite`,
              ["--drift" as any]: `${drift}px`,
            }}
          />
        );
      })}
    </div>
  );
}
