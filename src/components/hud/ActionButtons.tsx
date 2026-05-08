import { useRef, useCallback } from "react";
import { useGameStore } from "../../stores/gameStore";
import { WEAPONS } from "../../constants/game";

export default function ActionButtons() {
  const playerShoot = useGameStore((s) => s.playerShoot);
  const playerReload = useGameStore((s) => s.playerReload);
  const playerJump = useGameStore((s) => s.playerJump);
  const playerCrouch = useGameStore((s) => s.playerCrouch);
  const playerScope = useGameStore((s) => s.playerScope);
  const playerUseSkill = useGameStore((s) => s.playerUseSkill);
  const dropWeapon = useGameStore((s) => s.dropWeapon);
  const player = useGameStore((s) => s.player);
  const openBuildMenu = useGameStore((s) => s.openBuildMenu);
  const builderMachines = useGameStore((s) => s.builderMachines);

  const shootInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleShootStart = useCallback(() => {
    playerShoot();
    shootInterval.current = setInterval(playerShoot, 150);
  }, [playerShoot]);

  const handleShootEnd = useCallback(() => {
    if (shootInterval.current) clearInterval(shootInterval.current);
  }, []);

  if (!player) return null;

  const weaponType = player.weapon !== "unarmed" ? WEAPONS[player.weapon].type : "melee";
  const isRanged = weaponType !== "melee";
  const nearbyMachine = builderMachines.find((m) => {
    const dist = Math.hypot(
      player.position.x - m.position.x,
      player.position.z - m.position.z
    );
    return dist < 4;
  });

  return (
    <div className="action-btns">
      {/* Row 1: Skill + Scope */}
      <div className="action-row">
        <button
          className={`action-btn action-btn-skill ${player.skillCooldown > 0 ? "action-btn-cd" : ""}`}
          onTouchStart={(e) => { e.preventDefault(); playerUseSkill(); }}
          onClick={playerUseSkill}
        >
          {player.hero === "medic" ? "➕" : player.hero === "engineer" ? "⚙" : player.hero === "specter" ? "💀" : "⚡"}
        </button>
        {isRanged && (
          <button
            className={`action-btn action-btn-scope ${player.isScoping ? "action-btn-active" : ""}`}
            onTouchStart={(e) => { e.preventDefault(); playerScope(!player.isScoping); }}
            onClick={() => playerScope(!player.isScoping)}
          >
            🔭
          </button>
        )}
      </div>

      {/* Row 2: Jump + Crouch */}
      <div className="action-row">
        <button
          className="action-btn action-btn-jump"
          onTouchStart={(e) => { e.preventDefault(); playerJump(); }}
          onClick={playerJump}
        >
          ↑
        </button>
        <button
          className={`action-btn action-btn-crouch ${player.isCrouching ? "action-btn-active" : ""}`}
          onTouchStart={(e) => { e.preventDefault(); playerCrouch(!player.isCrouching); }}
          onClick={() => playerCrouch(!player.isCrouching)}
        >
          ↓
        </button>
      </div>

      {/* Row 3: Reload + Drop */}
      <div className="action-row">
        {isRanged && (
          <button
            className="action-btn action-btn-reload"
            onTouchStart={(e) => { e.preventDefault(); playerReload(); }}
            onClick={playerReload}
          >
            ↺
          </button>
        )}
        {player.weapon !== "unarmed" && (
          <button
            className="action-btn action-btn-drop"
            onTouchStart={(e) => { e.preventDefault(); dropWeapon(); }}
            onClick={dropWeapon}
          >
            🗑
          </button>
        )}
        {nearbyMachine && (
          <button
            className="action-btn action-btn-build"
            onTouchStart={(e) => { e.preventDefault(); openBuildMenu(nearbyMachine.id); }}
            onClick={() => openBuildMenu(nearbyMachine.id)}
          >
            🔨
          </button>
        )}
      </div>

      {/* SHOOT button — big */}
      <button
        className="action-btn action-btn-shoot"
        onTouchStart={(e) => { e.preventDefault(); handleShootStart(); }}
        onTouchEnd={(e) => { e.preventDefault(); handleShootEnd(); }}
        onMouseDown={handleShootStart}
        onMouseUp={handleShootEnd}
      >
        {player.weapon === "unarmed" ? "👊" : "🔫"}
      </button>

      <style>{`
        .action-btns {
          display: flex; flex-direction: column; gap: 8px; align-items: flex-end;
        }
        .action-row { display: flex; gap: 8px; }
        .action-btn {
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.25);
          font-size: 18px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; user-select: none; touch-action: none;
          transition: background 0.1s, transform 0.1s;
          background: rgba(0,0,0,0.55);
          color: #fff;
        }
        .action-btn:active { transform: scale(0.9); background: rgba(255,255,255,0.2); }
        .action-btn-active { background: rgba(255,165,0,0.35) !important; border-color: #ff9800; }
        .action-btn-cd { opacity: 0.4; }
        .action-btn-skill { width: 52px; height: 52px; border-color: #ff9800; }
        .action-btn-scope { width: 44px; height: 44px; }
        .action-btn-jump { width: 44px; height: 44px; font-size: 20px; }
        .action-btn-crouch { width: 44px; height: 44px; font-size: 20px; }
        .action-btn-reload { width: 44px; height: 44px; font-size: 22px; border-color: #4fc3f7; }
        .action-btn-drop { width: 40px; height: 40px; font-size: 16px; border-color: #f44336; }
        .action-btn-build { width: 44px; height: 44px; border-color: #ff9800; font-size: 20px; }
        .action-btn-shoot {
          width: 80px; height: 80px;
          border-radius: 50%;
          font-size: 28px;
          background: rgba(255,50,50,0.6);
          border: 3px solid rgba(255,100,100,0.8);
          box-shadow: 0 0 20px rgba(255,50,50,0.3);
        }
      `}</style>
    </div>
  );
}
