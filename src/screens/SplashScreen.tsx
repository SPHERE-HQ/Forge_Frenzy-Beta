import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../stores/gameStore";

type Stage = "studio" | "title" | "done";

export default function SplashScreen() {
  const setPhase = useGameStore((s) => s.setPhase);
  const [stage, setStage] = useState<Stage>("studio");
  const [opacity, setOpacity] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Fade in studio
    setTimeout(() => setOpacity(1), 100);
    // Studio → title
    timerRef.current = setTimeout(() => {
      setOpacity(0);
      setTimeout(() => {
        setStage("title");
        setTimeout(() => setOpacity(1), 100);
        // Title → nickname
        timerRef.current = setTimeout(() => {
          setOpacity(0);
          setTimeout(() => setPhase("nickname"), 800);
        }, 2200);
      }, 700);
    }, 2000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [setPhase]);

  return (
    <div className="splash-root">
      <div className="splash-bg" />
      <div
        className="splash-content"
        style={{ opacity, transition: "opacity 0.7s ease" }}
      >
        {stage === "studio" && (
          <div className="studio-card">
            <div className="studio-logo">
              <span className="studio-sphere">◈</span>
            </div>
            <p className="studio-name">SPHERE-HQ</p>
            <p className="studio-sub">STUDIO</p>
          </div>
        )}
        {stage === "title" && (
          <div className="title-card">
            <h1 className="game-title">
              <span className="title-forge">FORGE</span>
              <span className="title-frenzy"> FRENZY</span>
            </h1>
            <div className="title-underline" />
            <p className="title-tagline">Bangun. Serang. Menangkan.</p>
          </div>
        )}
      </div>

      <style>{`
        .splash-root {
          position: fixed; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background: #0a0a0f;
          font-family: 'Segoe UI', sans-serif;
          overflow: hidden;
        }
        .splash-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 50%, #1a1a3a 0%, #0a0a0f 70%);
        }
        .splash-content {
          position: relative; z-index: 1;
          text-align: center;
        }
        .studio-card {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .studio-logo {
          width: 80px; height: 80px;
          border: 2px solid #4fc3f7;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 30px #4fc3f766;
          margin-bottom: 12px;
        }
        .studio-sphere {
          font-size: 42px; color: #4fc3f7;
          text-shadow: 0 0 20px #4fc3f7;
        }
        .studio-name {
          font-size: 22px; font-weight: 700;
          letter-spacing: 6px; color: #fff;
          margin: 0;
        }
        .studio-sub {
          font-size: 11px; letter-spacing: 8px;
          color: #4fc3f7; margin: 0;
        }
        .title-card {
          display: flex; flex-direction: column; align-items: center; gap: 12px;
        }
        .game-title {
          font-size: clamp(48px, 10vw, 80px);
          font-weight: 900;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 4px;
        }
        .title-forge {
          color: #ff6b35;
          text-shadow: 0 0 30px #ff6b3566, 0 0 60px #ff6b3533;
        }
        .title-frenzy {
          color: #fff;
          text-shadow: 0 0 20px #ffffff44;
        }
        .title-underline {
          width: 200px; height: 3px;
          background: linear-gradient(90deg, transparent, #ff6b35, #4fc3f7, transparent);
          border-radius: 2px;
        }
        .title-tagline {
          font-size: 14px; letter-spacing: 3px;
          color: #8899aa; margin: 0;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
