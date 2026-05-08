import { create } from "zustand";
import type {
  GamePhase, HeroType, GameMode, PlayerState, BotState,
  GameSettings, GroundItem, BuilderMachine, Projectile,
  DroppedWeapon, MatchResult, SpecterTrap, TeamId
} from "../types/game";
import {
  HERO_MAX_HP, PLAYER_TEAM, BOT_TEAM, TEAM_SIZE,
  DEFAULT_MATCH_DURATION, DEFAULT_KILL_LIMIT, CRAFT_RECIPES,
  BUILDER_MACHINE_SLOTS, ITEM_SPAWN_COUNT, ITEM_TYPES,
  WEAPONS, CRAFT_TIME_BASE, SKILL_COOLDOWN, SKILL_DURATION
} from "../constants/game";
import { generateId, randomArenaPosition, clamp } from "../utils/math";
import { cameraState } from "../game/cameraState";
import { checkCollision } from "../game/collisionData";

interface GameStore {
  // Phase & meta
  phase: GamePhase;
  nickname: string;
  settings: GameSettings;
  matchResult: MatchResult | null;
  elapsedTime: number;

  // Players & bots
  player: PlayerState | null;
  bots: BotState[];

  // World
  groundItems: GroundItem[];
  droppedWeapons: DroppedWeapon[];
  builderMachines: BuilderMachine[];
  projectiles: Projectile[];
  traps: SpecterTrap[];

  // UI state
  isBuildMenuOpen: boolean;
  activeBuildSlot: number | null;
  activeBuilderMachineId: string | null;

  // Actions
  setPhase: (phase: GamePhase) => void;
  setNickname: (name: string) => void;
  setSettings: (s: Partial<GameSettings>) => void;
  startGame: (hero: HeroType) => void;
  resetGame: () => void;
  tick: (delta: number) => void;
  movePlayer: (dx: number, dz: number, sprint: boolean) => void;
  rotatePlayer: (yaw: number) => void;
  playerShoot: () => void;
  playerReload: () => void;
  playerJump: () => void;
  playerCrouch: (v: boolean) => void;
  playerScope: (v: boolean) => void;
  playerUseSkill: () => void;
  pickupItem: (itemId: string) => void;
  pickupWeapon: (weaponId: string) => void;
  dropWeapon: () => void;
  openBuildMenu: (machineId: string | null) => void;
  closeBuildMenu: () => void;
  startCraft: (slotIndex: number, recipeId: string) => void;
  collectCraft: (machineId: string, slotIndex: number) => void;
  applyDamage: (targetId: string, damage: number, attackerId: string) => void;
}

function createPlayer(nickname: string, hero: HeroType): PlayerState {
  return {
    id: "player_1",
    nickname,
    hero,
    team: PLAYER_TEAM as TeamId,
    hp: HERO_MAX_HP[hero],
    maxHp: HERO_MAX_HP[hero],
    kills: 0,
    deaths: 0,
    position: { x: -22, y: 0, z: 0 }, // spawn di zona tim A
    rotation: 0,
    weapon: "unarmed",
    ammo: -1,
    maxAmmo: -1,
    isAlive: true,
    isCrouching: false,
    isSprinting: false,
    isScoping: false,
    skillCooldown: 0,
    skillActive: false,
    skillDuration: 0,
    inventory: {},
    droppedWeapons: [],
    animState: "idle",
  };
}

function createBot(index: number, team: TeamId): BotState {
  const heroes: HeroType[] = ["medic", "engineer", "specter", "fighter"];
  const hero = heroes[index % heroes.length];
  const pos = randomArenaPosition();
  return {
    id: `bot_${team}_${index}`,
    nickname: `Bot_${index + 1}`,
    hero,
    team,
    hp: HERO_MAX_HP[hero],
    maxHp: HERO_MAX_HP[hero],
    kills: 0,
    deaths: 0,
    position: pos,
    rotation: 0,
    weapon: "unarmed",
    ammo: -1,
    maxAmmo: -1,
    isAlive: true,
    isCrouching: false,
    isSprinting: false,
    isScoping: false,
    skillCooldown: 0,
    skillActive: false,
    skillDuration: 0,
    inventory: {},
    droppedWeapons: [],
    animState: "idle",
    isBot: true,
    target: null,
    state: "patrol",
    isPermanentlyDead: false,
  };
}

function spawnGroundItems(): GroundItem[] {
  const items: GroundItem[] = [];
  for (let i = 0; i < ITEM_SPAWN_COUNT; i++) {
    const pos = randomArenaPosition();
    items.push({
      id: generateId(),
      type: ITEM_TYPES[i % ITEM_TYPES.length],
      position: pos,
    });
  }
  return items;
}

function createBuilderMachines(): BuilderMachine[] {
  return [
    {
      id: "bm_A",
      position: { x: -15, y: 0, z: 0 },
      team: "neutral",
      slots: Array.from({ length: BUILDER_MACHINE_SLOTS }, () => ({
        recipeId: null, progress: 0, isComplete: false
      })),
    },
    {
      id: "bm_B",
      position: { x: 15, y: 0, z: 0 },
      team: "neutral",
      slots: Array.from({ length: BUILDER_MACHINE_SLOTS }, () => ({
        recipeId: null, progress: 0, isComplete: false
      })),
    },
  ];
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: "splash",
  nickname: "",
  settings: { duration: DEFAULT_MATCH_DURATION, killLimit: DEFAULT_KILL_LIMIT, mode: "offline" },
  matchResult: null,
  elapsedTime: 0,
  player: null,
  bots: [],
  groundItems: [],
  droppedWeapons: [],
  builderMachines: [],
  projectiles: [],
  traps: [],
  isBuildMenuOpen: false,
  activeBuildSlot: null,
  activeBuilderMachineId: null,

  setPhase: (phase) => set({ phase }),
  setNickname: (nickname) => {
    localStorage.setItem("ff_nickname", nickname);
    set({ nickname });
  },
  setSettings: (s) => set((st) => ({ settings: { ...st.settings, ...s } })),

  startGame: (hero) => {
    const { nickname } = get();
    const player = createPlayer(nickname, hero);
    const bots: BotState[] = [];
    for (let i = 0; i < TEAM_SIZE - 1; i++) bots.push(createBot(i, PLAYER_TEAM as TeamId));
    for (let i = 0; i < TEAM_SIZE; i++) bots.push(createBot(i, BOT_TEAM as TeamId));
    set({
      player,
      bots,
      groundItems: spawnGroundItems(),
      droppedWeapons: [],
      builderMachines: createBuilderMachines(),
      projectiles: [],
      traps: [],
      elapsedTime: 0,
      matchResult: null,
      phase: "playing",
    });
  },

  resetGame: () => set({
    phase: "menu",
    player: null,
    bots: [],
    groundItems: [],
    droppedWeapons: [],
    builderMachines: [],
    projectiles: [],
    traps: [],
    elapsedTime: 0,
    matchResult: null,
    isBuildMenuOpen: false,
  }),

  tick: (delta) => {
    const { player, bots, settings, elapsedTime, projectiles, builderMachines, traps } = get();
    if (!player) return;

    const newElapsed = elapsedTime + delta;

    // Check win conditions
    const playerTeamKills = bots.filter(b => b.team === BOT_TEAM && b.isPermanentlyDead).length
      + (player.kills);
    const botTeamKills = bots.filter(b => b.team === PLAYER_TEAM && b.isPermanentlyDead).length;

    const timeUp = newElapsed >= settings.duration;
    const killLimitReached = playerTeamKills >= settings.killLimit || botTeamKills >= settings.killLimit;

    if (timeUp || killLimitReached) {
      const winner: TeamId | "draw" = playerTeamKills > botTeamKills ? PLAYER_TEAM as TeamId
        : botTeamKills > playerTeamKills ? BOT_TEAM as TeamId : "draw";
      set({
        phase: "game_over",
        matchResult: {
          winner,
          teamAKills: playerTeamKills,
          teamBKills: botTeamKills,
          topPlayer: player.nickname,
          duration: newElapsed,
        },
        elapsedTime: newElapsed,
      });
      return;
    }

    // Update projectiles
    const newProjectiles = projectiles.filter(p => {
      p.position.x += p.direction.x * p.speed * delta;
      p.position.y += p.direction.y * p.speed * delta;
      p.position.z += p.direction.z * p.speed * delta;
      p.distanceTraveled += p.speed * delta;
      return p.distanceTraveled < p.range;
    });

    // Update builder machine craft progress
    const newMachines = builderMachines.map(m => ({
      ...m,
      slots: m.slots.map(s => {
        if (!s.recipeId || s.isComplete) return s;
        const recipe = CRAFT_RECIPES.find(r => r.id === s.recipeId);
        if (!recipe) return s;
        const newProgress = s.progress + delta;
        return { ...s, progress: newProgress, isComplete: newProgress >= recipe.craftTime };
      }),
    }));

    // Update skill durations
    let newPlayer = { ...player };
    if (newPlayer.skillActive && newPlayer.skillDuration > 0) {
      newPlayer.skillDuration = Math.max(0, newPlayer.skillDuration - delta);
      if (newPlayer.skillDuration <= 0) newPlayer.skillActive = false;
    }
    if (newPlayer.skillCooldown > 0) {
      newPlayer.skillCooldown = Math.max(0, newPlayer.skillCooldown - delta);
    }

    // Simple bot AI tick
    const newBots = bots.map(bot => {
      if (!bot.isAlive || bot.isPermanentlyDead) return bot;
      const b = { ...bot };
      if (b.skillCooldown > 0) b.skillCooldown = Math.max(0, b.skillCooldown - delta);
      return b;
    });

    set({
      elapsedTime: newElapsed,
      projectiles: newProjectiles,
      builderMachines: newMachines,
      player: newPlayer,
      bots: newBots,
    });
  },

  movePlayer: (dx, dz, sprint) => {
    const { player } = get();
    if (!player || !player.isAlive) return;

    const speed = sprint ? 5 * 1.7 : player.isCrouching ? 5 * 0.5 : 5;
    const dt = 0.016;

    // ── Camera-relative movement ──
    // Joystick: dx = kanan, dz = bawah layar
    // Camera forward (world XZ) = (sin(yaw), cos(yaw))
    // Camera right  (world XZ) = (cos(yaw), -sin(yaw))
    const yaw = cameraState.yaw;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);

    // forward joystick = -dz (atas = maju)
    // strafe joystick  = dx  (kanan = geser kanan)
    const jFwd   = -dz;
    const jRight =  dx;

    const worldDx = jRight * cosY + jFwd * sinY;
    const worldDz = jRight * (-sinY) + jFwd * cosY;

    const nx = player.position.x + worldDx * speed * dt;
    const nz = player.position.z + worldDz * speed * dt;

    // Clamp ke batas arena
    const cx = clamp(nx, -27.5, 27.5);
    const cz = clamp(nz, -27.5, 27.5);

    // ── Collision detection ──
    // Coba gerak penuh dulu, kalau tabrakan coba axis tunggal
    let finalX = player.position.x;
    let finalZ = player.position.z;

    if (!checkCollision(cx, cz)) {
      // Bebas bergerak ke dua arah
      finalX = cx;
      finalZ = cz;
    } else if (!checkCollision(cx, player.position.z)) {
      // Hanya X yang bisa
      finalX = cx;
      finalZ = player.position.z;
    } else if (!checkCollision(player.position.x, cz)) {
      // Hanya Z yang bisa
      finalX = player.position.x;
      finalZ = cz;
    }
    // else: tidak bisa gerak sama sekali (sudut)

    const moving = Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01;

    // Rotasi karakter mengikuti arah camera + arah gerak joystick
    let newRotation = player.rotation;
    if (moving) {
      // Arahkan karakter ke arah gerak di dunia
      newRotation = Math.atan2(worldDx, worldDz);
    }

    set({
      player: {
        ...player,
        position: {
          x: finalX,
          y: player.position.y,
          z: finalZ,
        },
        rotation: newRotation,
        isSprinting: sprint && moving,
        animState: !moving ? "idle" : sprint ? "run" : "walk",
      }
    });
  },

  rotatePlayer: (yaw) => {
    const { player } = get();
    if (!player) return;
    set({ player: { ...player, rotation: yaw } });
  },

  playerShoot: () => {
    const { player, projectiles } = get();
    if (!player || !player.isAlive) return;
    if (player.weapon === "unarmed") return;
    const weaponData = WEAPONS[player.weapon];
    if (player.ammo <= 0) return;

    const angle = player.rotation;
    const dir = { x: Math.sin(angle), y: 0, z: Math.cos(angle) };

    const WEAPON_SPEED: Record<string, number> = {
      pistol:  180,
      rifle:   220,
      smg:     200,
      sniper:  350,
      rpg:     90,
      grenade: 70,
      unarmed: 100,
    };

    const newProjectile: Projectile = {
      id: generateId(),
      ownerId: player.id,
      weapon: player.weapon,
      position: { ...player.position, y: 1.1 },
      direction: dir,
      speed: WEAPON_SPEED[player.weapon] ?? 200,
      damage: weaponData.damage,
      range: weaponData.range,
      distanceTraveled: 0,
    };

    set({
      player: { ...player, ammo: player.ammo - 1, animState: "shoot" },
      projectiles: [...projectiles, newProjectile],
    });
  },

  playerReload: () => {
    const { player } = get();
    if (!player || player.weapon === "unarmed") return;
    const weaponData = WEAPONS[player.weapon];
    if (weaponData.ammo < 0) return;
    set({ player: { ...player, ammo: weaponData.ammo, maxAmmo: weaponData.maxAmmo } });
  },

  playerJump: () => {
    const { player } = get();
    if (!player || !player.isAlive || player.isCrouching) return;
    set({ player: { ...player, animState: "jump" } });
  },

  playerCrouch: (v) => {
    const { player } = get();
    if (!player) return;
    set({ player: { ...player, isCrouching: v, animState: v ? "crouch" : "idle" } });
  },

  playerScope: (v) => {
    const { player } = get();
    if (!player) return;
    set({ player: { ...player, isScoping: v, animState: v ? "scope" : "idle" } });
  },

  playerUseSkill: () => {
    const { player } = get();
    if (!player || !player.isAlive || player.skillCooldown > 0) return;
    set({
      player: {
        ...player,
        skillActive: true,
        skillCooldown: SKILL_COOLDOWN[player.hero],
        skillDuration: SKILL_DURATION[player.hero],
        hp: player.hero === "medic" ? Math.min(player.hp + 30, player.maxHp) : player.hp,
      }
    });
  },

  pickupItem: (itemId) => {
    const { player, groundItems } = get();
    if (!player) return;
    const item = groundItems.find(i => i.id === itemId);
    if (!item) return;
    const dist = Math.hypot(player.position.x - item.position.x, player.position.z - item.position.z);
    if (dist > 3) return;
    const inv = { ...player.inventory };
    inv[item.type] = (inv[item.type] ?? 0) + 1;
    set({
      player: { ...player, inventory: inv },
      groundItems: groundItems.filter(i => i.id !== itemId),
    });
  },

  pickupWeapon: (weaponId) => {
    const { player, droppedWeapons } = get();
    if (!player) return;
    const dw = droppedWeapons.find(w => w.id === weaponId);
    if (!dw) return;
    const dist = Math.hypot(player.position.x - dw.position.x, player.position.z - dw.position.z);
    if (dist > 3) return;
    const weaponData = WEAPONS[dw.weapon];
    set({
      player: {
        ...player,
        weapon: dw.weapon,
        ammo: weaponData.ammo,
        maxAmmo: weaponData.maxAmmo,
      },
      droppedWeapons: droppedWeapons.filter(w => w.id !== weaponId),
    });
  },

  dropWeapon: () => {
    const { player, droppedWeapons } = get();
    if (!player || player.weapon === "unarmed") return;
    const dropped: DroppedWeapon = {
      id: generateId(),
      weapon: player.weapon,
      position: { ...player.position },
    };
    set({
      player: { ...player, weapon: "unarmed", ammo: -1, maxAmmo: -1 },
      droppedWeapons: [...droppedWeapons, dropped],
    });
  },

  openBuildMenu: (machineId) => set({ isBuildMenuOpen: true, activeBuilderMachineId: machineId }),
  closeBuildMenu: () => set({ isBuildMenuOpen: false, activeBuilderMachineId: null }),

  startCraft: (slotIndex, recipeId) => {
    const { builderMachines, activeBuilderMachineId, player } = get();
    if (!player || !activeBuilderMachineId) return;
    const recipe = CRAFT_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;

    if (player.hero !== "engineer") {
      for (const [item, count] of Object.entries(recipe.ingredients)) {
        const have = player.inventory[item as keyof typeof player.inventory] ?? 0;
        if (have < count) return;
      }
      const newInv = { ...player.inventory };
      for (const [item, count] of Object.entries(recipe.ingredients)) {
        newInv[item as keyof typeof newInv] = (newInv[item as keyof typeof newInv] ?? 0) - (count as number);
      }
      set({ player: { ...player, inventory: newInv } });
    }

    const newMachines = builderMachines.map(m => {
      if (m.id !== activeBuilderMachineId) return m;
      const slots = [...m.slots];
      slots[slotIndex] = { recipeId, progress: 0, isComplete: false };
      return { ...m, slots };
    });
    set({ builderMachines: newMachines });
  },

  collectCraft: (machineId, slotIndex) => {
    const { builderMachines, player, droppedWeapons } = get();
    if (!player) return;
    const machine = builderMachines.find(m => m.id === machineId);
    if (!machine) return;
    const slot = machine.slots[slotIndex];
    if (!slot.isComplete || !slot.recipeId) return;
    const recipe = CRAFT_RECIPES.find(r => r.id === slot.recipeId);
    if (!recipe) return;

    const weaponData = WEAPONS[recipe.weapon];
    const newMachines = builderMachines.map(m => {
      if (m.id !== machineId) return m;
      const slots = [...m.slots];
      slots[slotIndex] = { recipeId: null, progress: 0, isComplete: false };
      return { ...m, slots };
    });

    set({
      player: {
        ...player,
        weapon: recipe.weapon,
        ammo: weaponData.ammo,
        maxAmmo: weaponData.maxAmmo,
      },
      builderMachines: newMachines,
    });
  },

  applyDamage: (targetId, damage, attackerId) => {
    const { player, bots, settings } = get();
    if (!player) return;

    if (targetId === player.id) {
      if (!player.isAlive) return;
      if (player.hero === "fighter" && player.skillActive) return;
      const newHp = Math.max(0, player.hp - damage);
      const newPlayer = { ...player, hp: newHp, isAlive: newHp > 0, animState: newHp <= 0 ? "die" as const : player.animState };
      if (newHp <= 0) {
        const attackerBot = bots.find(b => b.id === attackerId);
        if (attackerBot) {
          const newBots = bots.map(b => b.id === attackerId ? { ...b, kills: b.kills + 1 } : b);
          set({ player: newPlayer, bots: newBots });
          return;
        }
      }
      set({ player: newPlayer });
      return;
    }

    const newBots = bots.map(b => {
      if (b.id !== targetId || !b.isAlive) return b;
      const newHp = Math.max(0, b.hp - damage);
      const died = newHp <= 0;
      if (died && attackerId === player.id) {
        set((st) => ({
          player: st.player ? { ...st.player, kills: st.player.kills + 1 } : st.player
        }));
      }
      return {
        ...b,
        hp: newHp,
        isAlive: !died,
        isPermanentlyDead: died && b.team === BOT_TEAM,
        animState: died ? "die" as const : b.animState,
      };
    });
    set({ bots: newBots });
  },
}));
