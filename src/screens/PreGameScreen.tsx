import { useState } from "react";
import { useGameStore } from "../stores/gameStore";
import type { HeroType } from "../types/game";
import {
  HERO_MAX_HP, SKILL_COOLDOWN, MIN_MATCH_DURATION,
  MAX_MATCH_DURATION, MIN_KILL_LIMIT, MAX_KILL_LIMIT
} from "../constants/game";

interface HeroData {
  id: HeroType;
  name: string;
  icon: string;
  color: string;
  desc: string;
  skill: string;
  skillDesc: string;
}

const HEROES: HeroData[] = [
  {
    id: "medic",
    name: "Medic",
    icon: "➕",
    color: "#4caf50",
    desc: "Spesialis penyembuhan. HP tertinggi di tim.",
    skill: "HEAL",
    skillDesc: `Menyembuhkan diri sendiri atau rekan (+30 HP). Cooldown ${SKILL_COOLDOWN.medic} detik.`,
  },
  {
    id: "engineer",
    name: "Engineer",
    icon: "⚙",
    color: "#2196f3",
    desc: "Ahli crafting. Bisa membuat senjata di mana saja.",
    skill: "CRAFTING INSTAN",
    skillDesc: `Crafting senjata di mana saja tanpa bahan. Cooldown ${SKILL_COOLDOWN.engineer} detik.`,
  },
  {
    id: "specter",
    name: "Specter",
    icon: "💀",
    color: "#9c27b0",
    desc: "Ahli perangkap. Pasang ranjau dan turret otomatis.",
    skill: "PASANG PERANGKAP",
    skillDesc: `Pasang ranjau (ledak otomatis 1 petak) atau turret 360°. Cooldown ${SKILL_COOLDOWN.specter} detik.`,
  },
  {
    id: "fighter",
    name: "Fighter",
    icon: "⚡",
    color: "#ff9800",
    desc: "Tangguh dan kuat. HP ekstra & serangan kuat.",
    skill: "INVINCIBLE",
    skillDesc: `Kebal semua serangan selama 40 detik. Cooldown ${SKILL_COOLDOWN.fighter} detik.`,
  },
];

export default function PreGameScreen() {
  const settings = useGameStore((s) => s.settings);
  const setSettings = useGameStore((s) => s.setSettings);
  const startGame = useGameStore((s) => s.startGame);
  const setPhase = useGameStore((s) => s.setPhase);

  const [selectedHero, setSelectedHero] = useState<HeroType | null>(null);
  const [step, setStep] = useState<"settings" | "hero">("settings");

  const handleStartGame = () => {
    if (!selectedHero) return;
    startGame(selectedHero);
  };

  return (
    <div className="pre-root">
      <div className="pre-bg" />

      <div className="pre-header">
        <button className="pre-back" onClick={() => step === "hero" ? setStep("settings") : setPhase("menu")}>
          ← Kembali
        </button>
        <h1 className="pre-title">
          {step === "settings" ? "⚙ Pengaturan Match" : "⚔ Pilih Hero"}
        </h1>
        <div style={{ width: 60 }} />
      </div>

      <div className="pre-content">
        {step === "settings" && (
          <div className="settings-panel">
            <div className="setting-row">
              <label className="setting-label">⏱ Durasi Permainan</label>
              <div className="setting-control">
                <input
                  type="range"
                  min={MIN_MATCH_DURATION}
                  max={MAX_MATCH_DURATION}
                  step={30}
                  value={settings.duration}
                  onChange={(e) => setSettings({ duration: Number(e.target.value) })}
                  className="setting-slider"
                />
                <span className="setting-value">
                  {Math.floor(settings.duration / 60)}:{(settings.duration % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            <div className="setting-row">
              <label className="setting-label">💀 Batas Kill</label>
              <div className="setting-control">
                <input
                  type="range"
                  min={MIN_KILL_LIMIT}
                  max={MAX_KILL_LIMIT}
                  step={5}
                  value={settings.killLimit}
                  onChange={(e) => setSettings({ killLimit: Number(e.target.value) })}
                  className="setting-slider"
                />
                <span className="setting-value">{settings.killLimit} kill</span>
              </div>
            </div>

            <div className="setting-summary">
              <div className="summary-item">
                <span className="summary-icon">🤖</span>
                <div>
                  <p className="summary-label">Mode</p>
                  <p className="summary-val">Offline vs Bot (5v5)</p>
                </div>
              </div>
              <div className="summary-item">
                <span className="summary-icon">⏱</span>
                <div>
                  <p className="summary-label">Durasi</p>
                  <p className="summary-val">{Math.floor(settings.duration / 60)} menit</p>
                </div>
              </div>
              <div className="summary-item">
                <span className="summary-icon">💀</span>
                <div>
                  <p className="summary-label">Batas Kill</p>
                  <p className="summary-val">{settings.killLimit} kill</p>
                </div>
              </div>
            </div>

            <button className="pre-next-btn" onClick={() => setStep("hero")}>
              PILIH HERO →
            </button>
          </div>
        )}

        {step === "hero" && (
          <div className="hero-panel">
            <div className="hero-grid">
              {HEROES.map((hero) => (
                <button
                  key={hero.id}
                  className={`hero-card ${selectedHero === hero.id ? "hero-card-selected" : ""}`}
                  style={{ "--hero-color": hero.color } as React.CSSProperties}
                  onClick={() => setSelectedHero(hero.id)}
                >
                  <span className="hero-icon">{hero.icon}</span>
                  <h3 className="hero-name">{hero.name}</h3>
                  <p className="hero-desc">{hero.desc}</p>
                  <div className="hero-stats">
                    <div className="hero-stat">
                      <span className="hero-stat-label">HP</span>
                      <div className="hero-hp-bar">
                        <div
                          className="hero-hp-fill"
                          style={{ width: `${(HERO_MAX_HP[hero.id] / 120) * 100}%` }}
                        />
                      </div>
                      <span className="hero-stat-val">{HERO_MAX_HP[hero.id]}</span>
                    </div>
                  </div>
                  <div className="hero-skill-badge">
                    <span className="hero-skill-label">SKILL: {hero.skill}</span>
                    <p className="hero-skill-desc">{hero.skillDesc}</p>
                  </div>
                  {selectedHero === hero.id && (
                    <div className="hero-selected-badge">✓ DIPILIH</div>
                  )}
                </button>
              ))}
            </div>

            <button
              className="pre-start-btn"
              onClick={handleStartGame}
              disabled={!selectedHero}
            >
              {selectedHero ? `MULAI SEBAGAI ${HEROES.find(h => h.id === selectedHero)?.name.toUpperCase()}` : "PILIH HERO DULU"}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .pre-root {
          position: fixed; inset: 0;
          display: flex; flex-direction: column;
          background: #0a0a0f;
          font-family: 'Segoe UI', sans-serif;
          overflow-y: auto;
        }
        .pre-bg {
          position: fixed; inset: 0;
          background: radial-gradient(ellipse at 50% 0%, #1a1a2a 0%, #0a0a0f 60%);
          pointer-events: none;
        }
        .pre-header {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: space-between;
          padding: clamp(10px,1.5vh,16px) clamp(14px,3vw,24px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .pre-back {
          background: none; border: none; color: #778899;
          font-size: clamp(12px,1.8vw,14px); cursor: pointer; padding: 6px;
          -webkit-tap-highlight-color: transparent;
        }
        .pre-back:active { color: #fff; }
        .pre-title {
          font-size: clamp(13px,2.2vw,18px); font-weight: 700; color: #fff;
          letter-spacing: 2px; margin: 0;
        }
        .pre-content {
          position: relative; z-index: 1;
          flex: 1; display: flex; justify-content: center;
          padding: clamp(14px,2.5vh,30px) clamp(12px,2.5vw,20px);
          min-height: 0;
        }
        .settings-panel {
          width: min(500px, 100%);
          display: flex; flex-direction: column; gap: clamp(14px,2.5vh,24px);
        }
        .setting-row { display: flex; flex-direction: column; gap: 8px; }
        .setting-label {
          font-size: clamp(11px,1.7vw,13px); font-weight: 600; color: #aabbcc;
          letter-spacing: 2px; text-transform: uppercase;
        }
        .setting-control { display: flex; align-items: center; gap: 14px; }
        .setting-slider {
          flex: 1; appearance: none;
          height: 6px; border-radius: 3px;
          background: rgba(255,255,255,0.1); cursor: pointer;
          accent-color: #ff6b35;
        }
        .setting-value {
          font-size: clamp(15px,2.5vw,18px); font-weight: 700; color: #ff6b35;
          min-width: 60px; text-align: right;
        }
        .setting-summary {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: clamp(12px,2vh,20px);
          display: flex; flex-direction: column; gap: 10px;
        }
        .summary-item { display: flex; align-items: center; gap: 12px; }
        .summary-icon { font-size: clamp(18px,2.8vw,22px); }
        .summary-label { font-size: clamp(10px,1.4vw,11px); color: #556677; margin: 0; letter-spacing: 1px; }
        .summary-val { font-size: clamp(12px,2vw,14px); font-weight: 600; color: #fff; margin: 0; }
        .pre-next-btn {
          background: linear-gradient(135deg, #ff6b35, #ff4500);
          border: none; border-radius: 10px; color: #fff;
          font-size: clamp(13px,2.2vw,16px); font-weight: 800; letter-spacing: 3px;
          padding: clamp(14px,2.2vh,18px); cursor: pointer;
          transition: transform 0.1s;
          -webkit-tap-highlight-color: transparent;
        }
        .pre-next-btn:active { transform: scale(0.97); }

        .hero-panel {
          width: 100%; max-width: 900px;
          display: flex; flex-direction: column; gap: clamp(14px,2.5vh,24px); align-items: center;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(clamp(140px,28vw,200px), 1fr));
          gap: clamp(10px,1.5vw,16px); width: 100%;
        }
        .hero-card {
          background: rgba(255,255,255,0.04);
          border: 2px solid rgba(255,255,255,0.08);
          border-radius: clamp(10px,1.5vw,16px);
          padding: clamp(14px,2.5vh,24px) clamp(10px,1.8vw,18px);
          display: flex; flex-direction: column; gap: 6px;
          cursor: pointer; text-align: left;
          position: relative; overflow: hidden;
          transition: all 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .hero-card:active {
          border-color: var(--hero-color);
          background: color-mix(in srgb, var(--hero-color) 12%, transparent);
          transform: scale(0.98);
        }
        .hero-card-selected {
          border-color: var(--hero-color) !important;
          background: color-mix(in srgb, var(--hero-color) 15%, transparent) !important;
          box-shadow: 0 0 16px color-mix(in srgb, var(--hero-color) 30%, transparent);
        }
        .hero-icon { font-size: clamp(24px,4vw,36px); }
        .hero-name {
          font-size: clamp(14px,2.5vw,20px); font-weight: 800; color: #fff; margin: 0;
        }
        .hero-desc { font-size: clamp(10px,1.5vw,12px); color: #889aaa; margin: 0; line-height: 1.4; }
        .hero-stats { display: flex; flex-direction: column; gap: 6px; }
        .hero-stat { display: flex; align-items: center; gap: 8px; }
        .hero-stat-label { font-size: 10px; color: #667788; width: 20px; }
        .hero-hp-bar {
          flex: 1; height: 5px; background: rgba(255,255,255,0.1);
          border-radius: 3px; overflow: hidden;
        }
        .hero-hp-fill { height: 100%; background: var(--hero-color); border-radius: 3px; }
        .hero-stat-val { font-size: 11px; color: #aab; min-width: 25px; text-align: right; }
        .hero-skill-badge {
          background: rgba(255,255,255,0.05);
          border-radius: 8px; padding: clamp(6px,1vh,8px) 10px; margin-top: 2px;
        }
        .hero-skill-label {
          font-size: clamp(9px,1.3vw,10px); font-weight: 700; color: var(--hero-color);
          letter-spacing: 1px; display: block; margin-bottom: 3px;
        }
        .hero-skill-desc { font-size: clamp(9px,1.3vw,11px); color: #778899; margin: 0; line-height: 1.4; }
        .hero-selected-badge {
          position: absolute; top: 10px; right: 10px;
          background: var(--hero-color);
          color: #fff; font-size: clamp(8px,1.2vw,10px); font-weight: 800;
          border-radius: 6px; padding: 3px 7px; letter-spacing: 1px;
        }
        .pre-start-btn {
          background: linear-gradient(135deg, #ff6b35, #ff4500);
          border: none; border-radius: 12px; color: #fff;
          font-size: clamp(13px,2.2vw,17px); font-weight: 800; letter-spacing: 2px;
          padding: clamp(14px,2.5vh,20px) clamp(20px,4vw,40px); cursor: pointer;
          transition: all 0.15s; width: 100%;
          -webkit-tap-highlight-color: transparent;
        }
        .pre-start-btn:active:not(:disabled) { transform: scale(0.97); }
        .pre-start-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
