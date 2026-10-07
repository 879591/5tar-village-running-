/**
 * Original Procedural Vector Assets & Helpers
 * Contains color palettes, village zone definitions, and obstacle definitions for 5tar Village Runner.
 */

export type VillageZoneType = 'GREEN_FIELDS' | 'VILLAGE_HOUSES' | 'RIVER_BRIDGE' | 'FARM_LANDS' | 'VILLAGE_MARKET';

export interface VillageZoneTheme {
  id: VillageZoneType;
  label: string;
  groundLeftColor: string;
  groundRightColor: string;
  roadColor: string;
  roadBorderColor: string;
  accentColor: string;
}

export const VILLAGE_ZONES: VillageZoneTheme[] = [
  {
    id: 'GREEN_FIELDS',
    label: 'Mustard & Green Fields',
    groundLeftColor: '#15803d', // Lush green field
    groundRightColor: '#166534',
    roadColor: '#b45309', // Warm terracotta dirt road
    roadBorderColor: '#92400e',
    accentColor: '#eab308', // Mustard flowers
  },
  {
    id: 'VILLAGE_HOUSES',
    label: 'Mud & Thatch Homesteads',
    groundLeftColor: '#3f6212',
    groundRightColor: '#365314',
    roadColor: '#a16207',
    roadBorderColor: '#78350f',
    accentColor: '#f97316', // Terracotta roof tiles
  },
  {
    id: 'FARM_LANDS',
    label: 'Harvest Farm Areas',
    groundLeftColor: '#ca8a04', // Golden wheat/mustard farm
    groundRightColor: '#a16207',
    roadColor: '#92400e',
    roadBorderColor: '#78350f',
    accentColor: '#22c55e',
  },
  {
    id: 'RIVER_BRIDGE',
    label: 'Village Canal Bridge',
    groundLeftColor: '#0369a1', // Canal water
    groundRightColor: '#0284c7',
    roadColor: '#57534e', // Stone & wood bridge deck
    roadBorderColor: '#d6d3d1', // Bridge stone parapet
    accentColor: '#38bdf8',
  },
  {
    id: 'VILLAGE_MARKET',
    label: 'Bazaar & Festive Market',
    groundLeftColor: '#4d7c0f',
    groundRightColor: '#3f6212',
    roadColor: '#9a3412',
    roadBorderColor: '#7c2d12',
    accentColor: '#ec4899', // Festive bazaar canopies
  },
];

export type ObstacleKind =
  | 'STONE_MOUND'        // Jump over or switch lane
  | 'WOODEN_BARRIER'     // High overhead beam — Slide under or switch lane
  | 'MUD_PUDDLE'         // Low wide puddle — Jump over or switch lane
  | 'HAY_BALE'           // Farm object — Jump over or switch lane
  | 'BULLOCK_CART'       // Tall full-lane village cart — Must switch lane
  | 'ROAD_BARRICADE';    // Overhead market banner / high barrier — Slide under or switch lane

export interface ObstacleSpec {
  kind: ObstacleKind;
  name: string;
  canJumpOver: boolean;
  canSlideUnder: boolean;
  heightType: 'LOW' | 'HIGH_OVERHEAD' | 'FULL_TALL';
}

export const OBSTACLE_SPECS: Record<ObstacleKind, ObstacleSpec> = {
  STONE_MOUND: {
    kind: 'STONE_MOUND',
    name: 'Village Stones',
    canJumpOver: true,
    canSlideUnder: false,
    heightType: 'LOW',
  },
  MUD_PUDDLE: {
    kind: 'MUD_PUDDLE',
    name: 'Monsoon Puddle',
    canJumpOver: true,
    canSlideUnder: false,
    heightType: 'LOW',
  },
  HAY_BALE: {
    kind: 'HAY_BALE',
    name: 'Farm Hay Bale & Pots',
    canJumpOver: true,
    canSlideUnder: false,
    heightType: 'LOW',
  },
  WOODEN_BARRIER: {
    kind: 'WOODEN_BARRIER',
    name: 'High Wooden Gate',
    canJumpOver: false,
    canSlideUnder: true,
    heightType: 'HIGH_OVERHEAD',
  },
  ROAD_BARRICADE: {
    kind: 'ROAD_BARRICADE',
    name: 'Bazaar Arch Barrier',
    canJumpOver: false,
    canSlideUnder: true,
    heightType: 'HIGH_OVERHEAD',
  },
  BULLOCK_CART: {
    kind: 'BULLOCK_CART',
    name: 'Loaded Village Cart',
    canJumpOver: false,
    canSlideUnder: false,
    heightType: 'FULL_TALL',
  },
};
