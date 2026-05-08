import { useRef, Suspense, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { BotState } from "../types/game";

const BASE = import.meta.env.BASE_URL ?? "/";

const TEAM_COLORS: Record<string, string> = {
  A: "#4fc3f7",
  B: "#ff6b35",
};

interface Props { bot: BotState; }

function SoldierBotGLB({ teamColor }: { teamColor: string }) {
  const { scene } = useGLTF(BASE + "assets/characters/character-soldier.glb");
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        const mesh = obj as THREE.Mesh;
        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.color = new THREE.Color(teamColor);
          mat.emissive = new THREE.Color(teamColor).multiplyScalar(0.1);
          mesh.material = mat;
        }
      }
    });
    return c;
  }, [scene, teamColor]);

  return <primitive object={cloned} scale={1.0} position={[0, 0, 0]} />;
}

function FallbackBot({ teamColor, animState }: { teamColor: string; animState: string }) {
  const bodyRef = useRef<THREE.Mesh>(null);
  const animTime = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    animTime.current += delta;
    const t = animTime.current;
    if (!bodyRef.current) return;
    if (animState === "walk" || animState === "run") {
      bodyRef.current.position.y = 0.7 + Math.sin(t * 9) * 0.06;
    } else if (animState === "die") {
      bodyRef.current.rotation.x = Math.min(Math.PI / 2, (bodyRef.current.rotation.x || 0) + delta * 3);
    } else {
      bodyRef.current.position.y = 0.7 + Math.sin(t * 1.5) * 0.015;
    }
  });

  return (
    <>
      <mesh position={[-0.15, 0.35, 0]} castShadow>
        <boxGeometry args={[0.18, 0.7, 0.18]} />
        <meshStandardMaterial color="#2a3a4a" />
      </mesh>
      <mesh position={[0.15, 0.35, 0]} castShadow>
        <boxGeometry args={[0.18, 0.7, 0.18]} />
        <meshStandardMaterial color="#2a3a4a" />
      </mesh>
      <mesh ref={bodyRef} position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.3]} />
        <meshStandardMaterial color={teamColor} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[0.38, 0.38, 0.38]} />
        <meshStandardMaterial color="#f5deb3" roughness={0.8} />
      </mesh>
      <mesh position={[-0.09, 1.6, 0.2]}>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshBasicMaterial color="#ff4444" />
      </mesh>
      <mesh position={[0.09, 1.6, 0.2]}>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshBasicMaterial color="#ff4444" />
      </mesh>
    </>
  );
}

export default function BotCharacter({ bot }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const teamColor = TEAM_COLORS[bot.team] ?? "#aaaaaa";

  useFrame(() => {
    if (!groupRef.current || !bot.isAlive) return;
    groupRef.current.position.lerp(
      new THREE.Vector3(bot.position.x, bot.position.y, bot.position.z),
      0.15
    );
    groupRef.current.rotation.y = bot.rotation;
  });

  if (!bot.isAlive) return null;

  return (
    <group ref={groupRef} position={[bot.position.x, 0, bot.position.z]}>
      {/* Shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.25} />
      </mesh>

      {/* Real GLB or fallback */}
      <Suspense fallback={<FallbackBot teamColor={teamColor} animState={bot.animState} />}>
        <SoldierBotGLB teamColor={teamColor} />
      </Suspense>

      {/* Team color indicator ring */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.55, 20]} />
        <meshBasicMaterial color={teamColor} transparent opacity={0.6} />
      </mesh>

      {/* HP bar */}
      <mesh position={[0, 2.2, 0]}>
        <planeGeometry args={[0.6, 0.07]} />
        <meshBasicMaterial color="#111" transparent opacity={0.5} />
      </mesh>
      <mesh position={[-(0.3 - (bot.hp / bot.maxHp) * 0.3), 2.2, 0.01]}>
        <planeGeometry args={[(bot.hp / bot.maxHp) * 0.6, 0.06]} />
        <meshBasicMaterial color={bot.hp > bot.maxHp * 0.5 ? "#4caf50" : "#f44336"} />
      </mesh>
    </group>
  );
}
