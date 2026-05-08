import { useState } from "react";
import { useGameStore } from "../stores/gameStore";
import type { GameMode } from "../types/game";
import { MODES } from "../constants/game";

export default function MenuScreen() {
  const nickname = useGameStore((s) => s.nickname);
  const setPhase = useGameStore((s) => s.setPhase);
  const setSettings = useGameStore((s) => s.setSettings);
  const [activeMenu, setActiveMenu] = useState<"main" | "mode">("main");

  const handleSelectMode = (mode: GameMode) => {
    if (mode !== "offline") {
      alert("Mode ini belum tersedia. Pilih mode Offline (vs Bot).");
      return;
    }
    setSettings({ mode });
    setPhase("pre_game");
  };

  return (
    <div className="menu-root">
      <div className="menu-bg" />

      {/* Header */}
      <div className="menu-header">
        <div className="menu-logo">
          <span className="menu-logo-icon">◈</span>
          <div>
            <p className="menu-studio">SPHERE-HQ</p>
            <h1 className="menu-game-title">FORGE FRENZY</h1>
          </div>
        </div>
        <div className="menu-player-badge">
          <span className="menu-player-icon">👤</span>
          <span className="menu-player-name">{nickname}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="menu-center">
        {activeMenu === "main" && (
          <div className="menu-main-btns">
            <button className="menu-btn menu-btn-primary" onClick={() => setActiveMenu("mode")}>
              <span className="menu-btn-icon">▶</span>
              BERMAIN
            </button>
            <button className="menu-btn menu-btn-secondary" onClick={() => alert("Segera hadir!")}>
              <span className="menu-btn-icon">⚙</span>
              PENGATURAN
            </button>
            <button className="menu-btn menu-btn-secondary" onClick={() => alert("Segera hadir!")}>
              <span className="menu-btn-icon">🏆</span>
              PAPAN SKOR
            </button>
            <button className="menu-btn menu-btn-secondary" onClick={() => setPhase("nickname")}>
              <span className="menu-btn-icon">✏</span>
              GANTI NICKNAME
            </button>
          </div>
        )}

        {activeMenu === "mode" && (
          <div className="mode-select">
            <button className="mode-back-btn" onClick={() => setActiveMenu("main")}>← Kembali</button>
            <h2 className="mode-title">Pilih Mode Permainan</h2>
            <div className="mode-cards">
              {(Object.entries(MODES) as [GameMode, string][]).map(([key, label]) => (
                <button
                  key={key}
                  className={`mode-card ${key === "offline" ? "mode-card-available" : "mode-card-soon"}`}
                  onClick={() => handleSelectMode(key)}
                >
                  <span className="mode-card-icon">
                    {key === "offline" ? "🤖" : key === "online" ? "🌐" : "📡"}
                  </span>
                  <span className="mode-card-label">{label}</span>
                  {key !== "offline" && <span className="mode-badge">Segera</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="menu-footer">
        <span>v0.1.0-beta · SPHERE-HQ © 2025</span>
      </div>

      <style>{`
        .menu-root {
          position: fixed; inset: 0;
          display: flex; flex-direction: column;
          background: #0a0a0f;
          font-family: 'Segoe UI', sans-serif;
          overflow: hidden;
        }
        .menu-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 20% 80%, #0d1a2a 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 20%, #1a0d0a 0%, transparent 60%),
                      linear-gradient(180deg, #0a0a0f 0%, #0d0d1a 100%);
        }
        .menu-header {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 30px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .menu-logo { display: flex; align-items: center; gap: 14px; }
        .menu-logo-icon { font-size: 36px; color: #4fc3f7; text-shadow: 0 0 15px #4fc3f7; }
        .menu-studio { font-size: 10px; letter-spacing: 4px; color: #4fc3f7; margin: 0; }
        .menu-game-title { font-size: 24px; font-weight: 900; color: #fff; margin: 0; letter-spacing: 3px; }
        .menu-player-badge {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 8px 16px;
        }
        .menu-player-icon { font-size: 16px; }
        .menu-player-name { font-size: 14px; font-weight: 600; color: #fff; }
        .menu-center {
          position: relative; z-index: 1;
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .menu-main-btns {
          display: flex; flex-direction: column; gap: 14px;
          width: min(320px, 90vw);
        }
        .menu-btn {
          display: flex; align-items: center; gap: 12px;
          border-radius: 12px; border: none;
          font-size: 15px; font-weight: 700; letter-spacing: 2px;
          padding: 18px 24px; cursor: pointer;
          transition: transform 0.1s, opacity 0.2s;
        }
        .menu-btn:hover { transform: translateX(4px); opacity: 0.9; }
        .menu-btn:active { transform: translateX(0); }
        .menu-btn-primary {
          background: linear-gradient(135deg, #ff6b35, #ff4500);
          color: #fff; font-size: 18px;
        }
        .menu-btn-secondary {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #ccc;
        }
        .menu-btn-icon { font-size: 18px; }
        .mode-select { width: min(500px, 90vw); text-align: center; }
        .mode-back-btn {
          background: none; border: none; color: #778899; cursor: pointer;
          font-size: 14px; padding: 8px 0; display: block; margin-bottom: 20px;
        }
        .mode-back-btn:hover { color: #fff; }
        .mode-title {
          font-size: 18px; font-weight: 700; color: #fff;
          letter-spacing: 2px; margin-bottom: 24px;
        }
        .mode-cards { display: flex; flex-direction: column; gap: 12px; }
        .mode-card {
          display: flex; align-items: center; gap: 16px;
          border-radius: 14px; border: 1.5px solid rgba(255,255,255,0.1);
          padding: 20px 24px; cursor: pointer;
          font-size: 16px; font-weight: 700; letter-spacing: 1px;
          transition: all 0.2s; position: relative;
        }
        .mode-card-available {
          background: rgba(255,107,53,0.1);
          border-color: #ff6b35;
          color: #fff;
        }
        .mode-card-available:hover { background: rgba(255,107,53,0.2); transform: translateX(4px); }
        .mode-card-soon { background: rgba(255,255,255,0.03); color: #556677; }
        .mode-card-icon { font-size: 24px; }
        .mode-card-label { flex: 1; text-align: left; }
        .mode-badge {
          font-size: 10px; background: rgba(255,255,255,0.1);
          border-radius: 6px; padding: 3px 8px; color: #778899;
          letter-spacing: 1px;
        }
        .menu-footer {
          position: relative; z-index: 1;
          text-align: center; padding: 12px;
          font-size: 11px; color: #334455; letter-spacing: 1px;
        }
      `}</style>
    </div>
  );
}
