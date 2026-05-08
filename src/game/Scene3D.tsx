import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Stars } from "@react-three/drei";
import ArenaMap from "./ArenaMap";
import PlayerCharacter from "./PlayerCharacter";
import BotCharacter from "./BotCharacter";
import ProjectileSystem from "./ProjectileSystem";
import GroundItems from "./GroundItems";
import BuilderMachineObject from "./BuilderMachineObject";
import TPSCamera from "./TPSCamera";
import AudioManager from "./AudioManager";
import { useGameStore } from "../stores/gameStore";

export default function Scene3D() {
  const player = useGameStore((s) => s.player);
  const bots = useGameStore((s) => s.bots);
  const groundItems = useGameStore((s) => s.groundItems);
  const builderMachines = useGameStore((s) => s.builderMachines);
  const projectiles = useGameStore((s) => s.projectiles);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
      <Canvas
        shadows
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 70, near: 0.1, far: 300 }}
        style={{ background: "#1a1a2e" }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[20, 40, 20]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
          />
          <hemisphereLight args={["#b0c4de", "#5a4a3a", 0.3]} />

          {/* Stars in background */}
          <Stars radius={100} depth={50} count={1000} factor={2} fade />

          {/* Fog */}
          <fog attach="fog" args={["#1a1a2e", 60, 120]} />

          {/* Map */}
          <ArenaMap />

          {/* Player */}
          {player && player.isAlive && (
            <PlayerCharacter player={player} />
          )}

          {/* Camera follows player */}
          {player && <TPSCamera player={player} />}

          {/* Bots */}
          {bots.filter((b) => b.isAlive).map((bot) => (
            <BotCharacter key={bot.id} bot={bot} />
          ))}

          {/* Projectiles */}
          <ProjectileSystem projectiles={projectiles} />

          {/* Ground items */}
          <GroundItems items={groundItems} />

          {/* Builder machines */}
          {builderMachines.map((m) => (
            <BuilderMachineObject key={m.id} machine={m} />
          ))}
        </Suspense>
      </Canvas>

      {/* Audio manager - outside Canvas */}
      <AudioManager />
    </div>
  );
}
