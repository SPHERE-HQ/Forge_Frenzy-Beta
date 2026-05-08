import { useRef, Suspense, useMemo, Component, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { PlayerState } from "../types/game";

const WEAPON_MODELS: Record<string, string> = {
  pistol:  "assets/weapons/M1911_pistol.glb",
  rifle:   "assets/weapons/M4A1.glb",
  smg:     "assets/weapons/MP5.glb",
  sniper:  "assets/weapons/SCAR.glb",
  rpg:     "assets/weapons/RPG7.glb",
  grenade: "assets/weapons/grenade.glb",
};

const WEAPON_SCALE: Record<string, number> = {
  pistol:  0.012,
  rifle:   0.012,
  smg:     0.012,
  sniper:  0.012,
  rpg:     0.012,
  grenade: 0.015,
};

const BASE = import.meta.env.BASE_URL ?? "/";

const HERO_COLORS: Record<string, string> = {
  medic: "#4caf50",
  engineer: "#2196f3",
  specter: "#9c27b0",
  fighter: "#ff9800",
};

interface Props { player: PlayerState; }

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

function WeaponGLB({ weapon }: { weapon: string }) {
  const path = WEAPON_MODELS[weapon];
  const { scene } = useGLTF(BASE + path);
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = false;
        mesh.receiveShadow = false;
      }
    });
    return c;
  }, [scene]);
  const scale = WEAPON_SCALE[weapon] ?? 0.012;
  return (
    <primitive
      object={cloned}
      scale={scale}
      rotation={[0, Math.PI / 2, 0]}
    />
  );
}

function WeaponMeshFallback({ weapon }: { weapon: string }) {
  const weaponColors: Record<string, string> = {
    pistol: "#555",
    rifle: "#444",
    smg: "#4a4a4a",
    sniper: "#3a3a3a",
    rpg: "#667766",
    grenade: "#778855",
  };
  const color = weaponColors[weapon] ?? "#444";
  const isLong = weapon === "rifle" || weapon === "sniper" || weapon === "smg";
  const len = isLong ? 0.6 : 0.35;
  return (
    <>
      <mesh>
        <boxGeometry args={[0.06, 0.14, 0.1]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.03, -(len / 2 + 0.02)]}>
        <boxGeometry args={[0.05, 0.07, len]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.03, -(len + 0.06)]}>
        <cylinderGeometry args={[0.025, 0.025, 0.06, 6]} />
        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
      </mesh>
    </>
  );
}

function WeaponMesh({ weapon }: { weapon: string }) {
  if (weapon === "unarmed") return null;
  const hasModel = weapon in WEAPON_MODELS;
  return (
    <group position={[0.28, 0.9, -0.05]}>
      {hasModel ? (
        <GLBErrorBoundary fallback={<WeaponMeshFallback weapon={weapon} />}>
          <Suspense fallback={<WeaponMeshFallback weapon={weapon} />}>
            <WeaponGLB weapon={weapon} />
          </Suspense>
        </GLBErrorBoundary>
      ) : (
        <WeaponMeshFallback weapon={weapon} />
      )}
    </group>
  );
}

// Crosshair 3D melayang di atas kepala karakter
function HeadCrosshair() {
  return (
    <group position={[0, 2.6, 0]}>
      {/* Garis horizontal */}
      <mesh>
        <boxGeometry args={[0.28, 0.025, 0.025]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} depthTest={false} />
      </mesh>
      {/* Garis vertikal */}
      <mesh>
        <boxGeometry args={[0.025, 0.28, 0.025]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} depthTest={false} />
      </mesh>
      {/* Titik tengah */}
      <mesh>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshBasicMaterial color="#ff4444" transparent opacity={0.95} depthTest={false} />
      </mesh>
    </group>
  );
}

// Karakter box (selalu tampil, tidak bergantung GLB)
function BoxCharacter({
  heroColor,
  animTime,
  animState,
  player,
}: {
  heroColor: string;
  animTime: React.MutableRefObject<number>;
  animState: string;
  player: PlayerState;
}) {
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const legLRef = useRef<THREE.Mesh>(null);
  const legRRef = useRef<THREE.Mesh>(null);
  const armLRef = useRef<THREE.Mesh>(null);
  const armRRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    animTime.current += delta;
    const t = animTime.current;
    const body = bodyRef.current;
    const head = headRef.current;
    const legL = legLRef.current;
    const legR = legRRef.current;
    if (!body || !head) return;

    switch (animState) {
      case "walk":
        body.position.y = 0.72 + Math.sin(t * 8) * 0.04;
        body.rotation.z = Math.sin(t * 8) * 0.03;
        head.position.y = 1.52 + Math.sin(t * 8) * 0.03;
        if (legL) legL.rotation.x = Math.sin(t * 8) * 0.4;
        if (legR) legR.rotation.x = -Math.sin(t * 8) * 0.4;
        if (armLRef.current) armLRef.current.rotation.x = -Math.sin(t * 8) * 0.3;
        if (armRRef.current) armRRef.current.rotation.x = Math.sin(t * 8) * 0.3;
        break;
      case "run":
        body.position.y = 0.72 + Math.sin(t * 14) * 0.07;
        body.rotation.z = Math.sin(t * 14) * 0.05;
        head.position.y = 1.52 + Math.sin(t * 14) * 0.06;
        if (legL) legL.rotation.x = Math.sin(t * 14) * 0.7;
        if (legR) legR.rotation.x = -Math.sin(t * 14) * 0.7;
        if (armLRef.current) armLRef.current.rotation.x = -Math.sin(t * 14) * 0.5;
        if (armRRef.current) armRRef.current.rotation.x = Math.sin(t * 14) * 0.5;
        break;
      case "shoot":
        body.position.y = 0.72;
        head.position.y = 1.52;
        if (armRRef.current) armRRef.current.rotation.x = -0.3 + Math.sin(t * 20) * 0.1;
        break;
      case "jump":
        body.position.y = 0.72 + Math.abs(Math.sin(t * 5)) * 0.5;
        head.position.y = 1.52 + Math.abs(Math.sin(t * 5)) * 0.5;
        if (legL) legL.rotation.x = -0.5;
        if (legR) legR.rotation.x = -0.5;
        break;
      case "crouch":
        body.position.y = 0.45;
        head.position.y = 1.1;
        if (legL) { legL.position.y = 0.2; legL.scale.y = 0.6; }
        if (legR) { legR.position.y = 0.2; legR.scale.y = 0.6; }
        break;
      default:
        body.position.y = 0.72 + Math.sin(t * 1.5) * 0.015;
        body.rotation.z = Math.sin(t * 1.5) * 0.01;
        head.position.y = 1.52 + Math.sin(t * 1.5) * 0.01;
        if (legL) { legL.rotation.x = 0; legL.position.y = 0.27; legL.scale.y = 1; }
        if (legR) { legR.rotation.x = 0; legR.position.y = 0.27; legR.scale.y = 1; }
        if (armLRef.current) armLRef.current.rotation.x = 0;
        if (armRRef.current) armRRef.current.rotation.x = 0;
    }
  });

  const skinColor = "#f0c890";
  const clothColor = heroColor;
  const darkCloth = "#1a2a3a";

  return (
    <>
      {/* Kaki kiri */}
      <mesh ref={legLRef} position={[-0.12, 0.27, 0]}>
        <boxGeometry args={[0.16, 0.54, 0.16]} />
        <meshStandardMaterial color={darkCloth} roughness={0.8} />
      </mesh>
      {/* Kaki kanan */}
      <mesh ref={legRRef} position={[0.12, 0.27, 0]}>
        <boxGeometry args={[0.16, 0.54, 0.16]} />
        <meshStandardMaterial color={darkCloth} roughness={0.8} />
      </mesh>
      {/* Sepatu kiri */}
      <mesh position={[-0.12, 0.04, 0.04]}>
        <boxGeometry args={[0.17, 0.08, 0.22]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
      {/* Sepatu kanan */}
      <mesh position={[0.12, 0.04, 0.04]}>
        <boxGeometry args={[0.17, 0.08, 0.22]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>

      {/* Badan */}
      <mesh ref={bodyRef} position={[0, 0.72, 0]}>
        <boxGeometry args={[0.44, 0.54, 0.28]} />
        <meshStandardMaterial color={clothColor} roughness={0.6} metalness={0.05} />
      </mesh>

      {/* Lengan kiri */}
      <mesh ref={armLRef} position={[-0.3, 0.72, 0]}>
        <boxGeometry args={[0.14, 0.46, 0.14]} />
        <meshStandardMaterial color={clothColor} roughness={0.7} />
      </mesh>
      {/* Tangan kiri */}
      <mesh position={[-0.3, 0.48, 0]}>
        <boxGeometry args={[0.13, 0.12, 0.13]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>

      {/* Lengan kanan */}
      <mesh ref={armRRef} position={[0.3, 0.72, 0]}>
        <boxGeometry args={[0.14, 0.46, 0.14]} />
        <meshStandardMaterial color={clothColor} roughness={0.7} />
      </mesh>
      {/* Tangan kanan */}
      <mesh position={[0.3, 0.48, 0]}>
        <boxGeometry args={[0.13, 0.12, 0.13]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>

      {/* Leher */}
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.12, 6]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>

      {/* Kepala */}
      <mesh ref={headRef} position={[0, 1.52, 0]}>
        <boxGeometry args={[0.36, 0.36, 0.34]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>
      {/* Helm */}
      <mesh position={[0, 1.72, 0]}>
        <boxGeometry args={[0.39, 0.14, 0.37]} />
        <meshStandardMaterial color={darkCloth} roughness={0.7} />
      </mesh>

      {/* Mata kiri */}
      <mesh position={[-0.1, 1.54, 0.18]}>
        <boxGeometry args={[0.07, 0.05, 0.02]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      {/* Mata kanan */}
      <mesh position={[0.1, 1.54, 0.18]}>
        <boxGeometry args={[0.07, 0.05, 0.02]} />
        <meshBasicMaterial color="#111" />
      </mesh>

      {/* Senjata */}
      <WeaponMesh weapon={player.weapon} />
    </>
  );
}

export default function PlayerCharacter({ player }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const animTime = useRef(0);
  const heroColor = HERO_COLORS[player.hero] ?? "#ff9800";

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.lerp(
      new THREE.Vector3(player.position.x, 0, player.position.z),
      0.25
    );
    groupRef.current.rotation.y = player.rotation;
  });

  return (
    <group ref={groupRef} position={[player.position.x, 0, player.position.z]}>
      {/* Bayangan blob */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      {/* Karakter box — selalu tampil, tidak bergantung GLB */}
      <BoxCharacter
        heroColor={heroColor}
        animTime={animTime}
        animState={player.animState}
        player={player}
      />

      {/* Crosshair 3D melayang di atas kepala */}
      <HeadCrosshair />

      {/* Scope ring */}
      {player.isScoping && (
        <mesh position={[0, 1.55, -0.9]}>
          <torusGeometry args={[0.18, 0.02, 8, 24]} />
          <meshBasicMaterial color="#4fc3f7" transparent opacity={0.8} />
        </mesh>
      )}

      {/* HP bar */}
      <mesh position={[0, 2.3, 0]}>
        <planeGeometry args={[0.72, 0.09]} />
        <meshBasicMaterial color="#111" transparent opacity={0.6} depthTest={false} />
      </mesh>
      <mesh
        position={[
          -(0.36 - (player.hp / player.maxHp) * 0.36),
          2.3,
          0.01,
        ]}
      >
        <planeGeometry
          args={[(player.hp / player.maxHp) * 0.72, 0.08]}
        />
        <meshBasicMaterial
          color={
            player.hp > player.maxHp * 0.5
              ? "#4caf50"
              : player.hp > player.maxHp * 0.25
              ? "#ff9800"
              : "#f44336"
          }
          depthTest={false}
        />
      </mesh>
    </group>
  );
}
