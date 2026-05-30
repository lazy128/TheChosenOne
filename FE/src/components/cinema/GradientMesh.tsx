export function GradientMesh() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-void" aria-hidden>
      <div
        className="absolute -inset-1/4"
        style={{
          background:
            "radial-gradient(40% 40% at 20% 30%, rgba(229,9,20,0.55), transparent 70%), radial-gradient(45% 45% at 80% 60%, rgba(80,20,120,0.55), transparent 70%), radial-gradient(50% 50% at 50% 100%, rgba(255,107,53,0.25), transparent 70%)",
          animation: "mesh-shift 20s ease-in-out infinite",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,5,8,0.4) 0%, rgba(5,5,8,0.1) 50%, rgba(5,5,8,0.6) 100%)",
        }}
      />
    </div>
  );
}
