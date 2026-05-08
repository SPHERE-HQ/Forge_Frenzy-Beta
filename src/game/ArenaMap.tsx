import { useGLTF } from "@react-three/drei";
import { Suspense, useMemo, type ReactElement, Component, type ReactNode } from "react";
import * as THREE from "three";

const BASE = import.meta.env.BASE_URL ?? "/";

/* ── Error boundary agar GLB rusak tidak crash ── */
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

/* ── Warna material batu/arena ── */
const STONE_COLOR = "#8a7f72";
const STONE_DARK  = "#6a6058";
const WOOD_COLOR  = "#7a6040";
const METAL_COLOR = "#607080";

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
        m.roughness = 0.92;
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

/* ── Lantai lebih terang ── */
function Floor() {
  return (
    <>
      {/* Lantai utama */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow={false}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#3a4a38" roughness={0.95} metalness={0.0} />
      </mesh>
      {/* Platform area tengah — sedikit lebih cerah */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#445544" roughness={0.95} metalness={0.0} />
      </mesh>
    </>
  );
}

/* ── Grid lines ringan ── */
function GridLines() {
  const grid = useMemo(() => {
    const lines: ReactElement[] = [];
    for (let i = -30; i <= 30; i += 8) {
      lines.push(
        <mesh key={`h${i}`} position={[i, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.04, 60]} />
          <meshBasicMaterial color="#556655" transparent opacity={0.25} />
        </mesh>,
        <mesh key={`v${i}`} position={[0, 0.01, i]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[60, 0.04]} />
          <meshBasicMaterial color="#556655" transparent opacity={0.25} />
        </mesh>
      );
    }
    return lines;
  }, []);
  return <>{grid}</>;
}

/* ── Fallback obstacles pakai box geometry ── */
const OBSTACLES = [
  /* border luar */
  { pos: [0, 1, -29] as [number,number,number], size: [58, 2, 1] as [number,number,number], color: STONE_COLOR },
  { pos: [0, 1,  29] as [number,number,number], size: [58, 2, 1] as [number,number,number], color: STONE_COLOR },
  { pos: [-29, 1, 0] as [number,number,number], size: [1, 2, 58] as [number,number,number], color: STONE_COLOR },
  { pos: [ 29, 1, 0] as [number,number,number], size: [1, 2, 58] as [number,number,number], color: STONE_COLOR },
  /* cover tengah */
  { pos: [0, 0.75, 0],    size: [4,   1.5, 4],   color: STONE_DARK },
  { pos: [10, 0.75, 10],  size: [3,   1.5, 3],   color: STONE_COLOR },
  { pos: [-10, 0.75, 10], size: [3,   1.5, 3],   color: STONE_COLOR },
  { pos: [10, 0.75, -10], size: [3,   1.5, 3],   color: STONE_COLOR },
  { pos: [-10, 0.75,-10], size: [3,   1.5, 3],   color: STONE_COLOR },
  { pos: [0, 0.75, 12],   size: [8,   1.5, 1],   color: WOOD_COLOR },
  { pos: [0, 0.75, -12],  size: [8,   1.5, 1],   color: WOOD_COLOR },
  { pos: [15, 0.75, 0],   size: [1,   1.5, 12],  color: WOOD_COLOR },
  { pos: [-15, 0.75, 0],  size: [1,   1.5, 12],  color: WOOD_COLOR },
  /* box tambahan */
  { pos: [7, 0.6, 0],     size: [2.5, 1.2, 2.5], color: METAL_COLOR },
  { pos: [-7, 0.6, 0],    size: [2.5, 1.2, 2.5], color: METAL_COLOR },
];

function FallbackObstacles() {
  return (
    <>
      {OBSTACLES.map((obs, i) => (
        <mesh key={i} position={obs.pos as [number,number,number]}>
          <boxGeometry args={obs.size as [number,number,number]} />
          <meshStandardMaterial color={obs.color} roughness={0.85} metalness={0.05} />
        </mesh>
      ))}
    </>
  );
}

/* ── Layout GLB yang ada di public/assets/environment/arena/ ── */
/* File yang tersedia: border-straight.glb, border-corner.glb, column.glb,   */
/* block.glb, stairs.glb, tree.glb, statue.glb, banner.glb, trophy.glb,       */
/* weapon-rack.glb, bricks.glb, floor-detail.glb, wall-gate.glb               */

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

/* Wrapper GLB individual dengan error boundary sendiri */
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
      {/* Border luar — pakai border-straight.glb */}
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

      {/* Sudut — border-corner.glb */}
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

      {/* Kolom tengah */}
      {COLUMNS.map((c, i) => (
        <SafeGLB
          key={`col-${i}`}
          path="assets/environment/arena/column.glb"
          position={c.pos}
          scale={1.5}
          colorOverride={STONE_DARK}
        />
      ))}

      {/* Cover block */}
      {BLOCKS.map((b, i) => (
        <SafeGLB
          key={`blk-${i}`}
          path="assets/environment/arena/block.glb"
          position={b.pos}
          scale={2}
          colorOverride={STONE_COLOR}
        />
      ))}

      {/* Tangga */}
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

      {/* Pohon */}
      {TREES.map((t, i) => (
        <SafeGLB
          key={`tr-${i}`}
          path="assets/environment/arena/tree.glb"
          position={t.pos}
          scale={2}
          colorOverride="#4a7a3a"
        />
      ))}

      {/* Patung tengah */}
      <SafeGLB
        path="assets/environment/arena/statue.glb"
        position={[0, 0, 0]}
        scale={2}
        colorOverride={STONE_DARK}
      />

      {/* Banner */}
      <SafeGLB path="assets/environment/arena/banner.glb" position={[-26, 0, -26]} scale={2} colorOverride="#8a3a2a" />
      <SafeGLB path="assets/environment/arena/banner.glb" position={[26, 0, 26]} scale={2} rotation={[0, Math.PI, 0]} colorOverride="#2a3a8a" />

      {/* Trophy */}
      <SafeGLB path="assets/environment/arena/trophy.glb" position={[-22, 0, 0]} scale={1.5} colorOverride="#c8a020" />
      <SafeGLB path="assets/environment/arena/trophy.glb" position={[22, 0, 0]} scale={1.5} colorOverride="#c8a020" />

      {/* Rak senjata */}
      <SafeGLB path="assets/environment/arena/weapon-rack.glb" position={[-20, 0, 5]} scale={1.5} colorOverride={METAL_COLOR} />
      <SafeGLB path="assets/environment/arena/weapon-rack.glb" position={[20, 0, -5]} scale={1.5} colorOverride={METAL_COLOR} />

      {/* Bricks / detail lantai */}
      <SafeGLB path="assets/environment/arena/bricks.glb" position={[5, 0, 5]} scale={2} colorOverride={STONE_COLOR} />
      <SafeGLB path="assets/environment/arena/bricks.glb" position={[-5, 0, -5]} scale={2} colorOverride={STONE_COLOR} />
      <SafeGLB path="assets/environment/arena/floor-detail.glb" position={[0, 0.01, 0]} scale={3} colorOverride={STONE_DARK} />

      {/* Gate */}
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

      {/* Scene arena — pakai GLB, kalau gagal total fallback ke boxes */}
      <GLBErrorBoundary fallback={<FallbackObstacles />}>
        <Suspense fallback={<FallbackObstacles />}>
          <ArenaScene />
        </Suspense>
      </GLBErrorBoundary>

      {/* Zona spawn Tim A */}
      <mesh position={[-22, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5, 32]} />
        <meshBasicMaterial color="#4fc3f7" transparent opacity={0.1} />
      </mesh>

      {/* Zona spawn Tim B */}
      <mesh position={[22, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5, 32]} />
        <meshBasicMaterial color="#ff6b35" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}
