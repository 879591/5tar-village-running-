/**
 * Core Game Engine & Object Pool State for 5tar Village Runner
 * Manages 3-lane coordinates, player physics, reusable obstacles, coins, roadside props, and particles.
 */

import { GAME_CONFIG } from '../config/gameConfig';
import { OBSTACLE_SPECS, ObstacleKind, VILLAGE_ZONES, VillageZoneTheme } from '../assets/villageArtwork';
import { AudioEngine } from '../audio/soundEngine';

export type PlayerActionState = 'RUNNING' | 'JUMPING' | 'SLIDING' | 'CRASHED';

export interface ObstacleEntity {
  active: boolean;
  lane: number; // -1 (left), 0 (center), 1 (right)
  z: number; // Distance ahead from camera (0 = camera, player is at z = 120, spawns at z = 1100)
  kind: ObstacleKind;
  passed: boolean;
}

export interface CoinEntity {
  active: boolean;
  lane: number;
  z: number;
  yOffset: number; // Height above ground (e.g. 0 for ground, >0 for jump arc)
  rotation: number;
}

export interface SceneryProp {
  active: boolean;
  side: -1 | 1; // -1 = left of road, 1 = right of road
  xOffset: number; // Distance from road edge
  z: number;
  propType: 'BANYAN_TREE' | 'PALM_TREE' | 'MUD_HOUSE' | 'MARKET_STALL' | 'HAYSTACK' | 'BRIDGE_PILLAR' | 'MUSTARD_PATCH';
  scale: number;
}

export interface PickupParticle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  label?: string;
}

export const PLAYER_Z = 135;
export const SPAWN_Z = 1150;
export const DESPAWN_Z = 20;

const OBSTACLE_POOL_SIZE = 24;
const COIN_POOL_SIZE = 45;
const SCENERY_POOL_SIZE = 36;
const PARTICLE_POOL_SIZE = 32;

const ALL_OBSTACLE_KINDS: ObstacleKind[] = [
  'STONE_MOUND',
  'MUD_PUDDLE',
  'HAY_BALE',
  'WOODEN_BARRIER',
  'ROAD_BARRICADE',
  'BULLOCK_CART',
];

export class RunnerSimulation {
  // Player state
  public currentLane = 0; // -1, 0, 1
  public visualLane = 0; // Smoothly interpolated lane position (-1 to 1)
  public actionState: PlayerActionState = 'RUNNING';
  public actionTimer = 0;
  public playerY = 0; // Vertical jump offset
  public runAnimPhase = 0;

  // Progression & metrics
  public score = 0;
  public coins = 0;
  public distanceRan = 0;
  public speed = GAME_CONFIG.difficulty.initialSpeed;
  public elapsedTime = 0;
  public crashReason = '';

  // Environment zone cycling
  public currentZoneIndex = 0;
  public zoneDistanceCounter = 0;
  public roadStripeOffset = 0;

  // Timers
  private obstacleSpawnTimer = 0;
  private scenerySpawnTimer = 0;

  // Object Pools (Zero garbage collection spikes during gameplay)
  public obstacles: ObstacleEntity[] = [];
  public coinPool: CoinEntity[] = [];
  public sceneryPool: SceneryProp[] = [];
  public particles: PickupParticle[] = [];

  constructor() {
    for (let i = 0; i < OBSTACLE_POOL_SIZE; i++) {
      this.obstacles.push({
        active: false,
        lane: 0,
        z: 0,
        kind: 'STONE_MOUND',
        passed: false,
      });
    }

    for (let i = 0; i < COIN_POOL_SIZE; i++) {
      this.coinPool.push({
        active: false,
        lane: 0,
        z: 0,
        yOffset: 0,
        rotation: 0,
      });
    }

    for (let i = 0; i < SCENERY_POOL_SIZE; i++) {
      this.sceneryPool.push({
        active: false,
        side: -1,
        xOffset: 100,
        z: 0,
        propType: 'BANYAN_TREE',
        scale: 1,
      });
    }

    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
      this.particles.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0.5,
        color: '#facc15',
        size: 6,
      });
    }

    this.reset();
  }

  public reset(): void {
    this.currentLane = 0;
    this.visualLane = 0;
    this.actionState = 'RUNNING';
    this.actionTimer = 0;
    this.playerY = 0;
    this.runAnimPhase = 0;

    this.score = 0;
    this.coins = 0;
    this.distanceRan = 0;
    this.speed = GAME_CONFIG.difficulty.initialSpeed;
    this.elapsedTime = 0;
    this.crashReason = '';

    this.currentZoneIndex = 0;
    this.zoneDistanceCounter = 0;
    this.roadStripeOffset = 0;
    this.obstacleSpawnTimer = 0.6;
    this.scenerySpawnTimer = 0;

    for (const o of this.obstacles) o.active = false;
    for (const c of this.coinPool) c.active = false;
    for (const s of this.sceneryPool) s.active = false;
    for (const p of this.particles) p.active = false;

    // Pre-populate roadside village scenery so the village looks lush right from the 3-2-1 countdown
    for (let z = 120; z <= SPAWN_Z; z += 95) {
      this.spawnSceneryPairAtZ(z);
    }
  }

  public getCurrentZone(): VillageZoneTheme {
    return VILLAGE_ZONES[this.currentZoneIndex % VILLAGE_ZONES.length];
  }

  // Player Controls
  public moveLeft(): void {
    if (this.actionState === 'CRASHED') return;
    if (this.currentLane > -1) {
      this.currentLane -= 1;
      AudioEngine.playLaneSwitch();
    }
  }

  public moveRight(): void {
    if (this.actionState === 'CRASHED') return;
    if (this.currentLane < 1) {
      this.currentLane += 1;
      AudioEngine.playLaneSwitch();
    }
  }

  public jump(): void {
    if (this.actionState === 'CRASHED') return;
    if (this.actionState !== 'JUMPING') {
      this.actionState = 'JUMPING';
      this.actionTimer = 0;
      this.playerY = 0;
      AudioEngine.playJump();
    }
  }

  public slide(): void {
    if (this.actionState === 'CRASHED') return;
    // Allow quick drop from jump into slide!
    this.actionState = 'SLIDING';
    this.actionTimer = 0;
    this.playerY = 0;
    AudioEngine.playSlide();
  }

  private spawnSceneryPairAtZ(zPos: number): void {
    const zone = this.getCurrentZone().id;
    const sides: (-1 | 1)[] = [-1, 1];

    for (const side of sides) {
      const slot = this.sceneryPool.find((s) => !s.active);
      if (!slot) continue;

      slot.active = true;
      slot.side = side;
      slot.z = zPos + (Math.random() * 30 - 15);
      slot.xOffset = 75 + Math.random() * 110;
      slot.scale = 0.85 + Math.random() * 0.35;

      if (zone === 'RIVER_BRIDGE') {
        slot.propType = 'BRIDGE_PILLAR';
        slot.xOffset = 52;
        slot.scale = 1;
      } else if (zone === 'VILLAGE_HOUSES') {
        slot.propType = Math.random() < 0.55 ? 'MUD_HOUSE' : 'BANYAN_TREE';
      } else if (zone === 'VILLAGE_MARKET') {
        slot.propType = Math.random() < 0.65 ? 'MARKET_STALL' : 'PALM_TREE';
      } else if (zone === 'FARM_LANDS') {
        slot.propType = Math.random() < 0.6 ? 'HAYSTACK' : 'PALM_TREE';
      } else {
        const rand = Math.random();
        slot.propType = rand < 0.45 ? 'BANYAN_TREE' : rand < 0.8 ? 'MUSTARD_PATCH' : 'PALM_TREE';
      }
    }
  }

  private spawnObstacleWave(): void {
    const { doubleObstacleChanceStart, doubleObstacleChanceMax, coinSpawnChance } = GAME_CONFIG.difficulty;
    const progress = Math.min(1, (this.speed - GAME_CONFIG.difficulty.initialSpeed) / (GAME_CONFIG.difficulty.maxSpeed - GAME_CONFIG.difficulty.initialSpeed));

    const doubleChance = doubleObstacleChanceStart + (doubleObstacleChanceMax - doubleObstacleChanceStart) * progress;
    const lanes = [-1, 0, 1];
    // Shuffle lanes
    for (let i = lanes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
    }

    const obstacleCount = Math.random() < doubleChance ? 2 : 1;
    const occupiedLanes: number[] = [];

    for (let i = 0; i < obstacleCount; i++) {
      const slot = this.obstacles.find((o) => !o.active);
      if (!slot) break;

      const lane = lanes[i];
      occupiedLanes.push(lane);

      // Early in the run (< 8 seconds), stick to simpler obstacles before introducing full carts
      const poolSize = this.elapsedTime < 8 ? 4 : ALL_OBSTACLE_KINDS.length;
      const chosenKind = ALL_OBSTACLE_KINDS[Math.floor(Math.random() * poolSize)];

      slot.active = true;
      slot.lane = lane;
      slot.z = SPAWN_Z;
      slot.kind = chosenKind;
      slot.passed = false;

      // If this obstacle can be jumped over, occasionally place an arc of coins above it!
      const spec = OBSTACLE_SPECS[chosenKind];
      if (spec.canJumpOver && Math.random() < 0.45) {
        this.spawnCoinLine(lane, SPAWN_Z - 90, 3, true);
      }
    }

    // Spawn coins in a free lane
    const freeLane = lanes[lanes.length - 1];
    if (Math.random() < coinSpawnChance) {
      const count = 3 + Math.floor(Math.random() * 3); // 3 to 5 coins
      this.spawnCoinLine(freeLane, SPAWN_Z - 60, count, false);
    }
  }

  private spawnCoinLine(lane: number, startZ: number, count: number, isJumpArc: boolean): void {
    const spacing = 52;
    for (let i = 0; i < count; i++) {
      const slot = this.coinPool.find((c) => !c.active);
      if (!slot) break;

      slot.active = true;
      slot.lane = lane;
      slot.z = startZ + i * spacing;
      if (isJumpArc) {
        const norm = count > 1 ? i / (count - 1) : 0.5;
        slot.yOffset = Math.sin(norm * Math.PI) * 85 + 25;
      } else {
        slot.yOffset = 0;
      }
      slot.rotation = i * 0.5;
    }
  }

  public spawnPickupBurst(screenX: number, screenY: number, labelText?: string): void {
    for (let i = 0; i < 8; i++) {
      const p = this.particles.find((item) => !item.active);
      if (!p) break;
      const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.3;
      const speed = 60 + Math.random() * 90;
      p.active = true;
      p.x = screenX;
      p.y = screenY;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 40;
      p.life = 0;
      p.maxLife = 0.38;
      p.color = i % 2 === 0 ? '#facc15' : '#fef08a';
      p.size = 5 + Math.random() * 4;
      p.label = i === 0 ? labelText : undefined;
    }
  }

  /**
   * Main Frame Update Loop
   * Returns true if player is still alive, or false on collision (Game Over)
   */
  public update(dt: number, onCoinScreenPos?: (coin: CoinEntity) => { x: number; y: number }): boolean {
    // Clamp delta time to avoid huge jumps when switching browser tabs
    const safeDt = Math.min(dt, 0.05);

    // Update particles even if crashed
    for (const p of this.particles) {
      if (!p.active) continue;
      p.life += safeDt;
      if (p.life >= p.maxLife) {
        p.active = false;
      } else {
        p.x += p.vx * safeDt;
        p.y += p.vy * safeDt;
      }
    }

    if (this.actionState === 'CRASHED') {
      return false;
    }

    this.elapsedTime += safeDt;

    // Gradually increase difficulty (capped at maxSpeed)
    this.speed = Math.min(
      GAME_CONFIG.difficulty.maxSpeed,
      this.speed + GAME_CONFIG.difficulty.speedAcceleration * safeDt
    );

    const stepDistance = this.speed * safeDt;
    this.distanceRan += stepDistance;
    this.zoneDistanceCounter += stepDistance;
    this.roadStripeOffset = (this.roadStripeOffset + stepDistance) % 120;

    // Cycle village environment zone every 2200 units (~5-6 seconds of running)
    if (this.zoneDistanceCounter >= 2200) {
      this.zoneDistanceCounter = 0;
      this.currentZoneIndex = (this.currentZoneIndex + 1) % VILLAGE_ZONES.length;
    }

    // Score increases with distance + coins
    this.score = Math.floor(this.distanceRan * 0.15) + this.coins * GAME_CONFIG.difficulty.pointsPerCoin;

    // Smooth lane transition
    const laneDiff = this.currentLane - this.visualLane;
    const laneStep = (safeDt / GAME_CONFIG.lanes.SwitchDuration);
    if (Math.abs(laneDiff) <= laneStep) {
      this.visualLane = this.currentLane;
    } else {
      this.visualLane += Math.sign(laneDiff) * laneStep;
    }

    // Running leg/arm animation phase
    const speedFactor = this.speed / GAME_CONFIG.difficulty.initialSpeed;
    this.runAnimPhase += safeDt * 11 * speedFactor;

    // Jump & Slide state timers
    if (this.actionState === 'JUMPING') {
      this.actionTimer += safeDt;
      const progress = this.actionTimer / GAME_CONFIG.player.jumpDuration;
      if (progress >= 1) {
        this.actionState = 'RUNNING';
        this.actionTimer = 0;
        this.playerY = 0;
      } else {
        this.playerY = Math.sin(progress * Math.PI) * GAME_CONFIG.player.jumpHeight;
      }
    } else if (this.actionState === 'SLIDING') {
      this.actionTimer += safeDt;
      this.playerY = 0;
      if (this.actionTimer >= GAME_CONFIG.player.slideDuration) {
        this.actionState = 'RUNNING';
        this.actionTimer = 0;
      }
    } else {
      this.playerY = 0;
    }

    // Spawn roadside village scenery
    this.scenerySpawnTimer -= safeDt;
    if (this.scenerySpawnTimer <= 0) {
      this.spawnSceneryPairAtZ(SPAWN_Z);
      this.scenerySpawnTimer = 85 / this.speed;
    }

    // Update roadside scenery
    for (const s of this.sceneryPool) {
      if (!s.active) continue;
      s.z -= stepDistance;
      if (s.z < DESPAWN_Z) {
        s.active = false;
      }
    }

    // Spawn obstacles and coins
    this.obstacleSpawnTimer -= safeDt;
    if (this.obstacleSpawnTimer <= 0) {
      this.spawnObstacleWave();
      const speedNorm = (this.speed - GAME_CONFIG.difficulty.initialSpeed) / (GAME_CONFIG.difficulty.maxSpeed - GAME_CONFIG.difficulty.initialSpeed);
      const currentInterval =
        GAME_CONFIG.difficulty.initialSpawnInterval -
        (GAME_CONFIG.difficulty.initialSpawnInterval - GAME_CONFIG.difficulty.minSpawnInterval) * Math.min(1, speedNorm);
      this.obstacleSpawnTimer = currentInterval * (0.9 + Math.random() * 0.25);
    }

    // Update coins & check collection
    for (const c of this.coinPool) {
      if (!c.active) continue;
      c.z -= stepDistance;
      c.rotation += safeDt * 5;

      // Check pickup collision with generous, responsive hitbox
      const zDist = Math.abs(c.z - PLAYER_Z);
      const laneDist = Math.abs(c.lane - this.visualLane);
      const heightDiff = Math.abs(c.yOffset - this.playerY);

      if (zDist < 36 && laneDist < 0.48 && heightDiff < 65) {
        c.active = false;
        this.coins += 1;
        AudioEngine.playCoinPickup();
        if (onCoinScreenPos) {
          const pos = onCoinScreenPos(c);
          this.spawnPickupBurst(pos.x, pos.y, `+${GAME_CONFIG.difficulty.pointsPerCoin}`);
        }
        continue;
      }

      if (c.z < DESPAWN_Z) {
        c.active = false;
      }
    }

    // Update obstacles & check fair collision detection
    for (const o of this.obstacles) {
      if (!o.active) continue;
      o.z -= stepDistance;

      // Fair collision window around PLAYER_Z (135)
      // Forgiving depth window: [PLAYER_Z - 18, PLAYER_Z + 22]
      // Forgiving lane window: < 0.36
      if (o.z <= PLAYER_Z + 22 && o.z >= PLAYER_Z - 18) {
        const laneDist = Math.abs(o.lane - this.visualLane);
        if (laneDist < 0.36) {
          const spec = OBSTACLE_SPECS[o.kind];
          let avoided = false;

          if (spec.canJumpOver && this.actionState === 'JUMPING' && this.playerY > 38) {
            avoided = true;
          } else if (spec.canSlideUnder && this.actionState === 'SLIDING') {
            avoided = true;
          }

          if (!avoided) {
            this.actionState = 'CRASHED';
            this.crashReason = spec.name;
            AudioEngine.playCollision();
            return false;
          }
        }
      }

      if (o.z < DESPAWN_Z) {
        o.active = false;
      }
    }

    return true;
  }
}
