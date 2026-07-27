import { defensePath, enemyTypes, towerTypes, waves } from './level.js';

let nextId = 1;

export function createDefenseState() {
  return {
    status: 'ready',
    lives: 18,
    coins: 150,
    waveIndex: 0,
    selectedTower: 'tennis',
    message: 'Place towers, then start the wave.',
    paused: false,
    towers: [],
    enemies: [],
    projectiles: [],
    popups: [],
    bursts: [],
    spawnQueue: [],
    spawnTimer: 0,
    defeated: 0,
    coinsEarned: 0,
    invalidFlash: 0,
    placementPreview: null,
  };
}

export function startWave(state) {
  if (state.status === 'won' || state.status === 'lost' || state.spawnQueue.length > 0 || state.enemies.length > 0) {
    return state;
  }

  const wave = waves[state.waveIndex];
  if (!wave) {
    return { ...state, status: 'won', message: 'Yard defended!' };
  }

  const queue = [];
  for (let i = 0; i < wave.toy; i += 1) {
    queue.push('toy');
  }
  for (let i = 0; i < wave.package; i += 1) {
    queue.splice(Math.min(queue.length, i * 3 + 2), 0, 'package');
  }

  return {
    ...state,
    status: 'wave',
    paused: false,
    spawnQueue: queue,
    spawnTimer: 0,
    message: `Wave ${state.waveIndex + 1} incoming!`,
  };
}

export function togglePause(state) {
  if (state.status !== 'wave') {
    return state;
  }

  const paused = !state.paused;
  return {
    ...state,
    paused,
    message: paused ? 'Wave paused.' : 'Defend the yard!',
  };
}

export function selectTower(state, towerId) {
  return {
    ...state,
    selectedTower: towerId,
    message: `${towerTypes[towerId].name} selected.`,
  };
}

export function placeTower(state, point, field) {
  const tower = towerTypes[state.selectedTower];
  const validation = validatePlacement(state, point, field, tower);
  if (!validation.valid) {
    return {
      ...state,
      invalidFlash: 0.28,
      message: validation.reason,
    };
  }

  return {
    ...state,
    coins: state.coins - tower.price,
    towers: [
      ...state.towers,
      {
        id: nextId++,
        type: tower.id,
        x: point.x,
        y: point.y,
        cooldown: 0,
        level: 1,
      },
    ],
    placementPreview: null,
    message: `${tower.name} placed.`,
  };
}

export function upgradeTower(state, towerId) {
  const tower = state.towers.find((item) => item.id === towerId);
  if (!tower || tower.level >= 2) {
    return state;
  }

  const cost = Math.floor(towerTypes[tower.type].price * 0.75);
  if (state.coins < cost) {
    return { ...state, message: 'Not enough biscuits for upgrade.' };
  }

  return {
    ...state,
    coins: state.coins - cost,
    towers: state.towers.map((item) =>
      item.id === towerId ? { ...item, level: item.level + 1, cooldown: 0 } : item,
    ),
    message: 'Tower upgraded!',
  };
}

export function updateDefense(state, dt, field) {
  if (state.status !== 'wave' || state.paused) {
    return decayEffects(state, dt);
  }

  let next = {
    ...state,
    towers: state.towers.map((tower) => ({ ...tower, cooldown: Math.max(0, tower.cooldown - dt) })),
    enemies: state.enemies.map((enemy) => advanceEnemy(enemy, dt, field)),
    projectiles: state.projectiles.map((projectile) => moveProjectile(projectile, dt)),
    popups: state.popups.map((popup) => ({ ...popup, y: popup.y - dt * 24, life: popup.life - dt })),
    bursts: state.bursts.map((burst) => ({ ...burst, life: burst.life - dt })),
    spawnTimer: state.spawnTimer - dt,
    invalidFlash: Math.max(0, state.invalidFlash - dt),
  };

  next = handleFinishedEnemies(next);
  next = spawnEnemies(next, field);
  next = fireTowers(next, field);
  next = resolveProjectiles(next, dt);

  if (next.lives <= 0) {
    return { ...next, status: 'lost', message: 'The toys got through.' };
  }

  if (next.spawnQueue.length === 0 && next.enemies.length === 0) {
    const nextWave = next.waveIndex + 1;
    if (nextWave >= waves.length) {
      return { ...next, status: 'won', message: 'Yard defended!' };
    }

    return {
      ...next,
      status: 'ready',
      waveIndex: nextWave,
      coins: next.coins + 45,
      message: `Wave ${nextWave} cleared! Bonus biscuits earned.`,
    };
  }

  return decayEffects(next, dt);
}

export function getPathPoint(progress, field) {
  const points = getFieldPath(field);
  const segments = getSegments(points);
  const totalLength = segments.reduce((total, segment) => total + segment.length, 0);
  let distance = progress * totalLength;

  for (const segment of segments) {
    if (distance <= segment.length) {
      const t = distance / segment.length;
      return {
        x: segment.start.x + (segment.end.x - segment.start.x) * t,
        y: segment.start.y + (segment.end.y - segment.start.y) * t,
        angle: Math.atan2(segment.end.y - segment.start.y, segment.end.x - segment.start.x),
      };
    }
    distance -= segment.length;
  }

  const last = points[points.length - 1];
  return { x: last.x, y: last.y, angle: 0 };
}

export function validatePlacement(state, point, field, tower = towerTypes[state.selectedTower]) {
  if (state.coins < tower.price) {
    return { valid: false, reason: 'Not enough biscuits.' };
  }

  if (distanceToPath(point, field) < 44) {
    return { valid: false, reason: 'Keep towers off the path.' };
  }

  if (state.towers.some((item) => distance(item, point) < 48)) {
    return { valid: false, reason: 'Too close to another tower.' };
  }

  return { valid: true, reason: 'Place tower here.' };
}

function spawnEnemies(state, field) {
  const wave = waves[state.waveIndex];
  if (state.spawnQueue.length === 0 || state.spawnTimer > 0) {
    return state;
  }

  const [type, ...rest] = state.spawnQueue;
  const enemy = enemyTypes[type];
  return {
    ...state,
    spawnQueue: rest,
    spawnTimer: wave.interval,
    enemies: [
      ...state.enemies,
      {
        id: nextId++,
        type,
        progress: 0,
        hp: enemy.hp + state.waveIndex * 12,
        maxHp: enemy.hp + state.waveIndex * 12,
        speed: enemy.speed + state.waveIndex * 5,
        reward: enemy.reward,
        hitFlash: 0,
        ...getPathPoint(0, field),
      },
    ],
  };
}

function advanceEnemy(enemy, dt, field) {
  const point = getPathPoint(enemy.progress, field);
  const slowTimer = Math.max(0, (enemy.slowTimer || 0) - dt);
  const speedMultiplier = slowTimer > 0 ? 0.68 : 1;
  return {
    ...enemy,
    ...point,
    progress: enemy.progress + (enemy.speed * speedMultiplier * dt) / getPathLength(field),
    hitFlash: Math.max(0, enemy.hitFlash - dt * 5),
    slowTimer,
  };
}

function handleFinishedEnemies(state) {
  const escaped = state.enemies.filter((enemy) => enemy.progress >= 1);
  if (escaped.length === 0) {
    return state;
  }

  return {
    ...state,
    lives: Math.max(0, state.lives - escaped.length),
    enemies: state.enemies.filter((enemy) => enemy.progress < 1),
    message: 'A troublemaker got through!',
  };
}

function fireTowers(state) {
  const projectiles = [...state.projectiles];
  const towers = state.towers.map((tower) => {
    if (tower.cooldown > 0) {
      return tower;
    }

    const stats = towerTypes[tower.type];
    const target = state.enemies
      .filter((enemy) => distance(tower, enemy) <= stats.range)
      .sort((a, b) => b.progress - a.progress)[0];

    if (!target) {
      return tower;
    }

    const levelBoost = 1 + (tower.level - 1) * 0.35;
    projectiles.push({
      id: nextId++,
      towerType: tower.type,
      targetId: target.id,
      x: tower.x,
      y: tower.y,
      damage: stats.damage * levelBoost,
      speed: stats.projectileSpeed,
      color: stats.color,
    });

    return {
      ...tower,
      cooldown: stats.fireRate / levelBoost,
    };
  });

  return { ...state, towers, projectiles };
}

function moveProjectile(projectile, dt) {
  return {
    ...projectile,
    x: projectile.x,
    y: projectile.y,
    life: (projectile.life || 2) - dt,
  };
}

function resolveProjectiles(state, dt) {
  const enemies = state.enemies.map((enemy) => ({ ...enemy }));
  const projectiles = [];
  let coins = state.coins;
  let defeated = state.defeated;
  let coinsEarned = state.coinsEarned;
  const popups = state.popups.filter((popup) => popup.life > 0);
  const bursts = state.bursts.filter((burst) => burst.life > 0);

  for (const projectile of state.projectiles) {
    const target = enemies.find((enemy) => enemy.id === projectile.targetId);
    if (!target || projectile.life <= 0) {
      continue;
    }

    const dx = target.x - projectile.x;
    const dy = target.y - projectile.y;
    const dist = Math.hypot(dx, dy);
    const step = projectile.speed * dt;
    if (dist <= Math.max(12, step)) {
      const impacted = projectile.towerType === 'treat'
        ? enemies.filter((enemy) => distance(enemy, target) < 42)
        : [target];

      bursts.push({
        id: nextId++,
        x: target.x,
        y: target.y,
        type: projectile.towerType,
        life: 0.34,
        maxLife: 0.34,
      });

      for (const enemy of impacted) {
        const damage = enemy.id === target.id ? projectile.damage : projectile.damage * 0.58;
        enemy.hp -= damage;
        enemy.hitFlash = 1;

        if (projectile.towerType === 'tennis') {
          enemy.progress = Math.max(0, enemy.progress - 0.012);
        }
        if (projectile.towerType === 'bark') {
          enemy.slowTimer = Math.max(enemy.slowTimer || 0, 0.62);
        }

        if (enemy.hp <= 0 && !enemy.dead) {
          enemy.dead = true;
          coins += enemy.reward;
          coinsEarned += enemy.reward;
          defeated += 1;
          popups.push({
            id: nextId++,
            x: enemy.x,
            y: enemy.y,
            text: `+${enemy.reward}`,
            life: 0.8,
          });
        }
      }
      continue;
    }

    projectiles.push({
      ...projectile,
      x: projectile.x + (dx / dist) * step,
      y: projectile.y + (dy / dist) * step,
    });
  }

  return {
    ...state,
    coins,
    coinsEarned,
    defeated,
    enemies: enemies.filter((enemy) => !enemy.dead),
    projectiles,
    popups,
    bursts,
  };
}

function decayEffects(state, dt) {
  return {
    ...state,
    invalidFlash: Math.max(0, state.invalidFlash - dt),
    popups: state.popups
      .map((popup) => ({ ...popup, y: popup.y - dt * 24, life: popup.life - dt }))
      .filter((popup) => popup.life > 0),
    bursts: state.bursts
      .map((burst) => ({ ...burst, life: burst.life - dt }))
      .filter((burst) => burst.life > 0),
  };
}

function getPathLength(field) {
  return getSegments(getFieldPath(field)).reduce((total, segment) => total + segment.length, 0);
}

function getSegments(points) {
  return points.slice(0, -1).map((start, index) => {
    const end = points[index + 1];
    return {
      start,
      end,
      length: distance(start, end),
    };
  });
}

function distanceToPath(point, field) {
  const points = getFieldPath(field);

  return Math.min(
    ...getSegments(points).map((segment) => distanceToSegment(point, segment.start, segment.end)),
  );
}

function getFieldPath(field) {
  const controls = defensePath.map((point) => ({
    x: point.x * field.width,
    y: point.y * field.height,
  }));
  return sampleSmoothPath(controls);
}

// A sampled cardinal spline keeps the route soft while its collision math stays predictable.
function sampleSmoothPath(points) {
  const samples = [];
  const steps = 9;

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[Math.max(0, index - 1)];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[Math.min(points.length - 1, index + 2)];

    for (let step = 0; step < steps; step += 1) {
      const t = step / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      samples.push({
        x: 0.5 * (
          (2 * p1.x)
          + (-p0.x + p2.x) * t
          + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2
          + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
        ),
        y: 0.5 * (
          (2 * p1.y)
          + (-p0.y + p2.y) * t
          + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2
          + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
        ),
      });
    }
  }

  samples.push(points[points.length - 1]);
  return samples;
}

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSq = dx * dx + dy * dy;
  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSq));
  return distance(point, {
    x: start.x + dx * t,
    y: start.y + dy * t,
  });
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
