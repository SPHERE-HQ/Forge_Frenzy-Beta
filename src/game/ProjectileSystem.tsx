import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Projectile } from "../types/game";
import { useGameStore } from "../stores/gameStore";

const BULLET_COLOR: Record<string, string> = {
  pistol: "#ffff00",
  rifle: "#ff8800",
  smg: "#ffaa00",
  sniper: "#00ffff",
  rpg: "#ff4400",
  grenade: "#44ff44",
  unarmed: "#ffffff",
};

interface ProjectileSystemProps {
  projectiles: Projectile[];
}

export default function ProjectileSystem({ projectiles }: ProjectileSystemProps) {
  const applyDamage = useGameStore((s) => s.applyDamage);
  const bots = useGameStore((s) => s.bots);
  const player = useGameStore((s) => s.player);

  useFrame(() => {
    if (!player) return;
    // Simple collision detection each frame
    projectiles.forEach((p) => {
      if (p.ownerId === player.id) {
        // Check bot hits
        bots.forEach((bot) => {
          if (!bot.isAlive) return;
          const dist = Math.hypot(
            p.position.x - bot.position.x,
            p.position.z - bot.position.z
          );
          if (dist < 0.8) {
            applyDamage(bot.id, p.damage, player.id);
          }
        });
      } else {
        // Check player hit
        const dist = Math.hypot(
          p.position.x - player.position.x,
          p.position.z - player.position.z
        );
        if (dist < 0.8) {
          applyDamage(player.id, p.damage, p.ownerId);
        }
      }
    });
  });

  return (
    <group>
      {projectiles.map((p) => (
        <mesh key={p.id} position={[p.position.x, p.position.y, p.position.z]}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshBasicMaterial color={BULLET_COLOR[p.weapon] ?? "#fff"} />
        </mesh>
      ))}
    </group>
  );
}
