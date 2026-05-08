import { Suspense } from "react";
import Scene3D from "../game/Scene3D";
import GameLoop from "../game/GameLoop";
import HUD from "../components/hud/HUD";
import GameOverScreen from "./GameOverScreen";
import { useGameStore } from "../stores/gameStore";

export default function GameScreen() {
  const phase = useGameStore((s) => s.phase);

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#0a0a0f" }}>
      <GameLoop />
      <Scene3D />
      <HUD />
      {phase === "game_over" && <GameOverScreen />}
    </div>
  );
}
