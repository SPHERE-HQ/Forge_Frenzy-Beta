import { useEffect } from "react";
import { useGameStore } from "./stores/gameStore";
import SplashScreen from "./screens/SplashScreen";
import NicknameScreen from "./screens/NicknameScreen";
import MenuScreen from "./screens/MenuScreen";
import PreGameScreen from "./screens/PreGameScreen";
import GameScreen from "./screens/GameScreen";

export default function App() {
  const phase = useGameStore((s) => s.phase);
  const setNickname = useGameStore((s) => s.setNickname);

  // Restore saved nickname on mount
  useEffect(() => {
    const saved = localStorage.getItem("ff_nickname");
    if (saved) setNickname(saved);
  }, [setNickname]);

  // Force landscape orientation hint
  useEffect(() => {
    if (screen.orientation && typeof (screen.orientation as any).lock === "function") {
      (screen.orientation as any).lock("landscape").catch(() => {});
    }
  }, []);

  return (
    <>
      {phase === "splash" && <SplashScreen />}
      {phase === "nickname" && <NicknameScreen />}
      {phase === "menu" && <MenuScreen />}
      {phase === "pre_game" && <PreGameScreen />}
      {(phase === "playing" || phase === "game_over") && <GameScreen />}
    </>
  );
}
