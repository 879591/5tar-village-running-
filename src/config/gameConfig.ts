/**
 * Game & Developer Configuration
 * Centralized settings for 5tar Village Runner
 */

export interface DeveloperConfig {
  studioName: string;
  developerName: string;
  roleTitle: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    youtube: string;
    website: string;
  };
}

export interface DifficultyConfig {
  initialSpeed: number; // Base forward speed (units per second)
  maxSpeed: number; // Cap so the game never becomes impossible
  speedAcceleration: number; // Speed increase per second of survival
  initialSpawnInterval: number; // Seconds between obstacle rows at start
  minSpawnInterval: number; // Minimum seconds between obstacle rows at max speed
  coinSpawnChance: number; // Probability (0-1) of spawning coin arcs alongside or between obstacles
  doubleObstacleChanceStart: number; // Probability of 2-lane obstacles early on
  doubleObstacleChanceMax: number; // Max probability of 2-lane obstacles (always leaves at least 1 valid path)
  scorePerMeter: number; // Base score per unit distance
  pointsPerCoin: number; // Bonus score when picking up a coin
}

export interface GameConfig {
  title: string;
  subtitle: string;
  version: string;
  isPlayablesBuild: boolean; // Set to true when packaging for YouTube Playables to hide external social links
  lanes: {
    count: number;
    SwitchDuration: number; // Seconds to smoothly transition between lanes
  };
  player: {
    jumpDuration: number; // Seconds in air
    jumpHeight: number; // Normalized jump height
    slideDuration: number; // Seconds sliding
  };
  difficulty: DifficultyConfig;
  developer: DeveloperConfig;
  storageKeys: {
    bestScore: string;
    totalCoins: string;
    settings: string;
  };
}

export const GAME_CONFIG: GameConfig = {
  title: "5tar Village Runner",
  subtitle: "Original Indian Village Endless Runner",
  version: "1.0.0",
  isPlayablesBuild: false, // Normal web version shows configured social links
  lanes: {
    count: 3,
    SwitchDuration: 0.14,
  },
  player: {
    jumpDuration: 0.62,
    jumpHeight: 115,
    slideDuration: 0.65,
  },
  difficulty: {
    initialSpeed: 320,
    maxSpeed: 820,
    speedAcceleration: 4.5,
    initialSpawnInterval: 1.45,
    minSpawnInterval: 0.62,
    coinSpawnChance: 0.78,
    doubleObstacleChanceStart: 0.15,
    doubleObstacleChanceMax: 0.65,
    scorePerMeter: 1,
    pointsPerCoin: 25,
  },
  developer: {
    studioName: "5tar Suraj",
    developerName: "Suraj Maurya",
    roleTitle: "Independent Game Developer & Digital Creator",
    socialLinks: {
      facebook: "https://www.facebook.com/share/1FDbbX2rcH/",
      instagram: "https://www.instagram.com/5tar.suraj?stkn=OWZjNXhyb2toanZk",
      youtube: "", // Empty configuration field as requested — do not invent a URL
      website: "", // Empty configuration field as requested — do not invent a URL
    },
  },
  storageKeys: {
    bestScore: "5tar_village_runner_best_score_v1",
    totalCoins: "5tar_village_runner_total_coins_v1",
    settings: "5tar_village_runner_settings_v1",
  },
};
