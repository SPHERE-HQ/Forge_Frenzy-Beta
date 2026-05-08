// Data collision boxes untuk semua obstacle di arena
// Digunakan oleh gameStore untuk collision detection
// Format: [x, z, halfW, halfD] (half-extents dari pusat)

export interface CollisionBox {
  x: number;
  z: number;
  halfW: number;
  halfD: number;
}

const PLAYER_RADIUS = 0.45;

// Border luar arena
const BORDER_BOXES: CollisionBox[] = [
  { x: 0,   z: -29, halfW: 29 + PLAYER_RADIUS, halfD: 1.0 + PLAYER_RADIUS },
  { x: 0,   z:  29, halfW: 29 + PLAYER_RADIUS, halfD: 1.0 + PLAYER_RADIUS },
  { x: -29, z:  0,  halfW: 1.0 + PLAYER_RADIUS, halfD: 29 + PLAYER_RADIUS },
  { x:  29, z:  0,  halfW: 1.0 + PLAYER_RADIUS, halfD: 29 + PLAYER_RADIUS },
];

// Obstacle tengah (kolom, block, cover)
const OBSTACLE_BOXES: CollisionBox[] = [
  // kolom tengah 5 titik
  { x: 0,   z: 0,   halfW: 1.0, halfD: 1.0 },
  { x: 10,  z: 0,   halfW: 1.0, halfD: 1.0 },
  { x: -10, z: 0,   halfW: 1.0, halfD: 1.0 },
  { x: 0,   z: 10,  halfW: 1.0, halfD: 1.0 },
  { x: 0,   z: -10, halfW: 1.0, halfD: 1.0 },

  // cover block sudut
  { x: 10,  z: 10,  halfW: 2.5, halfD: 2.5 },
  { x: -10, z: 10,  halfW: 2.5, halfD: 2.5 },
  { x: 10,  z: -10, halfW: 2.5, halfD: 2.5 },
  { x: -10, z: -10, halfW: 2.5, halfD: 2.5 },

  // dinding kayu horizontal
  { x: 0,  z: 12,  halfW: 4.0, halfD: 0.6 },
  { x: 0,  z: -12, halfW: 4.0, halfD: 0.6 },

  // dinding kayu vertikal
  { x: 15, z: 0,   halfW: 0.6, halfD: 6.0 },
  { x: -15, z: 0,  halfW: 0.6, halfD: 6.0 },

  // metal box kiri-kanan
  { x: 7,  z: 0,   halfW: 1.4, halfD: 1.4 },
  { x: -7, z: 0,   halfW: 1.4, halfD: 1.4 },

  // tangga
  { x: -20, z: 0,  halfW: 2.0, halfD: 3.0 },
  { x:  20, z: 0,  halfW: 2.0, halfD: 3.0 },

  // trophy & rak senjata
  { x: -22, z: 0,  halfW: 1.2, halfD: 1.2 },
  { x:  22, z: 0,  halfW: 1.2, halfD: 1.2 },
  { x: -20, z: 5,  halfW: 1.2, halfD: 0.8 },
  { x:  20, z: -5, halfW: 1.2, halfD: 0.8 },
];

export const ALL_COLLISION_BOXES: CollisionBox[] = [
  ...BORDER_BOXES,
  ...OBSTACLE_BOXES,
];

export function checkCollision(nx: number, nz: number): boolean {
  for (const box of ALL_COLLISION_BOXES) {
    if (
      nx > box.x - box.halfW &&
      nx < box.x + box.halfW &&
      nz > box.z - box.halfD &&
      nz < box.z + box.halfD
    ) {
      return true;
    }
  }
  return false;
}
