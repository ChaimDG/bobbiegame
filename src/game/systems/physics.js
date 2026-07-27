const gravity = 780;
const diveGravity = 2350;
const airDrag = 0.9995;
const groundDrag = 1;
const minSpeed = 160;
const maxSpeed = 1280;

export function updatePhysics(state, input, dt, playCue) {
  const player = state.player;
  const terrain = state.terrain;
  const previousVy = player.vy;

  if (input.justPressed) {
    playCue('dive');
  }

  if (player.grounded) {
    const slope = terrain.getSlope(player.x);
    const downhill = Math.max(0, slope);
    const uphill = Math.max(0, -slope);
    const diveGrip = input.pressed ? 2.8 : 1.1;
    player.vx += downhill * 2250 * diveGrip * dt;
    player.vx += uphill * player.vx * 0.42 * dt;

    if (input.pressed) {
      player.vx += 120 * dt;
    }

    player.vx *= groundDrag;
    player.vy = slope * player.vx;
    player.x += player.vx * dt;
    player.y = terrain.getY(player.x) - player.radius;

    if (input.justReleased || (!input.pressed && slope < -0.12 && player.vx > 260)) {
      launchPlayer(player, slope);
      playCue('jump');
    }
  } else {
    const gravityForce = input.pressed ? diveGravity : gravity;
    player.vy += gravityForce * dt;

    player.x += player.vx * dt;
    player.y += player.vy * dt;
    player.vx *= airDrag;

    const groundY = terrain.getY(player.x) - player.radius;
    if (player.y >= groundY) {
      landPlayer(state, previousVy, playCue);
    } else {
      player.state = input.pressed ? 'dive' : 'fly';
    }
  }

  player.vx = clamp(player.vx, minSpeed, maxSpeed);
  const targetRotation = player.grounded
    ? Math.atan(terrain.getSlope(player.x))
    : Math.atan2(player.vy, Math.max(180, player.vx));
  player.rotation += (targetRotation - player.rotation) * 0.16;
  updateVisualPosition(player, dt);
}

function launchPlayer(player, slope) {
  const slopeLift = Math.max(230, Math.abs(slope) * player.vx * 0.9);
  const speedLift = player.vx * 0.52;
  player.grounded = false;
  player.vx = Math.min(maxSpeed, player.vx * 1.05);
  player.vy = -Math.max(slopeLift, speedLift);
  player.state = 'fly';
  player.stateTimer = 0.22;
}

function landPlayer(state, previousVy, playCue) {
  const player = state.player;
  const terrain = state.terrain;
  const slope = terrain.getSlope(player.x);
  const groundY = terrain.getY(player.x) - player.radius;
  const landingAngle = Math.atan2(previousVy, Math.max(180, player.vx));
  const slopeAngle = Math.atan(slope);
  const alignment = Math.abs(landingAngle - slopeAngle);
  const downwardSlope = slope > 0.12;
  const softEnough = previousVy > -80;
  const perfect = downwardSlope && alignment < 0.34 && softEnough;
  const decent = downwardSlope && alignment < 0.68;

  player.y = groundY;
  player.grounded = true;

  if (perfect) {
    player.vx *= 1.34;
    player.vy = slope * player.vx;
    player.state = 'perfect';
    player.perfectTimer = 0.5;
    player.boostTimer = 0.45;
    state.effects.shake = 0.07;
    burstParticles(state, '#ffe866', 20);
    playCue('perfect');
  } else if (decent) {
    player.vx *= 1.2;
    player.vy = slope * player.vx;
    player.state = 'land';
    player.stateTimer = 0.28;
    burstParticles(state, '#fff0b0', 10);
    playCue('land');
  } else {
    player.vx *= previousVy > 900 ? 0.86 : 0.96;
    player.vy = slope * player.vx;
    player.state = previousVy > 780 ? 'hard-land' : 'stumble';
    player.stumbleTimer = 0.45;
    state.effects.shake = previousVy > 780 ? 0.3 : 0.14;
    burstParticles(state, '#8bcf5a', 14);
    playCue('badLand');
  }
}

function updateVisualPosition(player, dt) {
  if (player.visualY === undefined) {
    player.visualY = player.y;
  }

  const smoothing = player.grounded ? 1 - Math.exp(-dt * 13) : 1 - Math.exp(-dt * 22);
  player.visualY += (player.y - player.visualY) * smoothing;

  if (!player.grounded || Math.abs(player.y - player.visualY) < 0.5) {
    player.visualY = player.y;
  }
}

function burstParticles(state, color, count) {
  for (let i = 0; i < count; i += 1) {
    state.particles.push({
      x: state.player.x,
      y: state.player.y + state.player.radius,
      vx: -80 + Math.random() * 160,
      vy: -240 - Math.random() * 180,
      size: 4 + Math.random() * 6,
      color,
      life: 0.35 + Math.random() * 0.35,
    });
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
