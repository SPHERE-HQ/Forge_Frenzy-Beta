import type { WEAPONS, ITEM_TYPES } from "../constants/game";

export type HeroType = "medic" | "engineer" | "specter" | "fighter";
export type TeamId = "A" | "B";
export type GameMode = "offline" | "online" | "lan";
export type WeaponType = keyof typeof WEAPONS;
export type ItemType = typeof ITEM_TYPES[number];
export type GamePhase = "splash" | "nickname" | "menu" | "hero_select" | "pre_game" | "playing" | "game_over";
export type PlayerAnimState = "idle" | "walk" | "run" | "crouch" | "jump" | "shoot" | "die" | "scope";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface PlayerState {
  id: string;
  nickname: string;
  hero: HeroType;
  team: TeamId;
  hp: number;
  maxHp: number;
  kills: number;
  deaths: number;
  position: Vec3;
  rotation: number;
  weapon: WeaponType;
  ammo: number;
  maxAmmo: number;
  isAlive: boolean;
  isCrouching: boolean;
  isSprinting: boolean;
  isScoping: boolean;
  skillCooldown: number;
  skillActive: boolean;
  skillDuration: number;
  inventory: Partial<Record<ItemType, number>>;
  droppedWeapons: DroppedWeapon[];
  animState: PlayerAnimState;
}

export interface BotState extends PlayerState {
  isBot: true;
  target: string | null;
  state: "idle" | "patrol" | "chase" | "attack" | "flee";
  isPermanentlyDead: boolean;
}

export interface DroppedWeapon {
  id: string;
  weapon: WeaponType;
  position: Vec3;
}

export interface GroundItem {
  id: string;
  type: ItemType;
  position: Vec3;
}

export interface BuilderMachine {
  id: string;
  position: Vec3;
  team: TeamId | "neutral";
  slots: Array<{
    recipeId: string | null;
    progress: number;
    isComplete: boolean;
  }>;
}

export interface Projectile {
  id: string;
  ownerId: string;
  weapon: WeaponType;
  position: Vec3;
  direction: Vec3;
  speed: number;
  damage: number;
  range: number;
  distanceTraveled: number;
}

export interface GameSettings {
  duration: number;
  killLimit: number;
  mode: GameMode;
}

export interface MatchResult {
  winner: TeamId | "draw";
  teamAKills: number;
  teamBKills: number;
  topPlayer: string;
  duration: number;
}

export interface SpecterTrap {
  id: string;
  ownerId: string;
  position: Vec3;
  type: "mine" | "turret";
  active: boolean;
  hp: number;
}
