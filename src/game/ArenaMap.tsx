import { useGLTF } from "@react-three/drei";
import { Suspense, useMemo, type ReactElement, Component, type ReactNode } from "react";
import * as THREE from "three";

const BASE = import.meta.env.BASE_URL ?? "/";

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

// Warna lebih cerah dan vibrant
const STONE_COLOR  = "#b8a898";
const STONE_DARK   = "#8a7868";
const WOOD_COLOR   = "#c8904a";
const METAL_COLOR  = "#7a9ab0";
const COVER_RED    = "#d44a3a";
const COVER_BLUE   = "#3a6ad4";
const COVER_YELLOW = "#d4b030";
const COVER_GREEN  = "#3aaa50";

function fixMaterials(node: THREE.Object3D) {
  node.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = false;
    mesh.receiveShadow = false;

    const applyFix = (mat: THREE.Material) => {
      const m = mat as THREE.MeshStandardMaterial;
      if (!m.color) return;
      const { r, g, b } = m.color;
      const isWhiteOrDefault = r > 0.88 && g > 0.88 && b > 0.88;
      const isBlack = r < 0.05 && g < 0.05 && b < 0.05;
      if (isWhiteOrDefault || isBlack) {
        m.color.set(STONE_COLOR);
        m.roughness = 0.85;
        m.metalness = 0.0;
        if (m.map) m.map = null;
      }
    };

    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(applyFix);
    } else {
      applyFix(mesh.material);
    }
  });
}

function ArenaGLB({
  path,
  position,
  rotation,
  scale,
  colorOverride,
}: {
  path: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  colorOverride?: string;
}) {
  const { scene } = useGLTF(BASE + path);
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    fixMaterials(c);
    if (colorOverride) {
      c.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        const applyColor = (mat: THREE.Material) => {
          const m = mat as THREE.MeshStandardMaterial;
          if (m.color) m.color.set(colorOverride);
        };
        if (Array.isArray(mesh.material)) mesh.material.forEach(applyColor);
        else applyColor(mesh.material);
      });
    }
    return c;
  }, [scene, colorOverride]);

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
    <>
      {/* Lantai utama — warna tanah lebih hangat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow={false}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#5a7040" roughness={0.92} metalness={0.0} />
      </mesh>
      {/* Platform arena tengah — lebih terang */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#6a8050" roughness={0.90} metalness={0.0} />
      </mesh>
    </>
  );
}

function GridLines() {
  const grid = useMemo(() => {
    const lines: ReactElement[] = [];
    for (let i = -30; i <= 30; i += 8) {
      lines.push(
        <mesh key={`h${i}`} position={[i, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.05, 60]} />
          <meshBasicMaterial color="#8aaa60" transparent opacity={0.3} />
        </mesh>,
        <mesh key={`v${i}`} position={[0, 0.01, i]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[60, 0.05]} />
          <meshBasicMaterial color="#8aaa60" transparent opacity={0.3} />
        </mesh>
      );
    }
    return lines;
  }, []);
  return <>{grid}</>;
}

// Obstacle warna cerah & bervariasi
const OBSTACLES = [
  // border luar — batu abu terang
  { pos: [0, 1, -29] as [number,number,number], size: [58, 2, 1] as [number,number,number], color: STONE_COLOR },
  { pos: [0, 1,  29] as [number,number,number], size: [58, 2, 1] as [number,number,number], color: STONE_COLOR },
  { pos: [-29, 1, 0] as [number,number,number], size: [1, 2, 58] as [number,number,number], color: STONE_COLOR },
  { pos: [ 29, 1, 0] as [number,number,number], size: [1, 2, 58] as [number,number,number], color: STONE_COLOR },
  // cover tengah — warna kontras
  { pos: [0, 0.75, 0],    size: [4,   1.5, 4],   color: COVER_YELLOW },
  { pos: [10, 0.75, 10],  size: [3,   1.5, 3],   color: COVER_RED },
  { pos: [-10, 0.75, 10], size: [3,   1.5, 3],   color: COVER_BLUE },
  { pos: [10, 0.75, -10], size: [3,   1.5, 3],   color: COVER_BLUE },
  { pos: [-10, 0.75,-10], size: [3,   1.5, 3],   color: COVER_RED },
  { pos: [0, 0.75, 12],   size: [8,   1.5, 1],   color: WOOD_COLOR },
  { pos: [0, 0.75, -12],  size: [8,   1.5, 1],   color: WOOD_COLOR },
  { pos: [15, 0.75, 0],   size: [1,   1.5, 12],  color: WOOD_COLOR },
  { pos: [-15, 0.75, 0],  size: [1,   1.5, 12],  color: WOOD_COLOR },
  // box tambahan metal
  { pos: [7, 0.6, 0],     size: [2.5, 1.2, 2.5], color: METAL_COLOR },
  { pos: [-7, 0.6, 0],    size: [2.5, 1.2, 2.5], color: METAL_COLOR },
  // cover tambahan
  { pos: [0, 0.75, -20],  size: [3,   1.5, 1],   color: COVER_GREEN },
  { pos: [0, 0.75,  20],  size: [3,   1.5, 1],   color: COVER_GREEN },
];

function FallbackObstacles() {
  return (
    <>
      {OBSTACLES.map((obs, i) => (
        <mesh key={i} position={obs.pos as [number,number,number]}>
          <boxGeometry args={obs.size as [number,number,number]} />
          <meshStandardMaterial color={obs.color} roughness={0.75} metalness={0.08} />
        </mesh>
      ))}
    </>
  );
}

const BORDER_STRAIGHTS = [
  { pos: [-14, 0, -28] as [number,number,number], rot: [0, 0, 0] as [number,number,number] },
  { pos: [  0, 0, -28] as [number,number,number], rot: [0, 0, 0] as [number,number,number] },
  { pos: [ 14, 0, -28] as [number,number,number], rot: [0, 0, 0] as [number,number,number] },
  { pos: [-14, 0,  28] as [number,number,number], rot: [0, Math.PI, 0] as [number,number,number] },
  { pos: [  0, 0,  28] as [number,number,number], rot: [0, Math.PI, 0] as [number,number,number] },
  { pos: [ 14, 0,  28] as [number,number,number], rot: [0, Math.PI, 0] as [number,number,number] },
  { pos: [-28, 0, -14] as [number,number,number], rot: [0, -Math.PI/2, 0] as [number,number,number] },
  { pos: [-28, 0,   0] as [number,number,number], rot: [0, -Math.PI/2, 0] as [number,number,number] },
  { pos: [-28, 0,  14] as [number,number,number], rot: [0, -Math.PI/2, 0] as [number,number,number] },
  { pos: [ 28, 0, -14] as [number,number,number], rot: [0,  Math.PI/2, 0] as [number,number,number] },
  { pos: [ 28, 0,   0] as [number,number,number], rot: [0,  Math.PI/2, 0] as [number,number,number] },
  { pos: [ 28, 0,  14] as [number,number,number], rot: [0,  Math.PI/2, 0] as [number,number,number] },
];

const BORDER_CORNERS = [
  { pos: [-28, 0, -28] as [number,number,number], rot: [0, 0, 0] as [number,number,number] },
  { pos: [ 28, 0, -28] as [number,number,number], rot: [0, Math.PI/2, 0] as [number,number,number] },
  { pos: [-28, 0,  28] as [number,number,number], rot: [0, -Math.PI/2, 0] as [number,number,number] },
  { pos: [ 28, 0,  28] as [number,number,number], rot: [0, Math.PI, 0] as [number,number,number] },
];

const COLUMNS = [
  { pos: [0, 0, 0] as [number,number,number] },
  { pos: [10, 0, 0] as [number,number,number] },
  { pos: [-10, 0, 0] as [number,number,number] },
  { pos: [0, 0, 10] as [number,number,number] },
  { pos: [0, 0, -10] as [number,number,number] },
];

const BLOCKS = [
  { pos: [10, 0, 10] as [number,number,number] },
  { pos: [-10, 0, 10] as [number,number,number] },
  { pos: [10, 0, -10] as [number,number,number] },
  { pos: [-10, 0, -10] as [number,number,number] },
];

const STAIRS_LIST = [
  { pos: [-20, 0, 0] as [number,number,number], rot: [0, Math.PI/2, 0] as [number,number,number] },
  { pos: [ 20, 0, 0] as [number,number,number], rot: [0, -Math.PI/2, 0] as [number,number,number] },
];

const TREES = [
  { pos: [20, 0, 15] as [number,number,number] },
  { pos: [-20, 0, -15] as [number,number,number] },
  { pos: [20, 0, -18] as [number,number,number] },
  { pos: [-22, 0, 16] as [number,number,number] },
];

function SafeGLB(props: {
  path: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  colorOverride?: string;
  fallback?: ReactNode;
}) {
  const fb = props.fallback ?? null;
  return (
    <GLBErrorBoundary fallback={fb}>
      <Suspense fallback={fb}>
        <ArenaGLB
          path={props.path}
          position={props.position}
          rotation={props.rotation}
          scale={props.scale}
          colorOverride={props.colorOverride}
        />
      </Suspense>
    </GLBErrorBoundary>
  );
}

function ArenaScene() {
  return (
    <group>
      {BORDER_STRAIGHTS.map((w, i) => (
        <SafeGLB
          key={`bs-${i}`}
          path="assets/environment/arena/border-straight.glb"
          position={w.pos}
          rotation={w.rot}
          scale={2}
          colorOverride={STONE_COLOR}
        />
      ))}

      {BORDER_CORNERS.map((c, i) => (
        <SafeGLB
          key={`bc-${i}`}
          path="assets/environment/arena/border-corner.glb"
          position={c.pos}
          rotation={c.rot}
          scale={2}
          colorOverride={STONE_COLOR}
        />
      ))}

      {COLUMNS.map((c, i) => (
        <SafeGLB
          key={`col-${i}`}
          path="assets/environment/arena/column.glb"
          position={c.pos}
          scale={1.5}
          colorOverride={COVER_YELLOW}
        />
      ))}

      {BLOCKS.map((b, i) => (
        <SafeGLB
          key={`blk-${i}`}
          path="assets/environment/arena/block.glb"
          position={b.pos}
          scale={2}
          colorOverride={i % 2 === 0 ? COVER_RED : COVER_BLUE}
        />
      ))}

      {STAIRS_LIST.map((s, i) => (
        <SafeGLB
          key={`st-${i}`}
          path="assets/environment/arena/stairs.glb"
          position={s.pos}
          rotation={s.rot}
          scale={2}
          colorOverride={STONE_DARK}
        />
      ))}

      {TREES.map((t, i) => (
        <SafeGLB
          key={`tr-${i}`}
          path="assets/environment/arena/tree.glb"
          position={t.pos}
          scale={2}
          colorOverride="#3aaa40"
        />
      ))}

      <SafeGLB
        path="assets/environment/arena/statue.glb"
        position={[0, 0, 0]}
        scale={2}
        colorOverride={STONE_COLOR}
      />

      <SafeGLB path="assets/environment/arena/banner.glb" position={[-26, 0, -26]} scale={2} colorOverride="#cc3322" />
      <SafeGLB path="assets/environment/arena/banner.glb" position={[26, 0, 26]} scale={2} rotation={[0, Math.PI, 0]} colorOverride="#2255cc" />

      <SafeGLB path="assets/environment/arena/trophy.glb" position={[-22, 0, 0]} scale={1.5} colorOverride="#e8c020" />
      <SafeGLB path="assets/environment/arena/trophy.glb" position={[22, 0, 0]} scale={1.5} colorOverride="#e8c020" />

      <SafeGLB path="assets/environment/arena/weapon-rack.glb" position={[-20, 0, 5]} scale={1.5} colorOverride={METAL_COLOR} />
      <SafeGLB path="assets/environment/arena/weapon-rack.glb" position={[20, 0, -5]} scale={1.5} colorOverride={METAL_COLOR} />

      <SafeGLB path="assets/environment/arena/bricks.glb" position={[5, 0, 5]} scale={2} colorOverride={STONE_COLOR} />
      <SafeGLB path="assets/environment/arena/bricks.glb" position={[-5, 0, -5]} scale={2} colorOverride={STONE_COLOR} />
      <SafeGLB path="assets/environment/arena/floor-detail.glb" position={[0, 0.01, 0]} scale={3} colorOverride={STONE_DARK} />

      <SafeGLB path="assets/environment/arena/wall-gate.glb" position={[-28, 0, 0]} rotation={[0, Math.PI/2, 0]} scale={2} colorOverride={STONE_COLOR} />
      <SafeGLB path="assets/environment/arena/wall-gate.glb" position={[28, 0, 0]} rotation={[0, -Math.PI/2, 0]} scale={2} colorOverride={STONE_COLOR} />
    </group>
  );
}

export default function ArenaMap() {
  return (
    <group>
      <Floor />
      <GridLines />

      <GLBErrorBoundary fallback={<FallbackObstacles />}>
        <Suspense fallback={<FallbackObstacles />}>
          <ArenaScene />
        </Suspense>
      </GLBErrorBoundary>

      {/* Zona spawn Tim A */}
      <mesh position={[-22, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5, 32]} />
        <meshBasicMaterial color="#4fc3f7" transparent opacity={0.15} />
      </mesh>

      {/* Zona spawn Tim B */}
      <mesh position={[22, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5, 32]} />
        <meshBasicMaterial color="#ff6b35" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}
