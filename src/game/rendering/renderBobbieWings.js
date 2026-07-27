import bobbieDogUrl from '../../assets/bobbie-dog.png';
import { wingsSprites } from '../wingsAssets.js';

const bobbieSprite = new Image();
bobbieSprite.src = bobbieDogUrl;

export function drawBobbieWings(context, state) {
  const { width, height } = state.view;
  const theme = state.terrain.getTheme(state.player.x);
  const shakeX = (Math.random() - 0.5) * state.effects.shake * 18;
  const shakeY = (Math.random() - 0.5) * state.effects.shake * 18;

  context.clearRect(0, 0, width, height);
  drawSky(context, state, theme);
  context.save();
  context.translate(shakeX, shakeY);
  context.scale(state.camera.zoom, state.camera.zoom);
  context.translate(-state.camera.x, -state.camera.y);
  drawDistantHills(context, state, theme);
  drawTerrain(context, state, theme);
  drawDecorations(context, state);
  drawCollectibles(context, state);
  drawSpeedLines(context, state);
  drawParticles(context, state);
  drawBobbie(context, state);
  context.restore();
  drawVignette(context, width, height);
}

function drawSky(context, state, theme) {
  const { width, height } = state.view;
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, theme.sky);
  gradient.addColorStop(0.55, '#dff7ff');
  gradient.addColorStop(1, '#f7edb5');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  if (wingsSprites.valley.complete && wingsSprites.valley.naturalWidth > 0) {
    drawCoverImage(context, wingsSprites.valley, width, height, state.camera.x * 0.018);
    context.fillStyle = 'rgba(255, 244, 183, 0.16)';
    context.fillRect(0, 0, width, height);
  } else {
    context.fillStyle = 'rgba(255, 245, 165, 0.95)';
    context.beginPath();
    context.arc(width * 0.14, height * 0.16, 48, 0, Math.PI * 2);
    context.fill();
  }

  for (let i = 0; i < 5; i += 1) {
    const x = ((i * 260 - state.camera.x * 0.16 + state.time * 9) % (width + 260)) - 130;
    const y = 88 + ((i * 53) % 140);
    drawCloud(context, x, y, 0.34 + (i % 3) * 0.08);
  }
  drawBirds(context, state, width, height);
}

function drawCoverImage(context, image, width, height, offset) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const viewRatio = width / height;
  let drawWidth;
  let drawHeight;

  if (viewRatio > imageRatio) {
    drawWidth = width;
    drawHeight = width / imageRatio;
  } else {
    drawHeight = height;
    drawWidth = height * imageRatio;
  }

  const overflow = Math.max(0, drawWidth - width);
  const x = -overflow / 2 - (offset % Math.max(1, overflow * 0.34));
  context.drawImage(image, x, (height - drawHeight) / 2, drawWidth, drawHeight);
}

function drawCloud(context, x, y, scale) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.fillStyle = 'rgba(255, 255, 255, 0.82)';
  context.beginPath();
  context.arc(-34, 5, 20, 0, Math.PI * 2);
  context.arc(-10, -8, 28, 0, Math.PI * 2);
  context.arc(21, -3, 23, 0, Math.PI * 2);
  context.arc(44, 8, 18, 0, Math.PI * 2);
  context.rect(-50, 5, 105, 24);
  context.fill();
  context.restore();
}

function drawBirds(context, state, width, height) {
  context.save();
  context.strokeStyle = 'rgba(70, 76, 76, 0.35)';
  context.lineWidth = 1.6;
  for (let i = 0; i < 3; i += 1) {
    const x = ((width * 0.62 + i * 92 - state.time * (9 + i * 2)) % (width + 80)) - 40;
    const y = height * (0.19 + i * 0.047);
    context.beginPath();
    context.arc(x - 4, y, 5, Math.PI * 1.1, Math.PI * 1.85);
    context.arc(x + 5, y, 5, Math.PI * 1.15, Math.PI * 1.9);
    context.stroke();
  }
  context.restore();
}

function drawDistantHills(context, state, theme) {
  const start = state.camera.x - 120;
  const end = state.camera.x + state.view.width / state.camera.zoom + 180;
  const difficulty = state.terrain.getDifficulty(state.player.x);
  drawHillBand(context, start, end, 0.28, state.camera.y + 410, theme.far, 0.55, difficulty);
  drawHillBand(context, start, end, 0.48, state.camera.y + 465, '#a9df78', 0.82, difficulty);
}

function drawHillBand(context, start, end, parallax, baseY, color, alpha, difficulty) {
  context.save();
  context.globalAlpha = alpha;
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(start, baseY + 500);
  for (let x = start; x <= end; x += 24) {
    const y =
      baseY +
      Math.sin((x * parallax) / 210) * (34 + difficulty * 22) +
      Math.sin(x / 370) * (18 + difficulty * 14);
    context.lineTo(x, y);
  }
  context.lineTo(end, baseY + 500);
  context.closePath();
  context.fill();
  context.restore();
}

function drawTerrain(context, state, theme) {
  const start = state.camera.x - 80;
  const end = state.camera.x + state.view.width / state.camera.zoom + 140;
  const terrainTop = state.camera.y + 220;
  const gradient = context.createLinearGradient(0, terrainTop, 0, state.camera.y + state.view.height + 260);
  gradient.addColorStop(0, '#87d95c');
  gradient.addColorStop(0.14, theme.near);
  gradient.addColorStop(0.65, theme.ground);
  gradient.addColorStop(1, '#1d713b');

  context.fillStyle = gradient;
  context.beginPath();
  context.moveTo(start, state.terrain.getY(start));
  for (let x = start; x <= end; x += 10) {
    context.lineTo(x, state.terrain.getY(x));
  }
  context.lineTo(end, state.camera.y + state.view.height + 220);
  context.lineTo(start, state.camera.y + state.view.height + 220);
  context.closePath();
  context.fill();

  context.save();
  context.clip();
  drawGroundTexture(context, state, start, end);
  context.restore();

  context.lineJoin = 'round';
  context.lineCap = 'round';
  context.lineWidth = 12;
  context.strokeStyle = '#246b35';
  context.beginPath();
  for (let x = start; x <= end; x += 10) {
    const y = state.terrain.getY(x);
    if (x === start) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  context.stroke();

  context.lineWidth = 7;
  context.strokeStyle = '#79ce50';
  context.stroke();

  context.lineWidth = 2.5;
  context.strokeStyle = 'rgba(245, 255, 193, 0.75)';
  context.stroke();
}

function drawGroundTexture(context, state, start, end) {
  const startStripe = Math.floor(start / 48) * 48;
  context.lineCap = 'round';
  for (let x = startStripe; x <= end; x += 48) {
    const groundY = state.terrain.getY(x);
    const seed = hash(x * 0.12);
    const bladeHeight = 14 + seed * 19;
    context.strokeStyle = seed > 0.56 ? 'rgba(184, 237, 104, 0.22)' : 'rgba(16, 93, 43, 0.16)';
    context.lineWidth = 2 + seed * 1.5;
    context.beginPath();
    context.moveTo(x, groundY + 18 + seed * 28);
    context.quadraticCurveTo(x + 4 + seed * 7, groundY + 9, x + 9 + seed * 9, groundY + 22 - bladeHeight * 0.2);
    context.stroke();

    if (seed > 0.82) {
      drawFlower(context, x + 18, groundY + 18 + seed * 12, 0.5 + seed * 0.22);
    }
  }
}

function drawFlower(context, x, y, scale) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.fillStyle = '#fff0a8';
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2.5) {
    context.beginPath();
    context.ellipse(Math.cos(angle) * 5, Math.sin(angle) * 5, 4, 2.5, angle, 0, Math.PI * 2);
    context.fill();
  }
  context.fillStyle = '#f3a629';
  context.beginPath();
  context.arc(0, 0, 3, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawDecorations(context, state) {
  const start = state.camera.x - 120;
  const end = state.camera.x + state.view.width / state.camera.zoom + 220;
  for (let x = Math.floor(start / 180) * 180; x < end; x += 180) {
    const y = state.terrain.getY(x) + 18;
    if (Math.floor(x / 180) % 3 === 0) {
      drawPaw(context, x + 34, y + 28, 0.25, -0.22);
    }
    if (Math.floor(x / 180) % 5 === 0) {
      drawTinyBone(context, x + 92, y + 44, 0.28, 0.4);
    }
    if (Math.floor(x / 180) % 7 === 0) {
      drawSignpost(context, x + 144, state.terrain.getY(x + 144) + 8, state.time);
    }
  }
}

function drawSignpost(context, x, y, time) {
  context.save();
  context.translate(x, y);
  context.rotate(Math.sin(time * 1.7 + x * 0.02) * 0.02);
  context.strokeStyle = '#704021';
  context.lineWidth = 7;
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(-3, 32);
  context.stroke();
  context.fillStyle = '#f7bc4d';
  context.strokeStyle = '#704021';
  context.lineWidth = 3;
  context.beginPath();
  context.roundRect(-14, -18, 28, 19, 5);
  context.fill();
  context.stroke();
  context.fillStyle = '#704021';
  context.beginPath();
  context.arc(-4, -8, 3, 0, Math.PI * 2);
  context.arc(4, -8, 3, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawCollectibles(context, state) {
  for (const bone of state.collectibles) {
    const scale = bone.collected ? 1 + bone.pop * 2.8 : 1 + Math.sin(state.time * 4 + bone.x) * 0.06;
    context.save();
    context.globalAlpha = bone.collected ? Math.max(0, 1 - bone.pop * 2) : 1;
    const y = bone.y - Math.sin(state.time * 3 + bone.x) * 5;
    drawCollectibleGlow(context, bone.x, y, scale, state.time);
    drawGoldBone(context, bone.x, y, scale, state.time);
    context.restore();
  }
}

function drawCollectibleGlow(context, x, y, scale, time) {
  context.save();
  context.translate(x, y);
  context.rotate(time * 0.8 + x * 0.01);
  context.strokeStyle = 'rgba(255, 234, 105, 0.48)';
  context.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    context.rotate(Math.PI / 2);
    context.beginPath();
    context.moveTo(0, -27 * scale);
    context.lineTo(0, -38 * scale);
    context.stroke();
  }
  context.restore();
}

function drawGoldBone(context, x, y, scale, time) {
  const size = 61 * scale;
  context.save();
  context.translate(x, y);
  context.rotate(Math.sin(time * 2.4 + x) * 0.06);
  if (wingsSprites.goldBone.complete && wingsSprites.goldBone.naturalWidth > 0) {
    context.drawImage(wingsSprites.goldBone, -size / 2, -size / 2, size, size);
  } else {
    drawTinyBone(context, 0, 0, scale * 0.6, 0);
  }
  context.restore();
}

function drawSpeedLines(context, state) {
  context.strokeStyle = 'rgba(255, 255, 255, 0.56)';
  context.lineWidth = 3.5;
  context.lineCap = 'round';
  for (const line of state.speedLines) {
    context.globalAlpha = Math.max(0, line.life / 0.35);
    context.beginPath();
    context.moveTo(line.x, line.y);
    context.lineTo(line.x - line.length, line.y + 6);
    context.stroke();
  }
  context.globalAlpha = 1;
}

function drawParticles(context, state) {
  for (const particle of state.particles) {
    context.save();
    context.globalAlpha = Math.max(0, particle.life * 2.4);
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
}

function drawBobbie(context, state) {
  const p = state.player;
  const drawY = p.visualY ?? p.y;
  const runCycle = Math.sin(state.time * Math.max(8, p.vx / 24));
  const squash = p.grounded ? 1 + Math.max(0, Math.abs(runCycle)) * 0.03 : 1;
  const stretch = p.dive ? 1.09 : 1;

  context.save();
  context.translate(p.x, drawY);
  context.rotate(p.rotation);
  context.scale(stretch, squash * (p.stumbleTimer > 0 ? 0.94 : 1));

  if (p.boostTimer > 0) {
    context.strokeStyle = 'rgba(255, 231, 73, 0.82)';
    context.lineWidth = 4;
    context.beginPath();
    context.arc(0, 0, 40 + Math.sin(state.time * 16) * 5, 0, Math.PI * 2);
    context.stroke();
  }

  if (bobbieSprite.complete && bobbieSprite.naturalWidth > 0) {
    const bob = getBobbieSpriteFrame(state);
    context.drawImage(bobbieSprite, bob.x, bob.y, bob.width, bob.height);
    context.restore();
    drawBobbieCallout(context, state, p.x, drawY);
    return;
  }

  const happy = p.perfectTimer > 0;
  context.lineJoin = 'round';
  context.lineCap = 'round';
  drawTail(context, state.time, p.vx);
  drawLegs(context, runCycle, p.grounded);

  context.fillStyle = '#ffffff';
  context.strokeStyle = '#2b170f';
  context.lineWidth = 4;
  context.beginPath();
  context.ellipse(0, 0, 31, 24, -0.08, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.fillStyle = '#14100f';
  context.beginPath();
  context.ellipse(4, -4, 20, 18, 0.1, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#ffffff';
  context.beginPath();
  context.ellipse(-9, 3, 15, 17, -0.15, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#ffffff';
  context.strokeStyle = '#2b170f';
  context.beginPath();
  context.ellipse(-24, -18, 20, 17, -0.18, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.fillStyle = '#14100f';
  context.beginPath();
  context.ellipse(-16, -29, 9, 17, -0.32 + runCycle * 0.05, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.ellipse(-35, -27, 8, 15, 0.12 - runCycle * 0.04, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#2b170f';
  context.beginPath();
  context.arc(-39, -17, 4, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#14100f';
  context.beginPath();
  context.arc(-28, -22, 2.5, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = '#2b170f';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(-30, -14, happy ? 8 : 5, 0.15, happy ? 1.35 : 1.0);
  context.stroke();

  context.restore();
  drawBobbieCallout(context, state, p.x, drawY);
}

function drawBobbieCallout(context, state, x, y) {
  const p = state.player;
  if (p.perfectTimer <= 0 && p.stumbleTimer <= 0) {
    return;
  }

  const perfect = p.perfectTimer > 0;
  const alpha = Math.min(1, (perfect ? p.perfectTimer : p.stumbleTimer) * 3);
  context.save();
  context.globalAlpha = alpha;
  context.translate(x, y - 100 - (1 - alpha) * 16);
  context.rotate(-p.rotation * 0.18);
  context.font = '900 20px Arial Rounded MT Bold, Arial, sans-serif';
  context.textAlign = 'center';
  context.lineJoin = 'round';
  context.lineWidth = 5;
  context.strokeStyle = perfect ? '#63351d' : '#6d3b26';
  context.fillStyle = perfect ? '#fff3a2' : '#ffe3c0';
  context.strokeText(perfect ? 'PERFECT!' : 'OOPS!', 0, 0);
  context.fillText(perfect ? 'PERFECT!' : 'OOPS!', 0, 0);
  context.restore();
}

function getBobbieSpriteFrame(state) {
  const player = state.player;
  const airborneLift = player.grounded ? 0 : Math.sin(state.time * 9) * 2;
  const runBob = player.grounded ? Math.sin(state.time * Math.max(9, player.vx / 23)) * 2.5 : 0;
  const width = player.perfectTimer > 0 ? 112 : 106;
  const height = player.dive ? 88 : 96;

  return {
    width,
    height,
    x: -54,
    y: -78 + runBob + airborneLift,
  };
}

function drawTail(context, time, speed) {
  const wag = Math.sin(time * 9 + speed * 0.01) * 6;
  context.strokeStyle = '#2b170f';
  context.lineWidth = 13;
  context.beginPath();
  context.moveTo(27, -6);
  context.quadraticCurveTo(58, -30 + wag, 67, -4 + wag * 0.25);
  context.stroke();
  context.strokeStyle = '#ffffff';
  context.lineWidth = 7;
  context.stroke();
}

function drawLegs(context, runCycle, grounded) {
  const phase = grounded ? runCycle : 0.25;
  context.strokeStyle = '#2b170f';
  context.lineWidth = 8;
  context.beginPath();
  context.moveTo(-12, 16);
  context.lineTo(-20 + phase * 5, 34);
  context.moveTo(7, 16);
  context.lineTo(16 - phase * 5, 34);
  context.stroke();

  context.strokeStyle = '#ffffff';
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(-12, 17);
  context.lineTo(-20 + phase * 5, 33);
  context.moveTo(7, 17);
  context.lineTo(16 - phase * 5, 33);
  context.stroke();
}

function drawTinyBone(context, x, y, scale, rotation) {
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.scale(scale, scale);
  context.fillStyle = '#fff4cb';
  context.strokeStyle = '#5a321e';
  context.lineWidth = 4;
  context.beginPath();
  context.roundRect(-26, -8, 52, 16, 8);
  context.fill();
  context.stroke();
  for (const side of [-1, 1]) {
    context.beginPath();
    context.arc(side * 28, -8, 9, 0, Math.PI * 2);
    context.arc(side * 28, 8, 9, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }
  context.restore();
}

function drawPaw(context, x, y, scale, rotation) {
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.scale(scale, scale);
  context.fillStyle = 'rgba(75, 38, 20, 0.35)';
  context.beginPath();
  context.ellipse(0, 12, 18, 14, 0, 0, Math.PI * 2);
  context.fill();
  for (const toe of [-18, -6, 8, 20]) {
    context.beginPath();
    context.arc(toe, -8 - Math.abs(toe) * 0.08, 7, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function drawVignette(context, width, height) {
  const gradient = context.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.3,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.75,
  );
  gradient.addColorStop(0, 'rgba(255,255,255,0)');
  gradient.addColorStop(1, 'rgba(70,40,15,0.14)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function hash(value) {
  const result = Math.sin(value * 12.9898) * 43758.5453;
  return result - Math.floor(result);
}
