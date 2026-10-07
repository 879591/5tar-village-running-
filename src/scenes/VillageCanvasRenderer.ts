/**
 * HTML5 Canvas 2.5D Village & Character Renderer
 * Renders the original Indian village environment, 6 original obstacles, coins, particles, and the runner character.
 * Optimized for low-end Android & desktop browsers with zero external texture dependencies.
 */

import { OBSTACLE_SPECS } from '../assets/villageArtwork';
import {
  CoinEntity,
  SceneryProp,
  ObstacleEntity,
  PLAYER_Z,
  RunnerSimulation,
  SPAWN_Z,
} from '../scripts/gameEngine';

export interface ProjectedPoint {
  x: number;
  y: number;
  scale: number;
}

export class VillageCanvasRenderer {
  /**
   * Projects 3D lane coordinates (lane: -1..1, yOffset: height, z: depth) onto 2D Canvas coordinates
   */
  public static project(
    lane: number,
    yOffset: number,
    z: number,
    width: number,
    height: number
  ): ProjectedPoint {
    const horizonY = height * 0.34;
    const groundBottomY = height * 0.92;
    const cameraDepth = 260;

    const clampedZ = Math.max(10, z);
    const scale = cameraDepth / (cameraDepth + clampedZ - PLAYER_Z);

    // Road half-width at player Z
    const baseRoadHalfWidth = Math.min(width * 0.42, 260);
    const laneWorldX = lane * (baseRoadHalfWidth * 0.64);

    const screenX = width * 0.5 + laneWorldX * scale;
    const screenGroundY = horizonY + (groundBottomY - horizonY) * scale;
    const screenY = screenGroundY - yOffset * scale;

    return {
      x: screenX,
      y: screenY,
      scale,
    };
  }

  public static renderFrame(
    ctx: CanvasRenderingContext2D,
    sim: RunnerSimulation,
    width: number,
    height: number
  ): void {
    const horizonY = height * 0.34;
    const zone = sim.getCurrentZone();

    // 1. Sky Gradient (Warm Indian Golden Hour / Daylight Sky)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#0284c7');
    skyGrad.addColorStop(0.65, '#38bdf8');
    skyGrad.addColorStop(1, '#fde68a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY + 2);

    // Warm Sun on the Horizon
    const sunRadius = Math.min(width, height) * 0.075;
    const sunX = width * 0.76;
    const sunY = horizonY * 0.48;
    ctx.save();
    ctx.fillStyle = 'rgba(254, 240, 138, 0.28)';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius * 1.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Soft Distant Village Hills & Temple/Tree Silhouette on Horizon
    ctx.fillStyle = '#0f766e';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.quadraticCurveTo(width * 0.2, horizonY - 28, width * 0.45, horizonY - 8);
    ctx.quadraticCurveTo(width * 0.75, horizonY - 34, width, horizonY);
    ctx.closePath();
    ctx.fill();

    // 2. Ground Fields (Left & Right of Village Road)
    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    groundGrad.addColorStop(0, zone.groundLeftColor);
    groundGrad.addColorStop(1, zone.groundRightColor);
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // 3. Perspective Village Road Trapezoid
    const farLeft = this.project(-1.55, 0, SPAWN_Z, width, height);
    const farRight = this.project(1.55, 0, SPAWN_Z, width, height);
    const nearLeft = this.project(-1.55, 0, 15, width, height);
    const nearRight = this.project(1.55, 0, 15, width, height);

    // Road shoulder / border
    ctx.fillStyle = zone.roadBorderColor;
    ctx.beginPath();
    ctx.moveTo(farLeft.x - 4, farLeft.y);
    ctx.lineTo(farRight.x + 4, farRight.y);
    ctx.lineTo(nearRight.x + 28, nearRight.y);
    ctx.lineTo(nearLeft.x - 28, nearLeft.y);
    ctx.closePath();
    ctx.fill();

    // Main village road surface
    ctx.fillStyle = zone.roadColor;
    ctx.beginPath();
    ctx.moveTo(farLeft.x, farLeft.y);
    ctx.lineTo(farRight.x, farRight.y);
    ctx.lineTo(nearRight.x, nearRight.y);
    ctx.lineTo(nearLeft.x, nearLeft.y);
    ctx.closePath();
    ctx.fill();

    // Animated perspective road segments & lane dividers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 2;
    for (const laneDivider of [-0.5, 0.5]) {
      for (let z = 40 + (120 - sim.roadStripeOffset); z < SPAWN_Z; z += 120) {
        const p1 = this.project(laneDivider, 0, z, width, height);
        const p2 = this.project(laneDivider, 0, z + 55, width, height);
        ctx.lineWidth = Math.max(1, 3 * p1.scale);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }

    // 4. Sort and Draw Scenery, Coins, and Obstacles back-to-front (Painter's Algorithm)
    type RenderItem =
      | { type: 'SCENERY'; z: number; data: SceneryProp }
      | { type: 'COIN'; z: number; data: CoinEntity }
      | { type: 'OBSTACLE'; z: number; data: ObstacleEntity }
      | { type: 'PLAYER'; z: number };

    const renderQueue: RenderItem[] = [{ type: 'PLAYER', z: PLAYER_Z }];

    for (const s of sim.sceneryPool) {
      if (s.active) renderQueue.push({ type: 'SCENERY', z: s.z, data: s });
    }
    for (const c of sim.coinPool) {
      if (c.active) renderQueue.push({ type: 'COIN', z: c.z, data: c });
    }
    for (const o of sim.obstacles) {
      if (o.active) renderQueue.push({ type: 'OBSTACLE', z: o.z, data: o });
    }

    renderQueue.sort((a, b) => b.z - a.z);

    for (const item of renderQueue) {
      if (item.type === 'SCENERY') {
        this.drawSceneryProp(ctx, item.data, width, height);
      } else if (item.type === 'COIN') {
        this.drawCoin(ctx, item.data, width, height);
      } else if (item.type === 'OBSTACLE') {
        this.drawObstacle(ctx, item.data, width, height);
      } else if (item.type === 'PLAYER') {
        this.drawPlayer(ctx, sim, width, height);
      }
    }

    // 5. Draw Coin Pickup Particles on Top
    for (const p of sim.particles) {
      if (!p.active) continue;
      const alpha = Math.max(0, 1 - p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      if (p.label) {
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.fillStyle = '#fef08a';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.strokeText(p.label, p.x - 14, p.y - 10);
        ctx.fillText(p.label, p.x - 14, p.y - 10);
      }
      ctx.restore();
    }
  }

  private static drawSceneryProp(
    ctx: CanvasRenderingContext2D,
    prop: SceneryProp,
    width: number,
    height: number
  ): void {
    const laneCoord = prop.side * (1.85 + prop.xOffset / 120);
    const pt = this.project(laneCoord, 0, prop.z, width, height);
    const s = pt.scale * prop.scale;
    if (s <= 0.04) return;

    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.scale(s, s);

    switch (prop.propType) {
      case 'BANYAN_TREE': {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 42, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        // Trunk
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-10, -75, 20, 75);
        // Lush layered canopy
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.arc(0, -95, 48, 0, Math.PI * 2);
        ctx.arc(-32, -78, 34, 0, Math.PI * 2);
        ctx.arc(32, -78, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(0, -102, 38, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'PALM_TREE': {
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(-7, 0);
        ctx.quadraticCurveTo(4, -60, -2, -115);
        ctx.lineTo(6, -115);
        ctx.quadraticCurveTo(12, -60, 7, 0);
        ctx.fill();
        // Palm fronds
        ctx.fillStyle = '#15803d';
        for (const angle of [-2.2, -1.4, -0.5, 0.5, 1.4, 2.2]) {
          ctx.save();
          ctx.translate(2, -115);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(0, -26, 8, 28, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        break;
      }
      case 'MUD_HOUSE': {
        // Traditional Indian village mud house with thatched roof
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-48, -68, 96, 68);
        // White folk rangoli/lime border pattern
        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 2;
        ctx.strokeRect(-42, -60, 84, 54);
        // Wooden door
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-12, -42, 24, 42);
        // Thatched / Terracotta pitched roof
        ctx.fillStyle = '#9a3412';
        ctx.beginPath();
        ctx.moveTo(-60, -65);
        ctx.lineTo(0, -110);
        ctx.lineTo(60, -65);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'MARKET_STALL': {
        // Bamboo poles
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-38, -75, 5, 75);
        ctx.fillRect(33, -75, 5, 75);
        // Counter
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-40, -32, 80, 32);
        // Festive striped canopy
        ctx.fillStyle = '#db2777';
        ctx.beginPath();
        ctx.moveTo(-46, -75);
        ctx.lineTo(46, -75);
        ctx.lineTo(36, -98);
        ctx.lineTo(-36, -98);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'HAYSTACK': {
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(0, 0, 38, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.moveTo(-38, 0);
        ctx.lineTo(0, -56);
        ctx.lineTo(38, 0);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'BRIDGE_PILLAR': {
        ctx.fillStyle = '#e7e5e4';
        ctx.fillRect(-14, -55, 28, 55);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(-16, -64, 32, 10);
        break;
      }
      case 'MUSTARD_PATCH': {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(-15, -8, 12, 0, Math.PI * 2);
        ctx.arc(10, -10, 14, 0, Math.PI * 2);
        ctx.arc(0, -16, 11, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }

    ctx.restore();
  }

  private static drawCoin(
    ctx: CanvasRenderingContext2D,
    coin: CoinEntity,
    width: number,
    height: number
  ): void {
    const pt = this.project(coin.lane, coin.yOffset + 24, coin.z, width, height);
    const groundPt = this.project(coin.lane, 0, coin.z, width, height);
    const s = pt.scale;
    if (s <= 0.04) return;

    ctx.save();
    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(groundPt.x, groundPt.y, 14 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spinning gold coin
    const horizSpin = Math.max(0.28, Math.abs(Math.cos(coin.rotation)));
    ctx.translate(pt.x, pt.y);
    ctx.scale(s * horizSpin, s);

    // Outer Gold Rim
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();

    // Inner Bright Gold Face
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();

    // Star / Diamond emblem in center
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(6, 0);
    ctx.lineTo(0, 8);
    ctx.lineTo(-6, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private static drawObstacle(
    ctx: CanvasRenderingContext2D,
    obs: ObstacleEntity,
    width: number,
    height: number
  ): void {
    const pt = this.project(obs.lane, 0, obs.z, width, height);
    const s = pt.scale;
    if (s <= 0.04) return;

    const spec = OBSTACLE_SPECS[obs.kind];

    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.scale(s, s);

    // Base shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 44, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    switch (obs.kind) {
      case 'STONE_MOUND': {
        // Cluster of village boulders (Jump over)
        ctx.fillStyle = '#57534e';
        ctx.beginPath();
        ctx.arc(-18, -18, 22, Math.PI, 0);
        ctx.arc(16, -16, 20, Math.PI, 0);
        ctx.arc(0, -28, 26, Math.PI, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#78716c';
        ctx.beginPath();
        ctx.arc(-4, -26, 18, Math.PI, 0);
        ctx.fill();

        // Subtle moss/highlight badge indicating low jumpable obstacle
        ctx.strokeStyle = '#a8a29e';
        ctx.lineWidth = 2;
        ctx.stroke();
        break;
      }

      case 'MUD_PUDDLE': {
        // Glossy monsoon puddle with stones (Jump over)
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.ellipse(0, -4, 46, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.ellipse(-12, -7, 18, 5, -0.1, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'HAY_BALE': {
        // Farm cylinder hay bale + terracotta clay matka pot (Jump over)
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-36, -42, 54, 42);
        ctx.strokeStyle = '#a16207';
        ctx.lineWidth = 3;
        ctx.strokeRect(-36, -42, 54, 42);
        // Terracotta pot next to bale
        ctx.fillStyle = '#c2410c';
        ctx.beginPath();
        ctx.arc(24, -18, 18, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'WOODEN_BARRIER': {
        // High overhead wooden beam with open bottom gap for sliding under!
        // Side posts
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-44, -118, 10, 118);
        ctx.fillRect(34, -118, 10, 118);
        // Overhead warning plank (leaves bottom 56px open for SLIDE)
        ctx.fillStyle = '#f97316';
        ctx.fillRect(-48, -112, 96, 46);
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(-42, -98, 84, 18);
        // Downward chevron arrow cue for SLIDE
        ctx.fillStyle = '#9a3412';
        ctx.beginPath();
        ctx.moveTo(-12, -94);
        ctx.lineTo(12, -94);
        ctx.lineTo(0, -82);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'ROAD_BARRICADE': {
        // High overhead festive market banner / barrier (Slide under)
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-44, -120, 8, 120);
        ctx.fillRect(36, -120, 8, 120);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-46, -116, 92, 50);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-40, -104, 80, 26);
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.moveTo(-12, -98);
        ctx.lineTo(12, -98);
        ctx.lineTo(0, -84);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'BULLOCK_CART': {
        // Tall full-lane wooden village cart stacked with sacks (Must switch lanes)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-40, -96, 80, 76);
        // Grain sacks on top
        ctx.fillStyle = '#d6d3d1';
        ctx.beginPath();
        ctx.ellipse(-16, -98, 22, 16, 0, 0, Math.PI * 2);
        ctx.ellipse(16, -98, 22, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        // Spoked wooden wheels on left & right
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(-36, -24, 22, 0, Math.PI * 2);
        ctx.arc(36, -24, 22, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
    }

    // Subtle visual affordance border
    if (spec.heightType === 'LOW') {
      // Upward subtle highlight on low jumpable obstacles
      ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
      ctx.beginPath();
      ctx.moveTo(-8, -48);
      ctx.lineTo(8, -48);
      ctx.lineTo(0, -58);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Draws the Original Village Runner Character with 4 distinct animations:
   * RUNNING, JUMPING, SLIDING, CRASHED (Game Over)
   */
  private static drawPlayer(
    ctx: CanvasRenderingContext2D,
    sim: RunnerSimulation,
    width: number,
    height: number
  ): void {
    const groundPt = this.project(sim.visualLane, 0, PLAYER_Z, width, height);
    const playerPt = this.project(sim.visualLane, sim.playerY, PLAYER_Z, width, height);
    const s = playerPt.scale;

    ctx.save();

    // Dynamic Ground Shadow (shrinks slightly as player jumps higher)
    const shadowScale = Math.max(0.45, 1 - sim.playerY / 180);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(
      groundPt.x,
      groundPt.y,
      28 * s * shadowScale,
      10 * s * shadowScale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.translate(playerPt.x, playerPt.y);
    ctx.scale(s, s);

    const legSwing = Math.sin(sim.runAnimPhase) * 18;
    const armSwing = -Math.sin(sim.runAnimPhase) * 16;
    const bounce = Math.abs(Math.cos(sim.runAnimPhase)) * 5;

    if (sim.actionState === 'SLIDING') {
      // SLIDING ANIMATION — Low ducking slide under barriers
      ctx.translate(0, -6);
      // Legs stretched forward
      ctx.fillStyle = '#f8fafc'; // White dhoti/runner pants
      ctx.fillRect(-26, -18, 52, 16);
      // Torso leaned low
      ctx.fillStyle = '#0d9488'; // Vibrant teal kurta/vest
      ctx.beginPath();
      ctx.roundRect(-20, -42, 40, 28, 8);
      ctx.fill();
      // Flowing scarf
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-34, -38, 22, 8);
      // Head tucked low
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(4, -50, 14, 0, Math.PI * 2);
      ctx.fill();
      // Headband
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-10, -56, 28, 6);
    } else if (sim.actionState === 'CRASHED') {
      // FALLING / GAME OVER ANIMATION
      ctx.rotate(0.45);
      ctx.translate(0, -10);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-18, -26, 14, 26);
      ctx.fillRect(4, -26, 14, 26);
      ctx.fillStyle = '#0d9488';
      ctx.fillRect(-18, -64, 36, 40);
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(0, -78, 15, 0, Math.PI * 2);
      ctx.fill();
      // Dizzy star halo
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, -98, 22, 7, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // RUNNING OR JUMPING ANIMATION
      ctx.translate(0, -bounce);

      // Left & Right Legs
      ctx.fillStyle = '#f8fafc';
      const leftLegY = sim.actionState === 'JUMPING' ? -36 : -30 + legSwing * 0.5;
      const rightLegY = sim.actionState === 'JUMPING' ? -42 : -30 - legSwing * 0.5;

      ctx.beginPath();
      ctx.roundRect(-15, leftLegY, 12, 30, 5);
      ctx.roundRect(3, rightLegY, 12, 30, 5);
      ctx.fill();

      // Footwear (Mojari / Running shoes)
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-16, leftLegY + 24, 14, 7);
      ctx.fillRect(2, rightLegY + 24, 14, 7);

      // Torso (Original Indian Village Athlete Kurta Tunic)
      ctx.fillStyle = '#0d9488';
      ctx.beginPath();
      ctx.roundRect(-18, -74, 36, 46, 8);
      ctx.fill();

      // Golden vest trim
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-14, -70, 28, 38);

      // Flowing Golden Gamchha / Scarf waving in the wind
      const scarfWave = Math.sin(sim.runAnimPhase * 1.3) * 8;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-14, -72);
      ctx.quadraticCurveTo(-32, -66 + scarfWave, -38, -50 + scarfWave);
      ctx.lineTo(-28, -44 + scarfWave);
      ctx.quadraticCurveTo(-20, -58, -10, -64);
      ctx.closePath();
      ctx.fill();

      // Arms
      ctx.fillStyle = '#0f766e';
      const leftArmY = sim.actionState === 'JUMPING' ? -84 : -68 + armSwing * 0.4;
      const rightArmY = sim.actionState === 'JUMPING' ? -84 : -68 - armSwing * 0.4;
      ctx.beginPath();
      ctx.roundRect(-26, leftArmY, 9, 28, 4);
      ctx.roundRect(17, rightArmY, 9, 28, 4);
      ctx.fill();

      // Head & Hair
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(0, -90, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, -93, 15.5, Math.PI, 0);
      ctx.fill();

      // Energetic Golden Headband
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-15, -96, 30, 5);
    }

    ctx.restore();
  }
}
