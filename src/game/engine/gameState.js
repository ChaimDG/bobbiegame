import { updateCamera } from '../systems/camera.js';
import { updateCollectibles } from '../systems/collectibles.js';
import { updatePhysics } from '../systems/physics.js';
import { createTerrain } from '../systems/terrain.js';
import { saveBestDistance } from '../systems/storage.js';

export function createBobbieWingsState(bestDistance = 0) {
  const terrain = createTerrain(9241);
  const startX = 80;
  const startY = terrain.getY(startX) - 36;

  return {
    status: 'playing',
    paused: false,
    time: 0,
    distance: 0,
    bestDistance,
    terrain,
    view: {
      width: 390,
      height: 720,
    },
    camera: {
      x: 0,
      y: 0,
      zoom: 1,
    },
    player: {
      x: startX,
      y: startY,
      visualY: startY,
      vx: 680,
      vy: 0,
      radius: 24,
      rotation: 0,
      grounded: true,
      dive: false,
      state: 'run',
      stateTimer: 0,
      slowTimer: 0,
      perfectTimer: 0,
      stumbleTimer: 0,
      boostTimer: 0,
    },
    score: {
      bones: 0,
      topSpeed: 680,
    },
    collectibles: [],
    particles: [],
    speedLines: [],
    effects: {
      shake: 0,
    },
    meta: {
      nextBoneX: 520,
      themeIndex: 0,
    },
  };
}

export function updateBobbieWings(state, input, dt, playCue) {
  state.time += dt;
  state.player.dive = input.pressed;
  state.distance = Math.max(0, (state.player.x - 80) / 10);

  updatePhysics(state, input, dt, playCue);
  updateCollectibles(state, dt, playCue);
  updateCamera(state, dt);
  updateEffects(state, dt);

  state.score.topSpeed = Math.max(state.score.topSpeed, state.player.vx);
  if (state.player.vx < 150 && state.player.grounded) {
    state.player.slowTimer += dt;
  } else {
    state.player.slowTimer = Math.max(0, state.player.slowTimer - dt * 0.8);
  }

  if (state.player.slowTimer > 5 || state.time > 140) {
    state.status = 'game-over';
    state.bestDistance = Math.max(state.bestDistance, state.distance);
    saveBestDistance(state.bestDistance);
  }
}

function updateEffects(state, dt) {
  state.effects.shake = Math.max(0, state.effects.shake - dt * 2.8);
  state.player.stateTimer = Math.max(0, state.player.stateTimer - dt);
  state.player.perfectTimer = Math.max(0, state.player.perfectTimer - dt);
  state.player.stumbleTimer = Math.max(0, state.player.stumbleTimer - dt);
  state.player.boostTimer = Math.max(0, state.player.boostTimer - dt);

  state.particles = state.particles
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx * dt,
      y: particle.y + particle.vy * dt,
      vy: particle.vy + 420 * dt,
      life: particle.life - dt,
    }))
    .filter((particle) => particle.life > 0);

  state.speedLines = state.speedLines
    .map((line) => ({
      ...line,
      x: line.x - line.speed * dt,
      life: line.life - dt,
    }))
    .filter((line) => line.life > 0);

  if (state.player.vx > 470 && state.time % 0.07 < dt) {
    state.speedLines.push({
      x: state.player.x + 70,
      y: state.player.y + (Math.random() - 0.5) * 70,
      length: 35 + Math.random() * 42,
      speed: 420 + Math.random() * 160,
      life: 0.35,
    });
  }
}
