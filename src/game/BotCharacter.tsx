import { useRef, Suspense, useMemo, Component, type ReactNode } from "react";
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

class GLBErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: ReactNode; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function SoldierBotGLB({ teamColor }: { teamColor: string }) {
  const { scene } = useGLTF(BASE + "assets/characters/character-soldier.glb");
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = false;
        if (mesh.material) {
          const mat = (Array.isArray(mesh.material)
            ? mesh.material[0]
            : mesh.material) as THREE.MeshStandardMaterial;
          const m = mat.clone();
          m.color = new THREE.Color(teamColor);
          m.emissive = new THREE.Color(teamColor).multiplyScalar(0.08);
          m.roughness = 0.7;
          mesh.material = m;
        }
      }
    });
    return c;
  }, [scene, teamColor]);

  return <primitive object={cloned} scale={1.0} position={[0, 0, 0]} />;
}

function FallbackBot({
  teamColor,
  animState,
}: {
  teamColor: string;
  animState: string;
}) {
  const bodyRef = useRef<THREE.Mesh>(null);
  const legLRef = useRef<THREE.Mesh>(null);
  const legRRef = useRef<THREE.Mesh>(null);
  const animTime = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    animTime.current += delta;
    const t = animTime.current;
    const body = bodyRef.current;
    if (!body) return;

    if (animState === "walk") {
      body.position.y = 0.72 + Math.sin(t * 8) * 0.04;
      if (legLRef.current) legLRef.current.rotation.x = Math.sin(t * 8) * 0.4;
      if (legRRef.current) legRRef.current.rotation.x = -Math.sin(t * 8) * 0.4;
    } else if (animState === "run") {
      body.position.y = 0.72 + Math.sin(t * 14) * 0.07;
      if (legLRef.current) legLRef.current.rotation.x = Math.sin(t * 14) * 0.7;
      if (legRRef.current) legRRef.current.rotation.x = -Math.sin(t * 14) * 0.7;
    } else if (animState === "die") {
      body.rotation.x = Math.min(
        Math.PI / 2,
        (body.rotation.x || 0) + delta * 3
      );
    } else {
      body.position.y = 0.72 + Math.sin(t * 1.5) * 0.015;
      if (legLRef.current) legLRef.current.rotation.x = 0;
      if (legRRef.current) legRRef.current.rotation.x = 0;
    }
  });

  const skinColor = "#f0c890";
  const darkCloth = "#1a2a3a";

  return (
    <>
      {/* Kaki */}
      <mesh ref={legLRef} position={[-0.12, 0.27, 0]}>
        <boxGeometry args={[0.16, 0.54, 0.16]} />
        <meshStandardMaterial color={darkCloth} roughness={0.8} />
      </mesh>
      <mesh ref={legRRef} position={[0.12, 0.27, 0]}>
        <boxGeometry args={[0.16, 0.54, 0.16]} />
        <meshStandardMaterial color={darkCloth} roughness={0.8} />
      </mesh>
      {/* Sepatu */}
      <mesh position={[-0.12, 0.04, 0.04]}>
        <boxGeometry args={[0.17, 0.08, 0.22]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.12, 0.04, 0.04]}>
        <boxGeometry args={[0.17, 0.08, 0.22]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Badan */}
      <mesh ref={bodyRef} position={[0, 0.72, 0]}>
        <boxGeometry args={[0.44, 0.54, 0.28]} />
        <meshStandardMaterial color={teamColor} roughness={0.6} />
      </mesh>
      {/* Lengan */}
      <mesh position={[-0.3, 0.72, 0]}>
        <boxGeometry args={[0.14, 0.46, 0.14]} />
        <meshStandardMaterial color={teamColor} roughness={0.7} />
      </mesh>
      <mesh position={[0.3, 0.72, 0]}>
        <boxGeometry args={[0.14, 0.46, 0.14]} />
        <meshStandardMaterial color={teamColor} roughness={0.7} />
      </mesh>
      {/* Kepala */}
      <mesh position={[0, 1.52, 0]}>
        <boxGeometry args={[0.36, 0.36, 0.34]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>
      {/* Helm */}
      <mesh position={[0, 1.72, 0]}>
        <boxGeometry args={[0.39, 0.14, 0.37]} />
        <meshStandardMaterial color={darkCloth} roughness={0.7} />
      </mesh>
      {/* Mata merah — penanda bot */}
      <mesh position={[-0.1, 1.54, 0.18]}>
        <boxGeometry args={[0.07, 0.05, 0.02]} />
        <meshBasicMaterial color="#ff2222" />
      </mesh>
      <mesh position={[0.1, 1.54, 0.18]}>
        <boxGeometry args={[0.07, 0.05, 0.02]} />
        <meshBasicMaterial color="#ff2222" />
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
      new THREE.Vector3(bot.position.x, 0, bot.position.z),
      0.18
    );
    groupRef.current.rotation.y = bot.rotation;
  });

  if (!bot.isAlive) return null;

  const fallback = (
    <FallbackBot teamColor={teamColor} animState={bot.animState} />
  );

  return (
    <group ref={groupRef} position={[bot.position.x, 0, bot.position.z]}>
      {/* Bayangan */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 12]} />
        <meshBasicMaterial color="#000" transparent opacity={0.28} />
      </mesh>

      <GLBErrorBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <SoldierBotGLB teamColor={teamColor} />
        </Suspense>
      </GLBErrorBoundary>

      {/* Cincin tim */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.46, 0.58, 20]} />
        <meshBasicMaterial color={teamColor} transparent opacity={0.7} />
      </mesh>

      {/* HP bar */}
      <mesh position={[0, 2.3, 0]}>
        <planeGeometry args={[0.64, 0.08]} />
        <meshBasicMaterial color="#111" transparent opacity={0.6} depthTest={false} />
      </mesh>
      <mesh
        position={[-(0.32 - (bot.hp / bot.maxHp) * 0.32), 2.3, 0.01]}
      >
        <planeGeometry args={[(bot.hp / bot.maxHp) * 0.64, 0.07]} />
        <meshBasicMaterial
          color={bot.hp > bot.maxHp * 0.5 ? "#4caf50" : "#f44336"}
          depthTest={false}
        />
      </mesh>
    </group>
  );
}
