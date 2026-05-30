import { useEffect, useRef } from "react";

export function BrokenProjector({ wobbleMore = false }: { wobbleMore?: boolean }) {
  const beamRef = useRef<SVGPolygonElement>(null);

  useEffect(() => {
    let timeout: number;
    const flicker = () => {
      if (beamRef.current) {
        const drop = Math.random() < 0.4;
        beamRef.current.setAttribute("opacity", drop ? String(0.15 + Math.random() * 0.3) : "0.85");
      }
      timeout = window.setTimeout(flicker, 100 + Math.random() * 200);
    };
    flicker();
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div
      className="relative"
      style={{
        width: "min(200px, 45vw)",
        height: "auto",
        animation: wobbleMore ? "wobble-tiny 1.2s ease-in-out infinite" : undefined,
      }}
    >
      <svg viewBox="0 0 200 180" className="w-full">
        <defs>
          <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f5c518" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f5c518" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* malfunction light */}
        <circle
          cx="100"
          cy="22"
          r="3.5"
          fill="#e50914"
          style={{ animation: "blink 0.8s steps(2,end) infinite" }}
        />

        {/* reels */}
        <circle cx="65" cy="55" r="22" fill="none" stroke="#e50914" strokeWidth="1.5" />
        <circle cx="65" cy="55" r="6" fill="none" stroke="#e50914" strokeWidth="1.5" />
        <circle cx="135" cy="55" r="22" fill="none" stroke="#e50914" strokeWidth="1.5" />
        <circle cx="135" cy="55" r="6" fill="none" stroke="#e50914" strokeWidth="1.5" />

        {/* body */}
        <rect x="35" y="80" width="130" height="55" rx="6" fill="none" stroke="#e50914" strokeWidth="1.5" />
        <rect x="40" y="88" width="40" height="20" fill="none" stroke="#e50914" strokeWidth="1.2" />
        {/* lens */}
        <rect x="165" y="95" width="22" height="25" rx="2" fill="none" stroke="#e50914" strokeWidth="1.5" />
        <circle cx="176" cy="107.5" r="7" fill="none" stroke="#e50914" strokeWidth="1.2" />

        {/* beam */}
        <polygon
          ref={beamRef}
          points="187,98 230,80 230,135 187,118"
          fill="url(#beam)"
          opacity="0.85"
        />

        {/* dangling film */}
        <path
          d="M 80 135 Q 70 150 85 165 Q 100 178 90 195"
          fill="none"
          stroke="#e50914"
          strokeWidth="1.2"
          style={{ transformOrigin: "80px 135px", animation: "wobble-tiny 4s ease-in-out infinite" }}
        />
        <rect x="76" y="140" width="9" height="7" fill="none" stroke="#e50914" strokeWidth="0.8" />
        <rect x="80" y="155" width="9" height="7" fill="none" stroke="#e50914" strokeWidth="0.8" />
        <rect x="86" y="170" width="9" height="7" fill="none" stroke="#e50914" strokeWidth="0.8" />
      </svg>
    </div>
  );
}
