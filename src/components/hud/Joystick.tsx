import { useRef, useEffect, useCallback } from "react";
import { useGameStore } from "../../stores/gameStore";

interface JoystickProps {
  side: "left";
}

export default function Joystick({ side }: JoystickProps) {
  const movePlayer = useGameStore((s) => s.movePlayer);
  const containerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activeTouch = useRef<number | null>(null);
  const originRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dirRef = useRef<{ dx: number; dz: number }>({ dx: 0, dz: 0 });
  const isSprinting = useRef(false);
  const rafRef = useRef<number | null>(null);

  const RADIUS = 50;
  const KNOB_SIZE = 40;

  const setKnob = useCallback((cx: number, cy: number) => {
    if (!knobRef.current) return;
    const dist = Math.hypot(cx, cy);
    const clamped = Math.min(dist, RADIUS);
    const angle = Math.atan2(cy, cx);
    const kx = Math.cos(angle) * clamped;
    const ky = Math.sin(angle) * clamped;
    knobRef.current.style.transform = `translate(${kx}px, ${ky}px)`;
    const norm = dist > 5 ? Math.min(dist / RADIUS, 1) : 0;
    dirRef.current = {
      dx: norm * Math.cos(angle),
      dz: norm * Math.sin(angle),
    };
  }, []);

  const resetKnob = useCallback(() => {
    if (knobRef.current) knobRef.current.style.transform = "translate(0,0)";
    dirRef.current = { dx: 0, dz: 0 };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      if (activeTouch.current !== null) return;
      const t = e.changedTouches[0];
      activeTouch.current = t.identifier;
      const rect = el.getBoundingClientRect();
      originRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };

    const onMove = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier !== activeTouch.current) continue;
        const cx = t.clientX - originRef.current.x;
        const cy = t.clientY - originRef.current.y;
        setKnob(cx, cy);
      }
    };

    const onEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouch.current) {
          activeTouch.current = null;
          resetKnob();
        }
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [setKnob, resetKnob]);

  // Game loop tick for smooth movement
  useEffect(() => {
    const loop = () => {
      const { dx, dz } = dirRef.current;
      if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
        movePlayer(dx, dz, isSprinting.current);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [movePlayer]);

  return (
    <div className="joystick-wrap">
      <div ref={containerRef} className="joystick-base">
        <div ref={knobRef} className="joystick-knob" />
      </div>
      <style>{`
        .joystick-wrap { display: flex; flex-direction: column; gap: 8px; }
        .joystick-base {
          width: 110px; height: 110px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: 2px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          position: relative;
          touch-action: none;
        }
        .joystick-knob {
          width: ${KNOB_SIZE}px; height: ${KNOB_SIZE}px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          border: 2px solid rgba(255,255,255,0.8);
          pointer-events: none;
          will-change: transform;
          transition: transform 0.05s;
        }
      `}</style>
    </div>
  );
}
