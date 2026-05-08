import { useEffect, useRef } from "react";
import { useGameStore } from "../stores/gameStore";

export default function GameLoop() {
  const tick = useGameStore((s) => s.tick);
  const phase = useGameStore((s) => s.phase);
  const lastTime = useRef<number>(performance.now());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== "playing") return;

    const loop = (now: number) => {
      const delta = Math.min((now - lastTime.current) / 1000, 0.05);
      lastTime.current = now;
      tick(delta);
      rafRef.current = requestAnimationFrame(loop);
    };

    lastTime.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, tick]);

  return null;
}
