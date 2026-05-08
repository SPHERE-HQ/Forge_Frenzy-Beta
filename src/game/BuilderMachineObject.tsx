import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BuilderMachine } from "../types/game";
import { useGameStore } from "../stores/gameStore";

interface BuilderMachineObjectProps {
  machine: BuilderMachine;
}

export default function BuilderMachineObject({ machine }: BuilderMachineObjectProps) {
  const lightRef = useRef<THREE.PointLight>(null);
  const animTime = useRef(0);

  useFrame((_, delta) => {
    animTime.current += delta;
    if (lightRef.current) {
      lightRef.current.intensity = 0.5 + Math.sin(animTime.current * 3) * 0.2;
    }
  });

  const hasActiveCraft = machine.slots.some((s) => s.recipeId && !s.isComplete);
  const hasReady = machine.slots.some((s) => s.isComplete);
  const lightColor = hasReady ? "#00ff88" : hasActiveCraft ? "#ffaa00" : "#4488ff";

  return (
    <group position={[machine.position.x, 0, machine.position.z]}>
      {/* Base */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.8, 1.5]} />
        <meshStandardMaterial color="#2a3a4a" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Top panel */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[1.3, 0.1, 1.3]} />
        <meshStandardMaterial color="#1a2a3a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Slot indicators */}
      {machine.slots.map((slot, i) => (
        <mesh key={i} position={[i === 0 ? -0.3 : 0.3, 0.91, 0]}>
          <boxGeometry args={[0.4, 0.05, 0.4]} />
          <meshStandardMaterial
            color={slot.isComplete ? "#00ff88" : slot.recipeId ? "#ffaa00" : "#334455"}
            emissive={slot.isComplete ? "#00aa44" : slot.recipeId ? "#885500" : "#000"}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Antenna */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.0, 6]} />
        <meshStandardMaterial color="#556677" metalness={0.7} />
      </mesh>
      <mesh position={[0, 1.9, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={lightColor} emissive={lightColor} emissiveIntensity={0.8} />
      </mesh>

      {/* Glow light */}
      <pointLight ref={lightRef} position={[0, 2, 0]} color={lightColor} intensity={0.5} distance={4} />

      {/* Interaction radius */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.5, 4, 32]} />
        <meshBasicMaterial color={lightColor} transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
