import { towerTypes } from './level.js';
import { getPathPoint, validatePlacement } from './engine.js';
import { getDefenseAsset } from './assets.js';

export function drawDefense(context, state, field) {
  context.clearRect(0, 0, field.width, field.height);
  context.imageSmoothingEnabled = true;

  drawBackground(context, field);
  drawPath(context, field);
  drawFieldDetails(context, field);
  drawPlacementPreview(context, state, field);
  drawTowers(context, state, field);
  drawEnemies(context, state, field);
  drawProjectiles(context, state, field);
  drawBursts(context, state, field);
  drawPopups(context, state);

  if (state.invalidFlash > 0) {
    drawInvalidFlash(context, field, state.invalidFlash);
  }
  if (state.paused) {
    drawPausedVeil(context, field);
  }
}

function drawBackground(context, field) {
  const arena = getDefenseAsset('arena');
  if (isReady(arena)) {
    drawCover(context, arena, field.width, field.height);
  } else {
    const fallback = context.createLinearGradient(0, 0, 0, field.height);
    fallback.addColorStop(0, '#bdeeff');
    fallback.addColorStop(0.42, '#eefbd5');
    fallback.addColorStop(0.43, '#a1db70');
    fallback.addColorStop(1, '#66b852');
    context.fillStyle = fallback;
    context.fillRect(0, 0, field.width, field.height);
  }

  const shade = context.createLinearGradient(0, 0, 0, field.height);
  shade.addColorStop(0, 'rgba(255,255,255,0.14)');
  shade.addColorStop(0.55, 'rgba(255,255,255,0)');
  shade.addColorStop(1, 'rgba(29,76,33,0.1)');
  context.fillStyle = shade;
  context.fillRect(0, 0, field.width, field.height);
}

function drawPath(context, field) {
  const points = Array.from({ length: 72 }, (_, index) => getPathPoint(index / 71, field));
  const scale = fieldScale(field);
  const pathWidth = 56 * scale;

  context.save();
  context.lineJoin = 'round';
  context.lineCap = 'round';
  context.shadowColor = 'rgba(52, 31, 15, 0.32)';
  context.shadowBlur = 8 * scale;
  context.shadowOffsetY = 4 * scale;
  context.lineWidth = pathWidth + 20 * scale;
  context.strokeStyle = '#5a361f';
  strokePolyline(context, points);
  context.shadowColor = 'transparent';

  context.lineWidth = pathWidth + 10 * scale;
  context.strokeStyle = '#fff0bd';
  strokePolyline(context, points);
  context.lineWidth = pathWidth;
  context.strokeStyle = '#c98140';
  strokePolyline(context, points);
  context.lineWidth = pathWidth * 0.62;
  context.strokeStyle = '#e6ac62';
  strokePolyline(context, points);

  context.globalAlpha = 0.2;
  context.lineWidth = 3 * scale;
  context.strokeStyle = '#fff8d4';
  context.setLineDash([11 * scale, 10 * scale]);
  strokePolyline(context, points);
  context.setLineDash([]);
  context.globalAlpha = 1;

  for (let progress = 0.02; progress < 0.98; progress += 0.047) {
    const point = getPathPoint(progress, field);
    context.save();
    context.translate(point.x, point.y);
    context.rotate(point.angle);
    context.fillStyle = 'rgba(111, 59, 27, 0.17)';
    context.beginPath();
    context.ellipse(0, pathWidth * 0.27, 7 * scale, 2.2 * scale, 0, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  drawPathMarker(context, getPathPoint(0, field), 'start', scale);
  drawPathMarker(context, getPathPoint(1, field), 'home', scale);
  context.restore();
}

function drawFieldDetails(context, field) {
  const scale = fieldScale(field);
  const pawPositions = [
    [0.13, 0.73, -0.22],
    [0.36, 0.13, 0.14],
    [0.58, 0.79, -0.18],
    [0.9, 0.12, 0.2],
  ];
  context.save();
  context.fillStyle = 'rgba(69, 101, 42, 0.18)';
  for (const [x, y, angle] of pawPositions) {
    drawPaw(context, x * field.width, y * field.height, 0.33 * scale, angle);
  }
  context.restore();

  const fireflies = [
    [0.18, 0.43, 0.9],
    [0.69, 0.16, 1.7],
    [0.86, 0.82, 2.4],
    [0.42, 0.86, 3.1],
  ];
  for (const [x, y, offset] of fireflies) {
    const glow = 0.25 + Math.sin(field.time * 2.2 + offset) * 0.15;
    context.save();
    context.globalAlpha = glow;
    context.fillStyle = '#fff3a5';
    context.beginPath();
    context.arc(x * field.width, y * field.height, 3 * scale, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
}

function drawPlacementPreview(context, state, field) {
  if (!state.placementPreview) {
    return;
  }

  const tower = towerTypes[state.selectedTower];
  const validation = validatePlacement(state, state.placementPreview, field, tower);
  const scale = fieldScale(field);
  context.save();
  context.globalAlpha = validation.valid ? 0.18 : 0.17;
  context.fillStyle = validation.valid ? '#fff16c' : '#ff6659';
  context.beginPath();
  context.arc(state.placementPreview.x, state.placementPreview.y, tower.range, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;
  context.lineWidth = 3 * scale;
  context.strokeStyle = validation.valid ? '#fff7ce' : '#8e3029';
  context.setLineDash([7 * scale, 5 * scale]);
  context.beginPath();
  context.arc(state.placementPreview.x, state.placementPreview.y, tower.range, 0, Math.PI * 2);
  context.stroke();
  context.setLineDash([]);
  context.globalAlpha = validation.valid ? 0.76 : 0.44;
  drawTowerSprite(context, tower, state.placementPreview.x, state.placementPreview.y, scale);
  context.restore();
}

function drawTowers(context, state, field) {
  const scale = fieldScale(field);
  for (const tower of state.towers) {
    const stats = towerTypes[tower.type];
    const bob = Math.sin(field.time * 2.6 + tower.id * 1.8) * 1.4 * scale;
    context.save();
    context.translate(tower.x, tower.y + bob);
    context.fillStyle = 'rgba(47, 29, 12, 0.24)';
    context.beginPath();
    context.ellipse(0, 23 * scale, 29 * scale, 10 * scale, 0, 0, Math.PI * 2);
    context.fill();
    context.restore();

    drawTowerSprite(context, stats, tower.x, tower.y + bob, scale);
    drawTowerLevel(context, tower, scale);
  }
}

function drawTowerSprite(context, stats, x, y, scale) {
  const image = getDefenseAsset(stats.art);
  const size = stats.spriteSize * scale;
  if (isReady(image)) {
    context.drawImage(image, x - size / 2, y - size * 0.69, size, size);
    return;
  }

  context.save();
  context.translate(x, y);
  context.fillStyle = '#fff2ca';
  context.strokeStyle = '#4b2a18';
  context.lineWidth = 4 * scale;
  roundedRect(context, -20 * scale, -16 * scale, 40 * scale, 35 * scale, 11 * scale);
  context.fill();
  context.stroke();
  context.fillStyle = stats.color;
  context.beginPath();
  context.arc(0, -18 * scale, 16 * scale, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.restore();
}

function drawTowerLevel(context, tower, scale) {
  context.save();
  context.translate(tower.x + 28 * scale, tower.y - 25 * scale);
  context.fillStyle = '#fff5bf';
  context.strokeStyle = '#4b2a18';
  context.lineWidth = 3 * scale;
  context.beginPath();
  context.arc(0, 0, 10 * scale, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.fillStyle = '#8d4b27';
  context.font = `900 ${11 * scale}px Trebuchet MS`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(tower.level, 0, 1 * scale);
  context.restore();
}

function drawEnemies(context, state, field) {
  const scale = fieldScale(field);
  const troublemaker = getDefenseAsset('troublemaker');
  for (const enemy of state.enemies) {
    const bob = Math.sin(field.time * 7 + enemy.id * 1.4) * 1.6 * scale;
    const size = (enemy.type === 'package' ? 48 : 43) * scale;
    context.save();
    context.translate(enemy.x, enemy.y + bob);
    context.rotate(enemy.angle * 0.16);
    if (enemy.type === 'package') {
      context.filter = 'hue-rotate(-26deg) saturate(1.22) brightness(0.88)';
    }
    if (enemy.hitFlash > 0) {
      context.filter = 'brightness(1.65) saturate(0.3)';
    }
    if (isReady(troublemaker)) {
      context.drawImage(troublemaker, -size / 2, -size * 0.56, size, size);
    } else {
      drawFallbackEnemy(context, enemy, scale);
    }
    context.restore();
    drawHealthBar(context, enemy, scale, bob);
  }
}

function drawFallbackEnemy(context, enemy, scale) {
  context.fillStyle = enemy.type === 'package' ? '#bd8655' : '#f58b44';
  context.strokeStyle = '#4b2a18';
  context.lineWidth = 3 * scale;
  context.beginPath();
  context.arc(0, 0, 14 * scale, 0, Math.PI * 2);
  context.fill();
  context.stroke();
}

function drawHealthBar(context, enemy, scale, bob) {
  const width = 34 * scale;
  const x = enemy.x - width / 2;
  const y = enemy.y - 26 * scale + bob;
  context.save();
  context.fillStyle = 'rgba(65, 38, 25, 0.88)';
  roundedRect(context, x, y, width, 6 * scale, 3 * scale);
  context.fill();
  const hp = Math.max(0, enemy.hp / enemy.maxHp);
  context.fillStyle = enemy.slowTimer > 0 ? '#7ee8f2' : '#83e56d';
  roundedRect(context, x + 1.5 * scale, y + 1.5 * scale, (width - 3 * scale) * hp, 3 * scale, 2 * scale);
  context.fill();
  context.restore();
}

function drawProjectiles(context, state, field) {
  const scale = fieldScale(field);
  for (const projectile of state.projectiles) {
    context.save();
    if (projectile.towerType === 'tennis') {
      drawTennisProjectile(context, projectile, scale);
    } else if (projectile.towerType === 'treat') {
      drawTreatProjectile(context, projectile, scale);
    } else {
      drawBarkProjectile(context, projectile, scale, field.time);
    }
    context.restore();
  }
}

function drawTennisProjectile(context, projectile, scale) {
  context.strokeStyle = 'rgba(255, 248, 200, 0.5)';
  context.lineWidth = 4 * scale;
  context.beginPath();
  context.moveTo(projectile.x - 15 * scale, projectile.y + 7 * scale);
  context.lineTo(projectile.x - 3 * scale, projectile.y + 2 * scale);
  context.stroke();
  context.fillStyle = '#dcec45';
  context.strokeStyle = '#4b2a18';
  context.lineWidth = 2 * scale;
  context.beginPath();
  context.arc(projectile.x, projectile.y, 7 * scale, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.strokeStyle = '#fff4bc';
  context.lineWidth = 1.3 * scale;
  context.beginPath();
  context.arc(projectile.x - 2 * scale, projectile.y, 4.5 * scale, -1.2, 1.2);
  context.stroke();
}

function drawTreatProjectile(context, projectile, scale) {
  context.translate(projectile.x, projectile.y);
  context.rotate(Math.sin(projectile.id * 2.4 + projectile.life * 8) * 0.6);
  context.fillStyle = '#ffd36e';
  context.strokeStyle = '#6d3c1f';
  context.lineWidth = 2 * scale;
  roundedRect(context, -7 * scale, -3 * scale, 14 * scale, 6 * scale, 3 * scale);
  context.fill();
  context.stroke();
  for (const x of [-7, 7]) {
    context.beginPath();
    context.arc(x * scale, -4 * scale, 3.5 * scale, 0, Math.PI * 2);
    context.arc(x * scale, 4 * scale, 3.5 * scale, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }
}

function drawBarkProjectile(context, projectile, scale, time) {
  const radius = (6 + Math.sin(time * 14 + projectile.id) * 1.5) * scale;
  context.strokeStyle = '#c9fbff';
  context.lineWidth = 3 * scale;
  context.beginPath();
  context.arc(projectile.x, projectile.y, radius, 0, Math.PI * 2);
  context.stroke();
  context.strokeStyle = '#55d4ed';
  context.lineWidth = 1.6 * scale;
  context.beginPath();
  context.arc(projectile.x, projectile.y, radius + 4 * scale, -1.1, 1.4);
  context.stroke();
}

function drawBursts(context, state, field) {
  const scale = fieldScale(field);
  for (const burst of state.bursts) {
    const amount = Math.max(0, burst.life / burst.maxLife);
    context.save();
    context.globalAlpha = amount;
    if (burst.type === 'treat') {
      context.fillStyle = '#ffd25f';
      context.strokeStyle = '#9a5527';
      context.lineWidth = 2 * scale;
      for (let index = 0; index < 6; index += 1) {
        const angle = (Math.PI * 2 * index) / 6;
        const distance = (16 + (1 - amount) * 25) * scale;
        context.beginPath();
        context.arc(burst.x + Math.cos(angle) * distance, burst.y + Math.sin(angle) * distance, 3.3 * scale, 0, Math.PI * 2);
        context.fill();
        context.stroke();
      }
    } else {
      const color = burst.type === 'bark' ? '#9bf6ff' : '#f7f082';
      context.strokeStyle = color;
      context.lineWidth = 3 * scale;
      context.beginPath();
      context.arc(burst.x, burst.y, (12 + (1 - amount) * 25) * scale, 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();
  }
}

function drawPopups(context, state) {
  context.save();
  context.font = '900 18px Trebuchet MS';
  context.textAlign = 'center';
  for (const popup of state.popups) {
    context.globalAlpha = Math.max(0, popup.life / 0.8);
    context.lineWidth = 4;
    context.strokeStyle = '#4b2a18';
    context.fillStyle = '#fff8dc';
    context.strokeText(popup.text, popup.x, popup.y);
    context.fillText(popup.text, popup.x, popup.y);
  }
  context.restore();
}

function drawPathMarker(context, point, type, scale) {
  context.save();
  context.translate(point.x, point.y);
  context.rotate(point.angle);
  if (type === 'start') {
    context.fillStyle = '#6cc85c';
    context.strokeStyle = '#3f702e';
    context.lineWidth = 4 * scale;
    context.beginPath();
    context.arc(-5 * scale, 0, 17 * scale, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.fillStyle = '#fff6d1';
    context.beginPath();
    context.moveTo(-10 * scale, -7 * scale);
    context.lineTo(7 * scale, 0);
    context.lineTo(-10 * scale, 7 * scale);
    context.closePath();
    context.fill();
  } else {
    context.fillStyle = '#dc674f';
    context.strokeStyle = '#4b2a18';
    context.lineWidth = 4 * scale;
    roundedRect(context, -16 * scale, -18 * scale, 32 * scale, 37 * scale, 8 * scale);
    context.fill();
    context.stroke();
    context.fillStyle = '#fff0c2';
    context.beginPath();
    context.moveTo(-20 * scale, -18 * scale);
    context.lineTo(0, -33 * scale);
    context.lineTo(20 * scale, -18 * scale);
    context.closePath();
    context.fill();
    context.stroke();
    context.fillStyle = '#4b2a18';
    context.beginPath();
    context.arc(0, 12 * scale, 7 * scale, Math.PI, 0);
    context.fill();
  }
  context.restore();
}

function drawPaw(context, x, y, scale, angle) {
  context.save();
  context.translate(x, y);
  context.rotate(angle);
  context.scale(scale, scale);
  context.beginPath();
  context.ellipse(0, 13, 17, 13, 0, 0, Math.PI * 2);
  context.fill();
  for (const toe of [-18, -6, 8, 20]) {
    context.beginPath();
    context.arc(toe, -7, 7, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function drawInvalidFlash(context, field, amount) {
  context.save();
  context.strokeStyle = `rgba(244, 75, 72, ${amount * 2.1})`;
  context.lineWidth = 8;
  roundedRect(context, 5, 5, field.width - 10, field.height - 10, 17);
  context.stroke();
  context.restore();
}

function drawPausedVeil(context, field) {
  context.save();
  context.fillStyle = 'rgba(38, 55, 37, 0.24)';
  context.fillRect(0, 0, field.width, field.height);
  context.fillStyle = 'rgba(255, 249, 221, 0.94)';
  context.strokeStyle = '#4b2a18';
  context.lineWidth = 5;
  roundedRect(context, field.width / 2 - 72, field.height / 2 - 32, 144, 64, 20);
  context.fill();
  context.stroke();
  context.fillStyle = '#6d3c1f';
  context.font = '900 23px Trebuchet MS';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('PAUSED', field.width / 2, field.height / 2 + 1);
  context.restore();
}

function strokePolyline(context, points) {
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  for (const point of points.slice(1)) {
    context.lineTo(point.x, point.y);
  }
  context.stroke();
}

function drawCover(context, image, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

function roundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function fieldScale(field) {
  return Math.max(0.72, Math.min(1.15, Math.min(field.width / 760, field.height / 600)));
}

function isReady(image) {
  return image?.complete && image.naturalWidth > 0;
}
