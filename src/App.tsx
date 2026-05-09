import { useEffect } from "react";
import { useGameStore } from "./stores/gameStore";
import SplashScreen from "./screens/SplashScreen";
import NicknameScreen from "./screens/NicknameScreen";
import MenuScreen from "./screens/MenuScreen";
import PreGameScreen from "./screens/PreGameScreen";
import GameScreen from "./screens/GameScreen";

function forceLandscape() {
  try {
    const orient = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
    if (orient?.lock) {
      orient.lock("landscape").catch(() => {});
    }
  } catch {}
}

export default function App() {
  const phase = useGameStore((s) => s.phase);
  const setNickname = useGameStore((s) => s.setNickname);

  useEffect(() => {
    const saved = localStorage.getItem("ff_nickname");
    if (saved) setNickname(saved);
  }, [setNickname]);

  // Paksa landscape — coba saat mount, dan setiap kali orientasi berubah
  useEffect(() => {
    forceLandscape();
    window.addEventListener("orientationchange", forceLandscape);
    screen.orientation?.addEventListener("change", forceLandscape);
    return () => {
      window.removeEventListener("orientationchange", forceLandscape);
      screen.orientation?.removeEventListener("change", forceLandscape);
    };
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
