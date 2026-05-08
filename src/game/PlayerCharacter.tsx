import { useRef, Suspense, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { PlayerState } from "../types/game";

const BASE = import.meta.env.BASE_URL ?? "/";

const HERO_COLORS: Record<string, string> = {
  medic: "#4caf50",
  engineer: "#2196f3",
  specter: "#9c27b0",
  fighter: "#ff9800",
};

interface Props { player: PlayerState; }

function SoldierGLB({ heroColor, animState }: { heroColor: string; animState: string }) {
  const { scene } = useGLTF(BASE + "assets/characters/character-soldier.glb");
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        const mesh = obj as THREE.Mesh;
        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.color = new THREE.Color(heroColor);
          mesh.material = mat;
        }
      }
    });
    return c;
  }, [scene, heroColor]);

  return <primitive object={cloned} scale={1.0} position={[0, 0, 0]} />;
}

function FallbackCharacter({ heroColor, animTime, animState, player }: {
  heroColor: string;
  animTime: React.MutableRefObject<number>;
  animState: string;
  player: PlayerState;
}) {
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const weaponRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    animTime.current += delta;
    const t = animTime.current;
    if (!bodyRef.current || !headRef.current) return;
    switch (animState) {
      case "walk":
        bodyRef.current.position.y = 0.7 + Math.sin(t * 8) * 0.06;
        bodyRef.current.rotation.z = Math.sin(t * 8) * 0.04;
        headRef.current.position.y = 1.55 + Math.sin(t * 8) * 0.05;
        break;
      case "run":
        bodyRef.current.position.y = 0.7 + Math.sin(t * 14) * 0.1;
        bodyRef.current.rotation.z = Math.sin(t * 14) * 0.07;
        headRef.current.position.y = 1.55 + Math.sin(t * 14) * 0.08;
        break;
      case "shoot":
        if (weaponRef.current) weaponRef.current.position.z = -0.2 + Math.sin(t * 20) * 0.05;
        bodyRef.current.position.y = 0.7;
        headRef.current.position.y = 1.55;
        break;
      case "jump":
        bodyRef.current.position.y = 0.7 + Math.abs(Math.sin(t * 5)) * 0.5;
        headRef.current.position.y = 1.55 + Math.abs(Math.sin(t * 5)) * 0.5;
        break;
      default:
        bodyRef.current.position.y = 0.7 + Math.sin(t * 2) * 0.02;
        bodyRef.current.rotation.z = 0;
        headRef.current.position.y = 1.55 + Math.sin(t * 2) * 0.02;
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
        <meshStandardMaterial color={heroColor} roughness={0.6} />
      </mesh>
      <mesh ref={headRef} position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[0.38, 0.38, 0.38]} />
        <meshStandardMaterial color="#f5deb3" roughness={0.8} />
      </mesh>
      <mesh position={[-0.1, 1.6, 0.2]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      <mesh position={[0.1, 1.6, 0.2]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      {player.weapon !== "unarmed" && (
        <mesh ref={weaponRef} position={[0.3, 0.85, -0.2]} castShadow>
          <boxGeometry args={[0.08, 0.1, 0.5]} />
          <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
        </mesh>
      )}
    </>
  );
}

export default function PlayerCharacter({ player }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const animTime = useRef(0);
  const heroColor = HERO_COLORS[player.hero] ?? "#ffffff";

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.lerp(
      new THREE.Vector3(player.position.x, player.position.y, player.position.z),
      0.2
    );
    groupRef.current.rotation.y = player.rotation;
  });

  return (
    <group ref={groupRef} position={[player.position.x, 0, player.position.z]}>
      {/* Shadow blob */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>

      {/* Try real GLB soldier, fallback to box character */}
      <Suspense fallback={
        <FallbackCharacter
          heroColor={heroColor}
          animTime={animTime}
          animState={player.animState}
          player={player}
        />
      }>
        <SoldierGLB heroColor={heroColor} animState={player.animState} />
      </Suspense>

      {/* Scope ring when scoping */}
      {player.isScoping && (
        <mesh position={[0, 1.55, -0.8]}>
          <torusGeometry args={[0.15, 0.02, 8, 20]} />
          <meshBasicMaterial color="#4fc3f7" transparent opacity={0.7} />
        </mesh>
      )}

      {/* HP bar above head */}
      <mesh position={[0, 2.2, 0]}>
        <planeGeometry args={[0.7, 0.08]} />
        <meshBasicMaterial color="#111" transparent opacity={0.5} />
      </mesh>
      <mesh position={[-(0.35 - (player.hp / player.maxHp) * 0.35), 2.2, 0.01]}>
        <planeGeometry args={[(player.hp / player.maxHp) * 0.7, 0.07]} />
        <meshBasicMaterial
          color={player.hp > player.maxHp * 0.5 ? "#4caf50" : player.hp > player.maxHp * 0.25 ? "#ff9800" : "#f44336"}
        />
      </mesh>
    </group>
  );
}
