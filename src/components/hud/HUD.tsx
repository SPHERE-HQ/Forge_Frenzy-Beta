import { useGameStore } from "../../stores/gameStore";
import { HERO_MAX_HP, WEAPONS } from "../../constants/game";
import { formatTime } from "../../utils/math";
import Joystick from "./Joystick";
import ActionButtons from "./ActionButtons";
import BuildMenu from "./BuildMenu";

export default function HUD() {
  const player = useGameStore((s) => s.player);
  const bots = useGameStore((s) => s.bots);
  const settings = useGameStore((s) => s.settings);
  const elapsedTime = useGameStore((s) => s.elapsedTime);
  const isBuildMenuOpen = useGameStore((s) => s.isBuildMenuOpen);

  if (!player) return null;

  const remaining = Math.max(0, settings.duration - elapsedTime);
  const teamAKills = player.kills;
  const teamBBotsDead = bots.filter((b) => b.team === "B" && b.isPermanentlyDead).length;

  const teamA = [player, ...bots.filter((b) => b.team === "A")];
  const teamB = bots.filter((b) => b.team === "B");

  const heroColor: Record<string, string> = {
    medic: "#4caf50", engineer: "#2196f3", specter: "#9c27b0", fighter: "#ff9800"
  };

  return (
    <>
      {/* ── TOP BAR ── */}
      <div className="hud-top">
        {/* Team A kills */}
        <div className="hud-score hud-score-a">
          <span className="hud-score-kills">{teamAKills}</span>
          <span className="hud-score-label">TIM A</span>
        </div>

        {/* Timer + kill limit */}
        <div className="hud-center-top">
          <span className="hud-timer">{formatTime(remaining)}</span>
          <div className="hud-kill-info">
            <span className="hud-kill-a">{teamAKills}</span>
            <span className="hud-kill-sep"> / </span>
            <span className="hud-kill-b">{teamBBotsDead}</span>
            <span className="hud-kill-max"> (batas: {settings.killLimit})</span>
          </div>
        </div>

        {/* Team B kills */}
        <div className="hud-score hud-score-b">
          <span className="hud-score-label">TIM B</span>
          <span className="hud-score-kills">{teamBBotsDead}</span>
        </div>
      </div>

      {/* ── PLAYER INFO ── */}
      <div className="hud-player-info">
        <div className="hud-hp-section">
          <div className="hud-hp-bar-wrap">
            <div
              className="hud-hp-bar-fill"
              style={{
                width: `${(player.hp / player.maxHp) * 100}%`,
                background: player.hp > player.maxHp * 0.5
                  ? "#4caf50" : player.hp > player.maxHp * 0.25
                  ? "#ff9800" : "#f44336",
              }}
            />
          </div>
          <span className="hud-hp-text">{player.hp}</span>
        </div>
        <div className="hud-player-meta">
          <span className="hud-hero-badge" style={{ background: heroColor[player.hero] }}>
            {player.hero.toUpperCase()}
          </span>
          <span className="hud-nickname">{player.nickname}</span>
        </div>
        <div className="hud-skill-bar">
          <span className="hud-skill-label">SKILL</span>
          {player.skillCooldown > 0 ? (
            <span className="hud-skill-cd">{Math.ceil(player.skillCooldown)}s</span>
          ) : (
            <span className="hud-skill-ready">SIAP</span>
          )}
        </div>
      </div>

      {/* ── SCOREBOARD RIGHT ── */}
      <div className="hud-scoreboard">
        {[...teamA.slice(0, 5), ...teamB.slice(0, 5)].map((p, i) => (
          <div
            key={p.id}
            className={`hud-sb-row ${p.id === player.id ? "hud-sb-me" : ""} ${!p.isAlive ? "hud-sb-dead" : ""}`}
          >
            <span className={`hud-sb-team ${p.team === "A" ? "hud-sb-team-a" : "hud-sb-team-b"}`}>
              {p.team}
            </span>
            <span className="hud-sb-name">{p.nickname}</span>
            <span className="hud-sb-kills">{p.kills}</span>
          </div>
        ))}
      </div>

      {/* ── AMMO (kiri atas bawah) ── */}
      {player.weapon !== "unarmed" && (
        <div className="hud-ammo">
          <span className="hud-ammo-cur">{player.ammo}</span>
          <span className="hud-ammo-sep">/</span>
          <span className="hud-ammo-max">{player.maxAmmo}</span>
          <span className="hud-ammo-weapon">{WEAPONS[player.weapon].name}</span>
        </div>
      )}
      {player.weapon === "unarmed" && (
        <div className="hud-ammo">
          <span className="hud-ammo-weapon">Tangan Kosong</span>
          <span className="hud-ammo-hint">→ Crafting senjata dulu!</span>
        </div>
      )}

      {/* ── CONTROLS ── */}
      <div className="hud-controls-left">
        <Joystick side="left" />
      </div>
      <div className="hud-controls-right">
        <ActionButtons />
      </div>

      {/* ── BUILD MENU ── */}
      {isBuildMenuOpen && <BuildMenu />}

      <style>{`
        /* ─ TOP ─ */
        .hud-top {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 10px 16px 0;
          pointer-events: none;
        }
        .hud-score {
          display: flex; flex-direction: column; align-items: center;
          background: rgba(0,0,0,0.5); border-radius: 10px; padding: 6px 14px;
        }
        .hud-score-a { border-left: 3px solid #4fc3f7; }
        .hud-score-b { border-right: 3px solid #ff6b35; }
        .hud-score-kills { font-size: 22px; font-weight: 900; color: #fff; }
        .hud-score-label { font-size: 9px; color: #778899; letter-spacing: 2px; }
        .hud-center-top {
          display: flex; flex-direction: column; align-items: center;
          background: rgba(0,0,0,0.6); border-radius: 10px; padding: 6px 20px;
        }
        .hud-timer { font-size: 24px; font-weight: 900; color: #fff; letter-spacing: 2px; font-variant-numeric: tabular-nums; }
        .hud-kill-info { font-size: 11px; color: #aaa; }
        .hud-kill-a { color: #4fc3f7; font-weight: 700; }
        .hud-kill-b { color: #ff6b35; font-weight: 700; }
        .hud-kill-sep { color: #667; }
        .hud-kill-max { color: #556; }

        /* ─ PLAYER INFO ─ */
        .hud-player-info {
          position: fixed; bottom: 130px; left: 16px; z-index: 50;
          display: flex; flex-direction: column; gap: 6px;
          pointer-events: none;
        }
        .hud-hp-section {
          display: flex; align-items: center; gap: 8px;
        }
        .hud-hp-bar-wrap {
          width: 120px; height: 8px;
          background: rgba(255,255,255,0.15);
          border-radius: 4px; overflow: hidden;
        }
        .hud-hp-bar-fill {
          height: 100%; border-radius: 4px;
          transition: width 0.2s, background 0.3s;
        }
        .hud-hp-text { font-size: 14px; font-weight: 700; color: #fff; }
        .hud-player-meta { display: flex; align-items: center; gap: 6px; }
        .hud-hero-badge {
          font-size: 9px; font-weight: 800; letter-spacing: 1px;
          border-radius: 4px; padding: 2px 6px; color: #fff;
        }
        .hud-nickname { font-size: 12px; color: #ccc; }
        .hud-skill-bar { display: flex; align-items: center; gap: 6px; }
        .hud-skill-label { font-size: 9px; color: #667788; letter-spacing: 2px; }
        .hud-skill-cd { font-size: 12px; color: #ff9800; font-weight: 700; }
        .hud-skill-ready { font-size: 12px; color: #4caf50; font-weight: 700; }

        /* ─ SCOREBOARD ─ */
        .hud-scoreboard {
          position: fixed; top: 70px; right: 10px; z-index: 50;
          display: flex; flex-direction: column; gap: 2px;
          background: rgba(0,0,0,0.5); border-radius: 10px;
          padding: 8px 10px; min-width: 140px;
          pointer-events: none;
        }
        .hud-sb-row {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: #aaa; padding: 2px 0;
        }
        .hud-sb-me { color: #fff; font-weight: 700; }
        .hud-sb-dead { opacity: 0.35; text-decoration: line-through; }
        .hud-sb-team {
          font-size: 9px; font-weight: 700;
          border-radius: 3px; padding: 1px 4px;
        }
        .hud-sb-team-a { background: rgba(79,195,247,0.3); color: #4fc3f7; }
        .hud-sb-team-b { background: rgba(255,107,53,0.3); color: #ff6b35; }
        .hud-sb-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .hud-sb-kills { font-weight: 700; color: #fff; }

        /* ─ AMMO ─ */
        .hud-ammo {
          position: fixed; bottom: 130px; right: 16px; z-index: 50;
          display: flex; flex-direction: column; align-items: flex-end;
          pointer-events: none;
        }
        .hud-ammo-cur { font-size: 36px; font-weight: 900; color: #fff; line-height: 1; }
        .hud-ammo-sep { font-size: 16px; color: #556; }
        .hud-ammo-max { font-size: 18px; color: #889; }
        .hud-ammo-weapon { font-size: 11px; color: #aab; letter-spacing: 1px; }
        .hud-ammo-hint { font-size: 10px; color: #ff9800; }

        /* ─ CONTROLS ─ */
        .hud-controls-left {
          position: fixed; bottom: 20px; left: 20px; z-index: 50;
        }
        .hud-controls-right {
          position: fixed; bottom: 20px; right: 20px; z-index: 50;
          display: flex; flex-direction: column; gap: 8px; align-items: flex-end;
        }
      `}</style>
    </>
  );
}
