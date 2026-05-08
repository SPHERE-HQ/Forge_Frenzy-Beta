import { useGLTF } from "@react-three/drei";
import { Suspense, useMemo, type ReactElement } from "react";
import * as THREE from "three";

const BASE = import.meta.env.BASE_URL ?? "/";

function ArenaGLB({ path, position, rotation, scale }: {
  path: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}) {
  const { scene } = useGLTF(BASE + path);
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  return (
    <primitive
      object={cloned}
      position={position}
      rotation={rotation ?? [0, 0, 0]}
      scale={scale ?? 1}
    />
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color="#1e2a30" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

function GridLines() {
  const grid = useMemo(() => {
    const lines: ReactElement[] = [];
    for (let i = -40; i <= 40; i += 5) {
      lines.push(
        <mesh key={`h${i}`} position={[i, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.05, 80]} />
          <meshBasicMaterial color="#2a3a40" transparent opacity={0.3} />
        </mesh>,
        <mesh key={`v${i}`} position={[0, 0.01, i]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[80, 0.05]} />
          <meshBasicMaterial color="#2a3a40" transparent opacity={0.3} />
        </mesh>
      );
    }
    return lines;
  }, []);
  return <>{grid}</>;
}

// Fallback geometry obstacles (used if GLB fails)
const OBSTACLES = [
  { pos: [0, 1, -28] as [number,number,number], size: [40, 2, 1] as [number,number,number], color: "#5a7a8a" },
  { pos: [0, 1,  28] as [number,number,number], size: [40, 2, 1] as [number,number,number], color: "#5a7a8a" },
  { pos: [-28, 1, 0] as [number,number,number], size: [1, 2, 56] as [number,number,number], color: "#5a7a8a" },
  { pos: [ 28, 1, 0] as [number,number,number], size: [1, 2, 56] as [number,number,number], color: "#5a7a8a" },
  { pos: [0, 0.75, 0],   size: [4, 1.5, 4],   color: "#3a4a5a" },
  { pos: [10, 0.75, 10], size: [3, 1.5, 3],   color: "#4a5a6a" },
  { pos: [-10, 0.75, 10],size: [3, 1.5, 3],   color: "#4a5a6a" },
  { pos: [10, 0.75, -10],size: [3, 1.5, 3],   color: "#4a5a6a" },
  { pos: [-10, 0.75,-10],size: [3, 1.5, 3],   color: "#4a5a6a" },
  { pos: [0, 0.75, 12],  size: [8, 1.5, 1],   color: "#3a5a4a" },
  { pos: [0, 0.75, -12], size: [8, 1.5, 1],   color: "#3a5a4a" },
  { pos: [15, 0.75, 0],  size: [1, 1.5, 12],  color: "#3a5a4a" },
  { pos: [-15, 0.75, 0], size: [1, 1.5, 12],  color: "#3a5a4a" },
];

// Arena GLB layout
const ARENA_WALLS = [
  // Outer walls (border-straight)
  { pos: [-14, 0, -28] as [number,number,number], rot: [0, 0, 0] as [number,number,number] },
  { pos: [ 0,  0, -28] as [number,number,number], rot: [0, 0, 0] as [number,number,number] },
  { pos: [ 14, 0, -28] as [number,number,number], rot: [0, 0, 0] as [number,number,number] },
  { pos: [-14, 0,  28] as [number,number,number], rot: [0, Math.PI, 0] as [number,number,number] },
  { pos: [ 0,  0,  28] as [number,number,number], rot: [0, Math.PI, 0] as [number,number,number] },
  { pos: [ 14, 0,  28] as [number,number,number], rot: [0, Math.PI, 0] as [number,number,number] },
  { pos: [-28, 0, -14] as [number,number,number], rot: [0, -Math.PI/2, 0] as [number,number,number] },
  { pos: [-28, 0,   0] as [number,number,number], rot: [0, -Math.PI/2, 0] as [number,number,number] },
  { pos: [-28, 0,  14] as [number,number,number], rot: [0, -Math.PI/2, 0] as [number,number,number] },
  { pos: [ 28, 0, -14] as [number,number,number], rot: [0,  Math.PI/2, 0] as [number,number,number] },
  { pos: [ 28, 0,   0] as [number,number,number], rot: [0,  Math.PI/2, 0] as [number,number,number] },
  { pos: [ 28, 0,  14] as [number,number,number], rot: [0,  Math.PI/2, 0] as [number,number,number] },
];

const ARENA_CORNERS = [
  { pos: [-28, 0, -28] as [number,number,number], rot: [0, 0, 0] as [number,number,number] },
  { pos: [ 28, 0, -28] as [number,number,number], rot: [0, Math.PI/2, 0] as [number,number,number] },
  { pos: [-28, 0,  28] as [number,number,number], rot: [0, -Math.PI/2, 0] as [number,number,number] },
  { pos: [ 28, 0,  28] as [number,number,number], rot: [0, Math.PI, 0] as [number,number,number] },
];

const ARENA_COLUMNS = [
  { pos: [0, 0, 0] as [number,number,number] },
  { pos: [10, 0, 0] as [number,number,number] },
  { pos: [-10, 0, 0] as [number,number,number] },
  { pos: [0, 0, 10] as [number,number,number] },
  { pos: [0, 0, -10] as [number,number,number] },
];

const ARENA_BLOCKS = [
  { pos: [10, 0, 10] as [number,number,number] },
  { pos: [-10, 0, 10] as [number,number,number] },
  { pos: [10, 0, -10] as [number,number,number] },
  { pos: [-10, 0, -10] as [number,number,number] },
];

const ARENA_TREES = [
  { pos: [20, 0, 15] as [number,number,number] },
  { pos: [-20, 0, -15] as [number,number,number] },
  { pos: [20, 0, -18] as [number,number,number] },
  { pos: [-22, 0, 16] as [number,number,number] },
];

const ARENA_STAIRS = [
  { pos: [-20, 0, 0] as [number,number,number], rot: [0, Math.PI/2, 0] as [number,number,number] },
  { pos: [ 20, 0, 0] as [number,number,number], rot: [0, -Math.PI/2, 0] as [number,number,number] },
];

function ArenaScene() {
  return (
    <group>
      {/* Outer walls */}
      {ARENA_WALLS.map((w, i) => (
        <ArenaGLB
          key={`wall-${i}`}
          path="assets/environment/arena/wall.glb"
          position={w.pos}
          rotation={w.rot}
          scale={2}
        />
      ))}

      {/* Corners */}
      {ARENA_CORNERS.map((c, i) => (
        <ArenaGLB
          key={`corner-${i}`}
          path="assets/environment/arena/wall-corner.glb"
          position={c.pos}
          rotation={c.rot}
          scale={2}
        />
      ))}

      {/* Columns */}
      {ARENA_COLUMNS.map((c, i) => (
        <ArenaGLB
          key={`col-${i}`}
          path="assets/environment/arena/column.glb"
          position={c.pos}
          scale={1.5}
        />
      ))}

      {/* Cover blocks */}
      {ARENA_BLOCKS.map((b, i) => (
        <ArenaGLB
          key={`block-${i}`}
          path="assets/environment/arena/block.glb"
          position={b.pos}
          scale={2}
        />
      ))}

      {/* Stairs */}
      {ARENA_STAIRS.map((s, i) => (
        <ArenaGLB
          key={`stairs-${i}`}
          path="assets/environment/arena/stairs.glb"
          position={s.pos}
          rotation={s.rot}
          scale={2}
        />
      ))}

      {/* Trees */}
      {ARENA_TREES.map((t, i) => (
        <ArenaGLB
          key={`tree-${i}`}
          path="assets/environment/arena/tree.glb"
          position={t.pos}
          scale={2}
        />
      ))}

      {/* Center statue */}
      <ArenaGLB
        path="assets/environment/arena/statue.glb"
        position={[0, 0, 0]}
        scale={2}
      />

      {/* Banners */}
      <ArenaGLB path="assets/environment/arena/banner.glb" position={[-26, 0, -26]} scale={2} />
      <ArenaGLB path="assets/environment/arena/banner.glb" position={[26, 0, 26]} scale={2} rotation={[0, Math.PI, 0]} />

      {/* Trophy */}
      <ArenaGLB path="assets/environment/arena/trophy.glb" position={[-22, 0, 0]} scale={1.5} />
      <ArenaGLB path="assets/environment/arena/trophy.glb" position={[22, 0, 0]} scale={1.5} />

      {/* Weapon racks */}
      <ArenaGLB path="assets/environment/arena/weapon-rack.glb" position={[-20, 0, 5]} scale={1.5} />
      <ArenaGLB path="assets/environment/arena/weapon-rack.glb" position={[20, 0, -5]} scale={1.5} />

      {/* Bricks / floor detail */}
      <ArenaGLB path="assets/environment/arena/bricks.glb" position={[5, 0, 5]} scale={2} />
      <ArenaGLB path="assets/environment/arena/bricks.glb" position={[-5, 0, -5]} scale={2} />
      <ArenaGLB path="assets/environment/arena/floor-detail.glb" position={[0, 0.01, 0]} scale={3} />

      {/* Wall gate (spawn side) */}
      <ArenaGLB path="assets/environment/arena/wall-gate.glb" position={[-28, 0, 0]} rotation={[0, Math.PI/2, 0]} scale={2} />
      <ArenaGLB path="assets/environment/arena/wall-gate.glb" position={[28, 0, 0]} rotation={[0, -Math.PI/2, 0]} scale={2} />
    </group>
  );
}

export default function ArenaMap() {
  return (
    <group>
      <Floor />
      <GridLines />

      {/* Try real GLB arena, fallback to boxes */}
      <Suspense fallback={
        <>
          {OBSTACLES.map((obs, i) => (
            <mesh key={i} position={obs.pos as [number,number,number]} castShadow receiveShadow>
              <boxGeometry args={obs.size as [number,number,number]} />
              <meshStandardMaterial color={obs.color} roughness={0.7} metalness={0.15} />
            </mesh>
          ))}
        </>
      }>
        <ArenaScene />
      </Suspense>

      {/* Team A spawn zone */}
      <mesh position={[-22, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5, 32]} />
        <meshBasicMaterial color="#4fc3f7" transparent opacity={0.12} />
      </mesh>

      {/* Team B spawn zone */}
      <mesh position={[22, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5, 32]} />
        <meshBasicMaterial color="#ff6b35" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}
