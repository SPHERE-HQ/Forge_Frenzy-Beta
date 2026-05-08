import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Projectile } from "../types/game";
import { useGameStore } from "../stores/gameStore";

/* Warna bullet trace per senjata */
const TRACE_COLOR: Record<string, string> = {
  pistol:  "#ffe066",
  rifle:   "#ff9933",
  smg:     "#ffcc44",
  sniper:  "#44eeff",
  rpg:     "#ff4400",
  grenade: "#88ff44",
  unarmed: "#ffffff",
};

/* Tebal trace (sangat tipis) */
const TRACE_THICKNESS = 0.012;

interface Props {
  projectiles: Projectile[];
}

export default function ProjectileSystem({ projectiles }: Props) {
  const applyDamage = useGameStore((s) => s.applyDamage);
  const bots        = useGameStore((s) => s.bots);
  const player      = useGameStore((s) => s.player);

  /* Hit-detection tiap frame — sama seperti sebelumnya */
  useFrame(() => {
    if (!player) return;
    projectiles.forEach((p) => {
      if (p.ownerId === player.id) {
        bots.forEach((bot) => {
          if (!bot.isAlive) return;
          const dist = Math.hypot(
            p.position.x - bot.position.x,
            p.position.z - bot.position.z
          );
          if (dist < 0.9) applyDamage(bot.id, p.damage, player.id);
        });
      } else {
        const dist = Math.hypot(
          p.position.x - player.position.x,
          p.position.z - player.position.z
        );
        if (dist < 0.9) applyDamage(player.id, p.damage, p.ownerId);
      }
    });
  });

  return (
    <group>
      {projectiles.map((p) => {
        /* Panjang trace = seberapa jauh sudah berjalan, maks 4 unit */
        const traceLen = Math.min(p.distanceTraveled, 4.0);
        if (traceLen < 0.05) return null;

        /*
         * Posisi titik tengah trace:
         * Kita ambil midpoint antara (posisi saat ini) dan
         * (posisi saat ini - direction * traceLen)
         * sehingga trace selalu "ekor" di belakang peluru.
         */
        const midX = p.position.x - p.direction.x * (traceLen * 0.5);
        const midY = p.position.y - p.direction.y * (traceLen * 0.5);
        const midZ = p.position.z - p.direction.z * (traceLen * 0.5);

        /* Sudut yaw dari arah tembak */
        const yaw = Math.atan2(p.direction.x, p.direction.z);
        /* Pitch (kemiringan vertikal) */
        const pitch = -Math.asin(
          Math.max(-1, Math.min(1, p.direction.y))
        );

        const color = TRACE_COLOR[p.weapon] ?? "#fff";

        /* RPG: sedikit lebih tebal dan ada asap kecil */
        const isRPG = p.weapon === "rpg";
        const thick = isRPG ? TRACE_THICKNESS * 5 : TRACE_THICKNESS;

        return (
          <group key={p.id}>
            {/* Bullet trace — thin box memanjang */}
            <mesh
              position={[midX, midY, midZ]}
              rotation={[pitch, yaw, 0]}
            >
              <boxGeometry args={[thick, thick, traceLen]} />
              <meshBasicMaterial color={color} />
            </mesh>

            {/* Titik cahaya kecil di ujung peluru */}
            {isRPG && (
              <mesh position={[p.position.x, p.position.y, p.position.z]}>
                <sphereGeometry args={[0.12, 6, 6]} />
                <meshBasicMaterial color="#ff6600" />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
