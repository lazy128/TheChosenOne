import { motion } from "framer-motion";

export function TerminalBlock({ path }: { path: string }) {
  const lines = [
    `ERROR_CODE: 404_NOT_FOUND`,
    `SCENE: ${path || "/"}`,
    `DIRECTOR: Unknown`,
    `PRODUCTION: CANCELLED 1970-01-01`,
    `STATUS: This content does not exist in any timeline.`,
  ];
  return (
    <div className="mt-8 w-full rounded-lg border border-white/5 bg-black/40 p-4 text-left">
      <div className="font-mono text-[11px] leading-relaxed text-text-muted">
        {lines.map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 + i * 0.4, duration: 0.05 }}
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              animation: `none`,
            }}
          >
            <TypeLine text={l} delay={0.9 + i * 0.4} />
          </motion.div>
        ))}
        <span
          className="inline-block text-blood"
          style={{ animation: "blink 0.8s steps(2, end) infinite" }}
        >
          |
        </span>
      </div>
    </div>
  );
}

function TypeLine({ text, delay }: { text: string; delay: number }) {
  const dur = Math.max(0.4, text.length * 0.03);
  return (
    <span
      style={{
        display: "inline-block",
        overflow: "hidden",
        whiteSpace: "nowrap",
        width: 0,
        animation: `type-${text.length} ${dur}s steps(${text.length}, end) ${delay}s forwards`,
      }}
    >
      <style>{`@keyframes type-${text.length}{from{width:0}to{width:${text.length}ch}}`}</style>
      {text}
    </span>
  );
}
