import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Sky } from "@react-three/drei";
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
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          alpha: false,
        }}
        camera={{ fov: 65, near: 0.1, far: 300 }}
      >
        <Suspense fallback={null}>
          {/* Langit siang hari cerah */}
          <Sky
            distance={450}
            sunPosition={[100, 40, 100]}
            inclination={0.49}
            azimuth={0.25}
          />

          {/* Pencahayaan lebih terang dan hangat */}
          <ambientLight intensity={1.5} color="#d8e8f8" />
          <directionalLight
            position={[20, 40, 20]}
            intensity={2.5}
            color="#fff5e0"
          />
          <directionalLight
            position={[-15, 25, -10]}
            intensity={1.0}
            color="#c0d8f0"
          />
          <hemisphereLight args={["#87ceeb", "#4a6a2a", 0.8]} />

          {/* Fog lebih ringan supaya arena kelihatan cerah */}
          <fog attach="fog" args={["#a8c8e8", 60, 180]} />

          {/* Map */}
          <ArenaMap />

          {/* Player */}
          {player && player.isAlive && (
            <PlayerCharacter player={player} />
          )}

          {/* Kamera ikutin player */}
          {player && <TPSCamera player={player} />}

          {/* Bots */}
          {bots.filter((b) => b.isAlive).map((bot) => (
            <BotCharacter key={bot.id} bot={bot} />
          ))}

          {/* Bullet Traces */}
          <ProjectileSystem projectiles={projectiles} />

          {/* Ground items */}
          <GroundItems items={groundItems} />

          {/* Builder machines */}
          {builderMachines.map((m) => (
            <BuilderMachineObject key={m.id} machine={m} />
          ))}
        </Suspense>
      </Canvas>

      <AudioManager />
    </div>
  );
}
