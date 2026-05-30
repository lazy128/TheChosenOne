import { useCallback, useEffect, useRef, useState } from "react";

let _ctx: AudioContext | null = null;
function ctx() {
  if (typeof window === "undefined") return null;
  if (!_ctx) _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return _ctx;
}

export function useSound() {
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("cmx-muted");
    if (stored === "1") setMuted(true);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      localStorage.setItem("cmx-muted", next ? "1" : "0");
      return next;
    });
  }, []);

  const tone = useCallback((freq: number, dur = 0.08, type: OscillatorType = "sine", gain = 0.06, delay = 0) => {
    if (mutedRef.current) return;
    const ac = ctx();
    if (!ac) return;
    const t = ac.currentTime + delay;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }, []);

  const tick = useCallback(() => tone(880, 0.06, "square", 0.04), [tone]);
  const chime = useCallback(() => {
    tone(523.25, 0.18, "sine", 0.08, 0);
    tone(659.25, 0.18, "sine", 0.08, 0.12);
    tone(783.99, 0.32, "sine", 0.09, 0.24);
  }, [tone]);

  return { muted, toggleMute, tick, chime };
}
