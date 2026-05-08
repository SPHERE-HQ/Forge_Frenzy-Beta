import { useEffect, useRef } from "react";
import { useGameStore } from "../stores/gameStore";

const BASE = import.meta.env.BASE_URL ?? "/";

const SFX_MAP: Record<string, string> = {
  shoot_m4a1:   "assets/audio/sfx/sfx_m4a1.mp3",
  shoot_mp5:    "assets/audio/sfx/sfx_mp5.mp3",
  shoot_glock:  "assets/audio/sfx/sfx_glock18.mp3",
  shoot_awp:    "assets/audio/sfx/sfx_awp.mp3",
  shoot_spas:   "assets/audio/sfx/sfx_spas12.mp3",
  hit_body:     "assets/audio/sfx/sfx_hit_body.mp3",
  death:        "assets/audio/sfx/sfx_death.mp3",
  reload:       "assets/audio/sfx/sfx_reload.mp3",
  footstep:     "assets/audio/sfx/sfx_footstep.mp3",
  footstep2:    "assets/audio/sfx/sfx_footstep2.mp3",
  explosion:    "assets/audio/sfx/sfx_explosion_small.mp3",
  // Kenney interface sounds (OGG)
  build_done:   "assets/audio/sfx/kenney/confirmation_001.ogg",
  pickup:       "assets/audio/sfx/kenney/drop_001.ogg",
  respawn:      "assets/audio/sfx/kenney/toggle_001.ogg",
  countdown:    "assets/audio/sfx/kenney/bong_001.ogg",
  ui_click:     "assets/audio/sfx/kenney/click_001.ogg",
  ui_select:    "assets/audio/sfx/kenney/select_001.ogg",
  buddy_join:   "assets/audio/sfx/kenney/glass_001.ogg",
  victory:      "assets/audio/sfx/kenney/confirmation_002.ogg",
};

const BGM_MAP: Record<string, string> = {
  defeat:  "assets/audio/bgm/bgm_defeat.mp3",
  victory: "assets/audio/bgm/bgm_victory.mp3",
};

const audioCache: Record<string, HTMLAudioElement> = {};

export function playSound(key: string, volume = 0.7) {
  const path = SFX_MAP[key];
  if (!path) return;
  try {
    if (!audioCache[key]) {
      audioCache[key] = new Audio(BASE + path);
    }
    const audio = audioCache[key].cloneNode() as HTMLAudioElement;
    audio.volume = volume;
    audio.play().catch(() => {});
  } catch {
    // ignore audio errors
  }
}

export function playBGM(key: string, volume = 0.4) {
  const path = BGM_MAP[key];
  if (!path) return;
  try {
    const audio = new Audio(BASE + path);
    audio.volume = volume;
    audio.loop = false;
    audio.play().catch(() => {});
  } catch {
    // ignore
  }
}

const PRELOAD_KEYS = [
  "shoot_m4a1", "shoot_mp5", "hit_body", "death", "reload",
  "footstep", "footstep2", "explosion", "build_done", "pickup",
  "ui_click", "ui_select",
];

export default function AudioManager() {
  const phase = useGameStore((s) => s.phase);
  const prevPhaseRef = useRef<string>("");

  useEffect(() => {
    PRELOAD_KEYS.forEach((key) => {
      const path = SFX_MAP[key];
      if (path && !audioCache[key]) {
        audioCache[key] = new Audio(BASE + path);
        audioCache[key].preload = "auto";
      }
    });
  }, []);

  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;

    if (phase === "playing" && prev !== "playing") {
      playSound("countdown", 0.5);
    }
    if (phase === "game_over") {
      playBGM("defeat", 0.5);
    }
  }, [phase]);

  return null;
}
