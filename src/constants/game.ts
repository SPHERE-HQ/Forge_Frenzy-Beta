export const GAME_TITLE = "Forge Frenzy";
export const STUDIO_NAME = "SPHERE-HQ";

export const DEFAULT_MATCH_DURATION = 300; // detik
export const DEFAULT_KILL_LIMIT = 20;
export const MIN_MATCH_DURATION = 60;
export const MAX_MATCH_DURATION = 600;
export const MIN_KILL_LIMIT = 5;
export const MAX_KILL_LIMIT = 50;

export const TEAM_SIZE = 5;
export const PLAYER_TEAM = "A";
export const BOT_TEAM = "B";

export const HERO_MAX_HP: Record<string, number> = {
  medic: 100,
  engineer: 90,
  specter: 85,
  fighter: 120,
};

export const SKILL_COOLDOWN: Record<string, number> = {
  medic: 30,
  engineer: 60,
  specter: 45,
  fighter: 30,
};

export const SKILL_DURATION: Record<string, number> = {
  medic: 0,
  engineer: 0,
  specter: 0,
  fighter: 40,
};

export const PLAYER_SPEED = 5;
export const SPRINT_MULTIPLIER = 1.7;
export const CROUCH_MULTIPLIER = 0.5;
export const JUMP_FORCE = 5;
export const GRAVITY = -20;

export const BOT_SPEED = 3.5;
export const BOT_SIGHT_RANGE = 20;
export const BOT_ATTACK_RANGE = 15;
export const BOT_REACTION_TIME = 0.8;

export const BUILDER_MACHINE_SLOTS = 2;
export const CRAFT_TIME_BASE = 5; // detik

export const ITEM_SPAWN_COUNT = 20;
export const ITEM_TYPES = ["wood", "metal", "ammo", "grenade_part", "medkit_part"] as const;

export const WEAPONS = {
  unarmed: { name: "Tangan Kosong", damage: 10, fireRate: 1, ammo: -1, maxAmmo: -1, range: 2, type: "melee" },
  pistol:   { name: "Pistol",       damage: 25, fireRate: 3, ammo: 12, maxAmmo: 30, range: 40, type: "pistol" },
  rifle:    { name: "Senapan (M4A1)", damage: 30, fireRate: 8, ammo: 30, maxAmmo: 90, range: 60, type: "rifle" },
  smg:      { name: "SMG (MP5)",    damage: 20, fireRate: 12, ammo: 30, maxAmmo: 90, range: 35, type: "smg" },
  sniper:   { name: "Sniper",       damage: 90, fireRate: 0.5, ammo: 5, maxAmmo: 20, range: 120, type: "sniper" },
  rpg:      { name: "RPG",          damage: 150, fireRate: 0.3, ammo: 1, maxAmmo: 3, range: 80, type: "launcher" },
  grenade:  { name: "Granat",       damage: 120, fireRate: 0.5, ammo: 1, maxAmmo: 3, range: 30, type: "throwable" },
} as const;

export const CRAFT_RECIPES: Array<{
  id: string;
  name: string;
  weapon: keyof typeof WEAPONS;
  ingredients: Record<string, number>;
  craftTime: number;
}> = [
  { id: "craft_pistol",  name: "Pistol",    weapon: "pistol",  ingredients: { metal: 2 },               craftTime: 5  },
  { id: "craft_rifle",   name: "Senapan",   weapon: "rifle",   ingredients: { metal: 5, wood: 2 },      craftTime: 10 },
  { id: "craft_smg",     name: "SMG",       weapon: "smg",     ingredients: { metal: 3, wood: 1 },      craftTime: 8  },
  { id: "craft_sniper",  name: "Sniper",    weapon: "sniper",  ingredients: { metal: 6, wood: 3 },      craftTime: 15 },
  { id: "craft_rpg",     name: "RPG",       weapon: "rpg",     ingredients: { metal: 8, wood: 4 },      craftTime: 20 },
  { id: "craft_grenade", name: "Granat",    weapon: "grenade", ingredients: { metal: 2, grenade_part: 1 }, craftTime: 5 },
  { id: "craft_medkit",  name: "Medkit Bot",   weapon: "unarmed", ingredients: { medkit_part: 3, wood: 1 }, craftTime: 10 },
];

export const MODES = {
  offline: "Offline (vs Bot)",
  online: "Online",
  lan: "LAN",
} as const;
