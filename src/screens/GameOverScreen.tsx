import { useGameStore } from "../stores/gameStore";
import { PLAYER_TEAM } from "../constants/game";
import { formatTime } from "../utils/math";

export default function GameOverScreen() {
  const matchResult = useGameStore((s) => s.matchResult);
  const resetGame = useGameStore((s) => s.resetGame);
  const player = useGameStore((s) => s.player);
  const settings = useGameStore((s) => s.settings);

  if (!matchResult) return null;

  const playerWon = matchResult.winner === PLAYER_TEAM;
  const isDraw = matchResult.winner === "draw";

  return (
    <div className="go-root">
      <div className="go-bg" />
      <div className="go-card">
        <div className={`go-result-badge ${playerWon ? "go-win" : isDraw ? "go-draw" : "go-lose"}`}>
          {playerWon ? "🏆 MENANG!" : isDraw ? "🤝 SERI!" : "💀 KALAH!"}
        </div>

        <h2 className="go-subtitle">Match Selesai</h2>

        <div className="go-scores">
          <div className={`go-team ${playerWon || isDraw ? "go-team-win" : ""}`}>
            <p className="go-team-label">Tim Kamu (A)</p>
            <p className="go-team-kills">{matchResult.teamAKills}</p>
            <p className="go-team-unit">KILL</p>
          </div>
          <div className="go-vs">VS</div>
          <div className={`go-team ${!playerWon && !isDraw ? "go-team-win" : ""}`}>
            <p className="go-team-label">Tim Bot (B)</p>
            <p className="go-team-kills">{matchResult.teamBKills}</p>
            <p className="go-team-unit">KILL</p>
          </div>
        </div>

        <div className="go-stats">
          <div className="go-stat-item">
            <span className="go-stat-icon">👤</span>
            <div>
              <p className="go-stat-label">Pemain</p>
              <p className="go-stat-val">{player?.nickname}</p>
            </div>
          </div>
          <div className="go-stat-item">
            <span className="go-stat-icon">💀</span>
            <div>
              <p className="go-stat-label">Kill Kamu</p>
              <p className="go-stat-val">{player?.kills ?? 0}</p>
            </div>
          </div>
          <div className="go-stat-item">
            <span className="go-stat-icon">⏱</span>
            <div>
              <p className="go-stat-label">Durasi</p>
              <p className="go-stat-val">{formatTime(matchResult.duration)}</p>
            </div>
          </div>
        </div>

        <div className="go-actions">
          <button className="go-btn go-btn-primary" onClick={resetGame}>
            🔄 Main Lagi
          </button>
          <button className="go-btn go-btn-secondary" onClick={resetGame}>
            ← Menu Utama
          </button>
        </div>
      </div>

      <style>{`
        .go-root {
          position: fixed; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.85);
          font-family: 'Segoe UI', sans-serif;
          z-index: 100;
        }
        .go-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 50%, #1a1a2a 0%, #0a0a0f 70%);
        }
        .go-card {
          position: relative; z-index: 1;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px; padding: 40px;
          width: min(440px, 92vw);
          display: flex; flex-direction: column; gap: 24px; align-items: center;
          backdrop-filter: blur(20px);
          box-shadow: 0 30px 80px rgba(0,0,0,0.6);
        }
        .go-result-badge {
          font-size: 28px; font-weight: 900; letter-spacing: 3px;
          border-radius: 14px; padding: 14px 28px;
        }
        .go-win { background: rgba(76,175,80,0.2); color: #4caf50; border: 2px solid #4caf50; }
        .go-lose { background: rgba(244,67,54,0.2); color: #f44336; border: 2px solid #f44336; }
        .go-draw { background: rgba(255,193,7,0.2); color: #ffc107; border: 2px solid #ffc107; }
        .go-subtitle { font-size: 14px; color: #667788; margin: 0; letter-spacing: 2px; }
        .go-scores {
          display: flex; align-items: center; gap: 24px; width: 100%;
        }
        .go-team {
          flex: 1; text-align: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; padding: 20px;
        }
        .go-team-win {
          border-color: rgba(76,175,80,0.4);
          background: rgba(76,175,80,0.08);
        }
        .go-team-label { font-size: 11px; color: #778899; margin: 0; letter-spacing: 1px; }
        .go-team-kills { font-size: 48px; font-weight: 900; color: #fff; margin: 4px 0; }
        .go-team-unit { font-size: 11px; color: #556677; margin: 0; letter-spacing: 2px; }
        .go-vs { font-size: 16px; color: #445566; font-weight: 700; }
        .go-stats {
          display: flex; flex-direction: column; gap: 12px; width: 100%;
        }
        .go-stat-item {
          display: flex; align-items: center; gap: 14px;
          background: rgba(255,255,255,0.03);
          border-radius: 10px; padding: 12px 16px;
        }
        .go-stat-icon { font-size: 20px; }
        .go-stat-label { font-size: 11px; color: #667788; margin: 0; }
        .go-stat-val { font-size: 15px; font-weight: 700; color: #fff; margin: 0; }
        .go-actions { display: flex; flex-direction: column; gap: 10px; width: 100%; }
        .go-btn {
          border-radius: 12px; border: none;
          font-size: 15px; font-weight: 700; letter-spacing: 2px;
          padding: 16px; cursor: pointer; transition: all 0.2s;
        }
        .go-btn-primary {
          background: linear-gradient(135deg, #ff6b35, #ff4500);
          color: #fff;
        }
        .go-btn-primary:hover { transform: translateY(-2px); }
        .go-btn-secondary {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #aaa;
        }
        .go-btn-secondary:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
