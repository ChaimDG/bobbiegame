const storageKey = 'bobbie-jump-progress';

const defaults = {
  width: 390,
  height: 720,
};

export function getJumpBest() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
    return Number.isFinite(saved.bestHeight) ? saved.bestHeight : 0;
  } catch {
    return 0;
  }
}

export function saveJumpBest(bestHeight) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify({ bestHeight }));
  } catch {
    // Local storage can be unavailable in private browser contexts.
  }
}

export function createJumpState(bestHeight = getJumpBest()) {
  const view = { ...defaults };
  const state = {
    status: 'playing',
    paused: false,
    time: 0,
    view,
    bestHeight,
    height: 0,
    runBones: 0,
    combo: 0,
    peakCombo: 0,
    player: {
      x: view.width * 0.5,
      y: view.height - 138,
      width: 70,
      height: 65,
      vx: 0,
      vy: -680,
      facing: 1,
      rotation: 0,
      squash: 0,
      bounceFlash: 0,
    },
    platforms: [],
    particles: [],
    popups: [],
    cameraDrift: 0,
    shake: 0,
    nextPlatformId: 1,
  };

  seedPlatforms(state);
  return state;
}

export function resizeJumpState(state, width, height) {
  const previousWidth = state.view.width || width;
  const scale = width / previousWidth;

  state.view.width = width;
  state.view.height = height;
  state.player.x = clamp(state.player.x * scale, -state.player.width, width + state.player.width);
  state.platforms.forEach((platform) => {
    platform.x = clamp(platform.x * scale, 10, width - platform.width - 10);
  });
}

export function updateJump(state, input, dt) {
  if (state.status !== 'playing' || state.paused) {
    return;
  }

  const { player, view } = state;
  state.time += dt;
  const previousBottom = player.y + player.height * 0.43;
  const direction = Number(Boolean(input.right)) - Number(Boolean(input.left));
  const steering = player.vy < 0 ? 1120 : 900;

  player.vx += direction * steering * dt;
  player.vx *= Math.pow(direction ? 0.93 : 0.82, dt * 60);
  player.vx = clamp(player.vx, -360, 360);
  player.vy += 1520 * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;
  player.squash = Math.max(0, player.squash - dt * 4.6);
  player.bounceFlash = Math.max(0, player.bounceFlash - dt * 2.4);
  state.shake = Math.max(0, state.shake - dt * 4.6);

  if (direction) {
    player.facing = direction;
  }

  player.rotation += (clamp(player.vx / 560 + player.vy / 2100, -0.42, 0.42) - player.rotation) * Math.min(1, dt * 8);

  if (player.x < -player.width * 0.25) {
    player.x = view.width + player.width * 0.1;
  }
  if (player.x > view.width + player.width * 0.25) {
    player.x = -player.width * 0.1;
  }

  collectBones(state);

  if (player.vy > 0) {
    const nextBottom = player.y + player.height * 0.43;
    for (const platform of state.platforms) {
      const overlaps = player.x + player.width * 0.32 > platform.x
        && player.x - player.width * 0.32 < platform.x + platform.width;
      const crossesTop = previousBottom <= platform.y && nextBottom >= platform.y;
      if (overlaps && crossesTop) {
        landOnPlatform(state, platform);
        break;
      }
    }
  }

  // Keep the dog in the lower-middle part of the screen while climbing.
  const cameraLine = view.height * 0.39;
  if (player.y < cameraLine && player.vy < 0) {
    const shift = cameraLine - player.y;
    player.y = cameraLine;
    state.platforms.forEach((platform) => {
      platform.y += shift;
    });
    state.particles.forEach((particle) => {
      particle.y += shift;
    });
    state.popups.forEach((popup) => {
      popup.y += shift;
    });
    state.height += shift * 0.135;
    state.cameraDrift += shift;
  }

  state.platforms = state.platforms.filter((platform) => platform.y < view.height + 105);
  while (state.platforms.length < 10) {
    addPlatformAbove(state);
  }

  updateEffects(state, dt);

  if (player.y > view.height + 96) {
    state.status = 'game-over';
    state.bestHeight = Math.max(state.bestHeight, Math.floor(state.height));
    saveJumpBest(state.bestHeight);
  }
}

function seedPlatforms(state) {
  const { width, height } = state.view;
  const startingWidth = Math.min(172, width * 0.47);
  state.platforms.push(makePlatform(state, width * 0.5 - startingWidth * 0.5, height - 58, startingWidth, 'meadow'));
  // The first few pads form a friendly visible route before procedural variety starts.
  state.platforms.push(makePlatform(state, width * 0.35, height - 155, 122, 'meadow', true));
  state.platforms.push(makePlatform(state, width * 0.44, height - 255, 132, 'meadow', true));
  state.platforms.push(makePlatform(state, width * 0.3, height - 358, 136, 'trampoline', true));
  state.platforms.push(makePlatform(state, width * 0.47, height - 478, 128, 'meadow', true));
  state.platforms.push(makePlatform(state, width * 0.25, height - 582, 130, 'meadow', true));
  state.platforms.push(makePlatform(state, width * 0.47, height - 694, 132, 'trampoline', true));
}

function addPlatformAbove(state) {
  const topPlatform = state.platforms.reduce((top, platform) => (platform.y < top.y ? platform : top));
  const difficulty = Math.min(1, state.height / 1250);
  const width = randomBetween(94 - difficulty * 13, 132 - difficulty * 18);
  const gap = randomBetween(82, 99 + difficulty * 15);
  const trampoline = state.height > 100 && Math.random() < 0.16 + difficulty * 0.08;
  const center = topPlatform.x + topPlatform.width * 0.5;
  const maxStride = 83 + difficulty * 23;
  const nextCenter = clamp(
    center + randomBetween(-maxStride, maxStride),
    width * 0.5 + 14,
    state.view.width - width * 0.5 - 14,
  );
  const x = nextCenter - width * 0.5;
  state.platforms.push(makePlatform(state, x, topPlatform.y - gap, width, trampoline ? 'trampoline' : 'meadow', Math.random() < 0.68));
}

function makePlatform(state, x, y, width, type, hasBone = false) {
  return {
    id: state.nextPlatformId++,
    x,
    y,
    width,
    type,
    hasBone,
    boneCollected: false,
    bobPhase: Math.random() * Math.PI * 2,
  };
}

function landOnPlatform(state, platform) {
  const { player } = state;
  player.y = platform.y - player.height * 0.43;
  player.squash = platform.type === 'trampoline' ? 1 : 0.72;
  player.bounceFlash = 1;
  const bounceVelocity = platform.type === 'trampoline' ? -885 : -705;
  player.vy = bounceVelocity;
  state.combo += 1;
  state.peakCombo = Math.max(state.peakCombo, state.combo);

  const color = platform.type === 'trampoline' ? '#ff9b51' : '#f8df7a';
  addParticles(state, player.x, platform.y - 5, color, platform.type === 'trampoline' ? 16 : 9, 1);
  if (platform.type === 'trampoline') {
    state.shake = 0.26;
    state.popups.push({ x: player.x, y: platform.y - 35, text: 'SUPER BOUNCE!', color: '#fff1a1', life: 1 });
  } else if (state.combo > 1 && state.combo % 8 === 0) {
    state.popups.push({ x: player.x, y: platform.y - 28, text: `BOUNCE x${state.combo}`, color: '#fff7b6', life: 1 });
  }
}

function collectBones(state) {
  const { player } = state;
  for (const platform of state.platforms) {
    if (!platform.hasBone || platform.boneCollected) {
      continue;
    }
    const boneX = platform.x + platform.width * 0.5;
    const boneY = platform.y - 30;
    if (Math.hypot(player.x - boneX, player.y - boneY) < 38) {
      platform.boneCollected = true;
      state.runBones += 1;
      state.popups.push({ x: boneX, y: boneY - 3, text: '+1', color: '#fff5b2', life: 1 });
      addParticles(state, boneX, boneY, '#ffdf62', 12, 0.88);
    }
  }
}

function updateEffects(state, dt) {
  state.particles.forEach((particle) => {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 720 * dt;
    particle.life -= dt * 1.65;
  });
  state.particles = state.particles.filter((particle) => particle.life > 0);

  state.popups.forEach((popup) => {
    popup.y -= 42 * dt;
    popup.life -= dt * 1.18;
  });
  state.popups = state.popups.filter((popup) => popup.life > 0);
}

function addParticles(state, x, y, color, amount, energy) {
  for (let index = 0; index < amount; index += 1) {
    const angle = randomBetween(Math.PI * 1.08, Math.PI * 1.92);
    const speed = randomBetween(66, 178) * energy;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: randomBetween(2.5, 6.5) * energy,
      color,
      life: randomBetween(0.45, 0.9),
    });
  }
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
