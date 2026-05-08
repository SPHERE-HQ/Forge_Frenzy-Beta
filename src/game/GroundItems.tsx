import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GroundItem } from "../types/game";
import { useGameStore } from "../stores/gameStore";

const ITEM_COLORS: Record<string, string> = {
  wood: "#8B6914",
  metal: "#607D8B",
  ammo: "#FFC107",
  grenade_part: "#F44336",
  medkit_part: "#4CAF50",
};

const ITEM_ICONS: Record<string, string> = {
  wood: "🪵",
  metal: "⚙",
  ammo: "🔶",
  grenade_part: "💣",
  medkit_part: "➕",
};

interface GroundItemsProps {
  items: GroundItem[];
}

function FloatingItem({ item }: { item: GroundItem }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pickupItem = useGameStore((s) => s.pickupItem);
  const player = useGameStore((s) => s.player);
  const timeRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;
    meshRef.current.position.y = item.position.y + 0.3 + Math.sin(timeRef.current * 2) * 0.1;
    meshRef.current.rotation.y += delta * 1.5;

    // Auto-pickup check
    if (player) {
      const dist = Math.hypot(
        player.position.x - item.position.x,
        player.position.z - item.position.z
      );
      if (dist < 1.5) pickupItem(item.id);
    }
  });

  const color = ITEM_COLORS[item.type] ?? "#888";

  return (
    <mesh
      ref={meshRef}
      position={[item.position.x, item.position.y + 0.3, item.position.z]}
      castShadow
    >
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} emissive={color} emissiveIntensity={0.2} />
    </mesh>
  );
}

export default function GroundItems({ items }: GroundItemsProps) {
  return (
    <group>
      {items.map((item) => (
        <FloatingItem key={item.id} item={item} />
      ))}
    </group>
  );
}
