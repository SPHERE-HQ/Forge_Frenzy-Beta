import { useGameStore } from "../../stores/gameStore";
import { WEAPONS } from "../../constants/game";
import { formatTime } from "../../utils/math";
import Joystick from "./Joystick";
import ActionButtons from "./ActionButtons";
import BuildMenu from "./BuildMenu";

const BASE = import.meta.env.BASE_URL ?? "/";
const FONT_URL = `${BASE}assets/fonts/KenneyFuture.ttf`;

export default function HUD() {
  const player        = useGameStore((s) => s.player);
  const bots          = useGameStore((s) => s.bots);
  const settings      = useGameStore((s) => s.settings);
  const elapsedTime   = useGameStore((s) => s.elapsedTime);
  const isBuildMenuOpen = useGameStore((s) => s.isBuildMenuOpen);

  if (!player) return null;

  const remaining      = Math.max(0, settings.duration - elapsedTime);
  const teamAKills     = player.kills;
  const teamBBotsDead  = bots.filter((b) => b.team === "B" && b.isPermanentlyDead).length;

  const teamA = [player, ...bots.filter((b) => b.team === "A")].slice(0, 5);
  const teamB = bots.filter((b) => b.team === "B").slice(0, 5);

  const heroColor: Record<string, string> = {
    medic: "#4caf50", engineer: "#2196f3", specter: "#9c27b0", fighter: "#ff9800",
  };

  return (
    <>
      <style>{`
        @font-face {
          font-family: 'KenneyFuture';
          src: url('${FONT_URL}') format('truetype');
          font-display: swap;
        }

        * { box-sizing: border-box; }
        .hud-top, .hud-timer, .hud-score-kills, .hud-ammo-cur,
        .hud-hp-text, .hud-hero-badge, .hud-sb-kills {
          font-family: 'KenneyFuture', monospace;
        }

        /* ─────── TOP BAR ─────── */
        .hud-top {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 8px 12px 0;
          pointer-events: none;
        }
        .hud-score {
          display: flex; flex-direction: column; align-items: center;
          background: rgba(0,0,0,0.55); border-radius: 8px; padding: 4px 12px;
          min-width: 64px;
        }
        .hud-score-a { border-left: 3px solid #4fc3f7; }
        .hud-score-b { border-right: 3px solid #ff6b35; }
        .hud-score-kills { font-size: 20px; font-weight: 900; color: #fff; }
        .hud-score-label { font-size: 8px; color: #889; letter-spacing: 2px; }
        .hud-center-top {
          display: flex; flex-direction: column; align-items: center;
          background: rgba(0,0,0,0.65); border-radius: 8px; padding: 5px 16px;
        }
        .hud-timer {
          font-size: 22px; font-weight: 900; color: #fff;
          letter-spacing: 2px; font-variant-numeric: tabular-nums;
        }
        .hud-kill-info { font-size: 10px; color: #aaa; white-space: nowrap; }
        .hud-kill-a    { color: #4fc3f7; font-weight: 700; }
        .hud-kill-b    { color: #ff6b35; font-weight: 700; }
        .hud-kill-sep  { color: #667; }
        .hud-kill-max  { color: #556; }

        /* ─────── SCOREBOARD ─────── */
        .hud-scoreboard {
          position: fixed; top: 60px; right: 8px; z-index: 50;
          display: flex; flex-direction: column; gap: 1px;
          background: rgba(0,0,0,0.52); border-radius: 8px; padding: 6px 8px;
          width: 130px; pointer-events: none;
          max-height: calc(50vh - 60px); overflow: hidden;
        }
        .hud-sb-row {
          display: flex; align-items: center; gap: 4px;
          font-size: 10px; color: #bbb; padding: 1px 0;
        }
        .hud-sb-me   { color: #fff; font-weight: 700; }
        .hud-sb-dead { opacity: 0.35; text-decoration: line-through; }
        .hud-sb-team {
          font-size: 8px; font-weight: 700; border-radius: 3px; padding: 1px 3px;
          flex-shrink: 0;
        }
        .hud-sb-team-a { background: rgba(79,195,247,0.3); color: #4fc3f7; }
        .hud-sb-team-b { background: rgba(255,107,53,0.3);  color: #ff6b35; }
        .hud-sb-name  { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .hud-sb-kills { font-weight: 700; color: #fff; flex-shrink: 0; }

        /* ─────── PLAYER INFO ─────── */
        .hud-player-info {
          position: fixed; bottom: 170px; left: 14px; z-index: 50;
          display: flex; flex-direction: column; gap: 5px;
          pointer-events: none;
        }
        .hud-hp-section  { display: flex; align-items: center; gap: 7px; }
        .hud-hp-bar-wrap {
          width: 110px; height: 7px;
          background: rgba(255,255,255,0.15); border-radius: 4px; overflow: hidden;
        }
        .hud-hp-bar-fill {
          height: 100%; border-radius: 4px;
          transition: width 0.2s ease, background 0.3s ease;
        }
        .hud-hp-text    { font-size: 13px; font-weight: 700; color: #fff; }
        .hud-player-meta { display: flex; align-items: center; gap: 5px; }
        .hud-hero-badge {
          font-size: 8px; font-weight: 800; letter-spacing: 1px;
          border-radius: 4px; padding: 2px 5px; color: #fff;
        }
        .hud-nickname   { font-size: 11px; color: #ccc; }
        .hud-skill-bar  { display: flex; align-items: center; gap: 5px; }
        .hud-skill-label { font-size: 8px; color: #667788; letter-spacing: 2px; }
        .hud-skill-cd   { font-size: 11px; color: #ff9800; font-weight: 700; }
        .hud-skill-ready { font-size: 11px; color: #4caf50; font-weight: 700; }

        /* ─────── AMMO ─────── */
        .hud-ammo {
          position: fixed; bottom: 280px; left: 14px; z-index: 50;
          display: flex; flex-direction: column; align-items: flex-start;
          pointer-events: none;
        }
        .hud-ammo-counts { display: flex; align-items: baseline; gap: 2px; }
        .hud-ammo-cur   { font-size: 30px; font-weight: 900; color: #fff; line-height: 1; }
        .hud-ammo-sep   { font-size: 14px; color: #556; margin: 0 2px; }
        .hud-ammo-max   { font-size: 16px; color: #889; }
        .hud-ammo-weapon { font-size: 10px; color: #aab; letter-spacing: 1px; margin-top: 1px; }
        .hud-ammo-hint  { font-size: 10px; color: #ff9800; font-weight: 600; }

        /* ─────── CONTROLS — joystick lebih masuk, tidak terlalu pojok ─────── */
        .hud-controls-left  {
          position: fixed;
          bottom: 36px;
          left: 36px;
          z-index: 50;
        }
        .hud-controls-right {
          position: fixed;
          bottom: 36px;
          right: 36px;
          z-index: 50;
          display: flex; flex-direction: column; gap: 6px; align-items: flex-end;
        }
      `}</style>

      {/* ═══ TOP BAR ═══ */}
      <div className="hud-top">
        <div className="hud-score hud-score-a">
          <span className="hud-score-kills">{teamAKills}</span>
          <span className="hud-score-label">TIM A</span>
        </div>

        <div className="hud-center-top">
          <span className="hud-timer">{formatTime(remaining)}</span>
          <div className="hud-kill-info">
            <span className="hud-kill-a">{teamAKills}</span>
            <span className="hud-kill-sep"> / </span>
            <span className="hud-kill-b">{teamBBotsDead}</span>
            <span className="hud-kill-max"> (batas:{settings.killLimit})</span>
          </div>
        </div>

        <div className="hud-score hud-score-b">
          <span className="hud-score-label">TIM B</span>
          <span className="hud-score-kills">{teamBBotsDead}</span>
        </div>
      </div>

      {/* Crosshair dihapus dari HUD — sudah ada di 3D di atas kepala karakter */}

      {/* ═══ SCOREBOARD ═══ */}
      <div className="hud-scoreboard">
        {[...teamA, ...teamB].map((p) => (
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

      {/* ═══ PLAYER INFO ═══ */}
      <div className="hud-player-info">
        <div className="hud-hp-section">
          <div className="hud-hp-bar-wrap">
            <div
              className="hud-hp-bar-fill"
              style={{
                width: `${(player.hp / player.maxHp) * 100}%`,
                background:
                  player.hp > player.maxHp * 0.5
                    ? "#4caf50"
                    : player.hp > player.maxHp * 0.25
                    ? "#ff9800"
                    : "#f44336",
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

      {/* ═══ AMMO ═══ */}
      <div className="hud-ammo">
        {player.weapon !== "unarmed" ? (
          <>
            <div className="hud-ammo-counts">
              <span className="hud-ammo-cur">{player.ammo}</span>
              <span className="hud-ammo-sep">/</span>
              <span className="hud-ammo-max">{player.maxAmmo}</span>
            </div>
            <span className="hud-ammo-weapon">{WEAPONS[player.weapon].name}</span>
          </>
        ) : (
          <span className="hud-ammo-hint">Crafting dulu!</span>
        )}
      </div>

      {/* ═══ JOYSTICK — bottom: 36px left: 36px (tidak terlalu pojok) ═══ */}
      <div className="hud-controls-left">
        <Joystick side="left" />
      </div>

      {/* ═══ TOMBOL AKSI ═══ */}
      <div className="hud-controls-right">
        <ActionButtons />
      </div>

      {/* ═══ BUILD MENU ═══ */}
      {isBuildMenuOpen && <BuildMenu />}
    </>
  );
}
