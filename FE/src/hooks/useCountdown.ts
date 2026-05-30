import { useEffect, useState } from "react";

export function useCountdown(targetIso: string) {
  const compute = () => {
    const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s, done: diff === 0 };
  };
  const [t, setT] = useState(compute);
  useEffect(() => {
    const i = setInterval(() => setT(compute()), 1000);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetIso]);
  return t;
}
