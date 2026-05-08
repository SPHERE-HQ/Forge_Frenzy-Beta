import { useGameStore } from "../../stores/gameStore";
import { CRAFT_RECIPES, BUILDER_MACHINE_SLOTS } from "../../constants/game";

export default function BuildMenu() {
  const player = useGameStore((s) => s.player);
  const builderMachines = useGameStore((s) => s.builderMachines);
  const activeBuilderMachineId = useGameStore((s) => s.activeBuilderMachineId);
  const startCraft = useGameStore((s) => s.startCraft);
  const collectCraft = useGameStore((s) => s.collectCraft);
  const closeBuildMenu = useGameStore((s) => s.closeBuildMenu);

  if (!player || !activeBuilderMachineId) return null;

  const machine = builderMachines.find((m) => m.id === activeBuilderMachineId);
  if (!machine) return null;

  const isEngineer = player.hero === "engineer";

  const canCraft = (recipeId: string) => {
    if (isEngineer) return true;
    const recipe = CRAFT_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return false;
    return Object.entries(recipe.ingredients).every(
      ([item, count]) => (player.inventory[item as keyof typeof player.inventory] ?? 0) >= (count as number)
    );
  };

  return (
    <div className="build-overlay" onClick={closeBuildMenu}>
      <div className="build-panel" onClick={(e) => e.stopPropagation()}>
        <div className="build-header">
          <h2 className="build-title">🔨 Builder Machine</h2>
          <button className="build-close" onClick={closeBuildMenu}>✕</button>
        </div>

        {/* Slots */}
        <div className="build-slots">
          {machine.slots.map((slot, idx) => (
            <div key={idx} className={`build-slot ${slot.isComplete ? "build-slot-done" : slot.recipeId ? "build-slot-active" : ""}`}>
              <div className="build-slot-header">
                <span className="build-slot-label">Slot {idx + 1}</span>
                {slot.isComplete && slot.recipeId && (
                  <button
                    className="build-collect-btn"
                    onClick={() => collectCraft(machine.id, idx)}
                  >
                    ✓ Ambil
                  </button>
                )}
              </div>

              {slot.recipeId ? (
                <div className="build-slot-progress">
                  {slot.isComplete ? (
                    <span className="build-slot-done-text">
                      {CRAFT_RECIPES.find((r) => r.id === slot.recipeId)?.name} — Selesai!
                    </span>
                  ) : (
                    <>
                      <span className="build-slot-crafting">
                        {CRAFT_RECIPES.find((r) => r.id === slot.recipeId)?.name}...
                      </span>
                      <div className="build-progress-bar">
                        <div
                          className="build-progress-fill"
                          style={{
                            width: `${Math.min(100, (slot.progress / (CRAFT_RECIPES.find((r) => r.id === slot.recipeId)?.craftTime ?? 1)) * 100)}%`
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <span className="build-slot-empty">— Kosong —</span>
              )}
            </div>
          ))}
        </div>

        {/* Inventory */}
        <div className="build-inventory">
          <h3 className="build-inv-title">📦 Inventori Item</h3>
          <div className="build-inv-grid">
            {Object.entries(player.inventory).map(([item, count]) => (
              <div key={item} className="build-inv-item">
                <span className="build-inv-name">{item}</span>
                <span className="build-inv-count">×{count}</span>
              </div>
            ))}
            {Object.keys(player.inventory).length === 0 && (
              <span className="build-inv-empty">Tidak ada item. Ambil item di arena!</span>
            )}
          </div>
          {isEngineer && (
            <div className="build-engineer-badge">⚙ Engineer: Crafting gratis tanpa bahan!</div>
          )}
        </div>

        {/* Recipes */}
        <div className="build-recipes">
          <h3 className="build-recipes-title">📋 Daftar Crafting</h3>
          <div className="build-recipe-list">
            {CRAFT_RECIPES.filter((r) => r.weapon !== "unarmed" || r.id === "craft_medkit").map((recipe) => {
              const busy = machine.slots.every((s) => s.recipeId !== null);
              const affordable = canCraft(recipe.id);
              return (
                <div
                  key={recipe.id}
                  className={`build-recipe-card ${affordable ? "" : "build-recipe-locked"}`}
                >
                  <div className="build-recipe-info">
                    <span className="build-recipe-name">{recipe.name}</span>
                    <span className="build-recipe-time">⏱ {recipe.craftTime}s</span>
                    <div className="build-recipe-ingredients">
                      {Object.entries(recipe.ingredients).map(([item, count]) => {
                        const have = player.inventory[item as keyof typeof player.inventory] ?? 0;
                        return (
                          <span
                            key={item}
                            className={`build-ingr ${have >= (count as number) || isEngineer ? "build-ingr-ok" : "build-ingr-lack"}`}
                          >
                            {item} ×{count as number}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    className="build-craft-btn"
                    disabled={busy || !affordable}
                    onClick={() => {
                      const freeSlot = machine.slots.findIndex((s) => !s.recipeId);
                      if (freeSlot >= 0) startCraft(freeSlot, recipe.id);
                    }}
                  >
                    {busy ? "Penuh" : !affordable ? "Kurang" : "Buat"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .build-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Segoe UI', sans-serif;
        }
        .build-panel {
          background: #12131a; border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px; padding: 24px;
          width: min(500px, 94vw); max-height: 88vh; overflow-y: auto;
          display: flex; flex-direction: column; gap: 18px;
        }
        .build-header { display: flex; justify-content: space-between; align-items: center; }
        .build-title { font-size: 18px; font-weight: 800; color: #fff; margin: 0; }
        .build-close {
          background: none; border: none; color: #778899; font-size: 20px; cursor: pointer;
        }
        .build-slots { display: flex; gap: 12px; }
        .build-slot {
          flex: 1; background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 12px; min-height: 70px;
        }
        .build-slot-active { border-color: #ff9800; }
        .build-slot-done { border-color: #4caf50; background: rgba(76,175,80,0.1); }
        .build-slot-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .build-slot-label { font-size: 10px; color: #667; letter-spacing: 1px; }
        .build-collect-btn {
          background: #4caf50; border: none; border-radius: 6px;
          color: #fff; font-size: 11px; font-weight: 700;
          padding: 3px 8px; cursor: pointer;
        }
        .build-slot-empty { font-size: 12px; color: #445566; }
        .build-slot-crafting { font-size: 13px; color: #ff9800; }
        .build-slot-done-text { font-size: 13px; color: #4caf50; font-weight: 700; }
        .build-progress-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-top: 6px; overflow: hidden; }
        .build-progress-fill { height: 100%; background: #ff9800; border-radius: 3px; transition: width 0.3s; }
        .build-inventory { background: rgba(255,255,255,0.03); border-radius: 12px; padding: 14px; }
        .build-inv-title { font-size: 13px; color: #aab; margin: 0 0 10px; font-weight: 700; }
        .build-inv-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .build-inv-item {
          background: rgba(255,255,255,0.08); border-radius: 8px;
          padding: 5px 10px; display: flex; gap: 6px; align-items: center;
        }
        .build-inv-name { font-size: 12px; color: #aab; }
        .build-inv-count { font-size: 13px; font-weight: 700; color: #fff; }
        .build-inv-empty { font-size: 12px; color: #445566; }
        .build-engineer-badge {
          margin-top: 8px; font-size: 11px; color: #4fc3f7;
          background: rgba(33,150,243,0.1); border-radius: 6px; padding: 5px 10px;
        }
        .build-recipes { display: flex; flex-direction: column; gap: 8px; }
        .build-recipes-title { font-size: 13px; color: #aab; margin: 0 0 4px; font-weight: 700; }
        .build-recipe-list { display: flex; flex-direction: column; gap: 8px; }
        .build-recipe-card {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 12px 14px;
        }
        .build-recipe-locked { opacity: 0.5; }
        .build-recipe-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .build-recipe-name { font-size: 14px; font-weight: 700; color: #fff; }
        .build-recipe-time { font-size: 11px; color: #667788; }
        .build-recipe-ingredients { display: flex; flex-wrap: wrap; gap: 6px; }
        .build-ingr { font-size: 11px; border-radius: 5px; padding: 2px 6px; }
        .build-ingr-ok { background: rgba(76,175,80,0.2); color: #4caf50; }
        .build-ingr-lack { background: rgba(244,67,54,0.2); color: #f44336; }
        .build-craft-btn {
          background: #ff6b35; border: none; border-radius: 8px;
          color: #fff; font-size: 13px; font-weight: 700;
          padding: 8px 14px; cursor: pointer; white-space: nowrap;
          transition: opacity 0.2s;
        }
        .build-craft-btn:disabled { opacity: 0.4; cursor: not-allowed; background: #445; }
      `}</style>
    </div>
  );
}
