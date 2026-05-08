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
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          alpha: false,
        }}
        camera={{ fov: 65, near: 0.1, far: 200 }}
        style={{ background: "#0d1b2a" }}
      >
        <Suspense fallback={null}>
          {/* Lighting — lebih terang agar karakter & lantai kelihatan */}
          <ambientLight intensity={1.2} color="#c8d8e8" />
          <directionalLight
            position={[15, 30, 15]}
            intensity={2.0}
            color="#ffffff"
          />
          <directionalLight
            position={[-15, 20, -10]}
            intensity={0.8}
            color="#aabbd0"
          />
          <hemisphereLight args={["#b0c8e8", "#3a5a3a", 0.6]} />

          {/* Stars di background */}
          <Stars radius={80} depth={30} count={600} factor={3} fade />

          {/* Fog lebih ringan agar tidak terlalu gelap */}
          <fog attach="fog" args={["#0d1b2a", 80, 160]} />

          {/* Map */}
          <ArenaMap />

          {/* Player */}
          {player && player.isAlive && (
            <PlayerCharacter player={player} />
          )}

          {/* Camera ikutin player */}
          {player && <TPSCamera player={player} />}

          {/* Bots */}
          {bots.filter((b) => b.isAlive).map((bot) => (
            <BotCharacter key={bot.id} bot={bot} />
          ))}

          {/* Bullet Traces (bukan proyektil bola) */}
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
