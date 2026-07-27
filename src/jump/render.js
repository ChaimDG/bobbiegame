import { jumpSprites } from './assets.js';

export function drawSnoetjesJump(context, state) {
  const { width, height } = state.view;
  context.clearRect(0, 0, width, height);
  drawSky(context, state);

  const shakeX = (Math.random() - 0.5) * state.shake * 14;
  const shakeY = (Math.random() - 0.5) * state.shake * 10;
  context.save();
  context.translate(shakeX, shakeY);
  drawClouds(context, state);
  state.platforms.forEach((platform) => drawPlatform(context, state, platform));
  state.platforms.forEach((platform) => {
    if (platform.hasBone && !platform.boneCollected) {
      drawBone(context, state, platform.x + platform.width * 0.5, platform.y - 30);
    }
  });
  drawParticles(context, state);
  drawSnoetjes(context, state);
  drawPopups(context, state);
  context.restore();
  drawVignette(context, width, height);
}

function drawSky(context, state) {
  const { width, height } = state.view;
  const image = jumpSprites.skyPark;
  const fallback = context.createLinearGradient(0, 0, 0, height);
  fallback.addColorStop(0, '#8fd9ed');
  fallback.addColorStop(0.62, '#d7f5ef');
  fallback.addColorStop(1, '#f7e7ad');
  context.fillStyle = fallback;
  context.fillRect(0, 0, width, height);

  if (image.complete && image.naturalWidth > 0) {
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const viewRatio = width / height;
    let drawWidth = width;
    let drawHeight = height;
    if (viewRatio > imageRatio) {
      drawHeight = width / imageRatio;
    } else {
      drawWidth = height * imageRatio;
    }
    const drift = Math.sin(state.time * 0.16) * 6;
    context.globalAlpha = 0.93;
    context.drawImage(image, (width - drawWidth) * 0.5, (height - drawHeight) * 0.5 + drift, drawWidth, drawHeight);
    context.globalAlpha = 1;
  }

  const sunlight = context.createRadialGradient(width * 0.18, height * 0.14, 4, width * 0.18, height * 0.14, width * 0.58);
  sunlight.addColorStop(0, 'rgba(255, 250, 195, 0.34)');
  sunlight.addColorStop(1, 'rgba(255, 250, 195, 0)');
  context.fillStyle = sunlight;
  context.fillRect(0, 0, width, height);
}

function drawClouds(context, state) {
  const { width, height } = state.view;
  for (let index = 0; index < 5; index += 1) {
    const travel = (state.time * (8 + index * 1.8) + index * 137) % (width + 180);
    const x = travel - 90;
    const y = height * (0.1 + index * 0.16) + Math.sin(state.time * 0.7 + index) * 9;
    drawCloud(context, x, y, 0.32 + (index % 3) * 0.1, 0.3 + (index % 2) * 0.12);
  }

  for (let index = 0; index < 7; index += 1) {
    const x = ((index * 83 + state.time * 7) % (width + 60)) - 30;
    const y = 65 + index * (height * 0.11);
    drawSparkle(context, x, y, 0.5 + (index % 3) * 0.16, state.time + index);
  }
}

function drawCloud(context, x, y, scale, alpha) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.globalAlpha = alpha;
  context.fillStyle = '#fffef2';
  context.beginPath();
  context.arc(-42, 6, 24, 0, Math.PI * 2);
  context.arc(-14, -8, 31, 0, Math.PI * 2);
  context.arc(22, -2, 27, 0, Math.PI * 2);
  context.arc(48, 9, 19, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawPlatform(context, state, platform) {
  const bob = Math.sin(state.time * 1.2 + platform.bobPhase) * 1.4;
  const x = platform.x;
  const y = platform.y + bob;
  const height = platform.type === 'trampoline' ? 24 : 22;

  context.save();
  context.translate(x, y);
  context.fillStyle = 'rgba(71, 52, 31, 0.2)';
  roundRect(context, 4, 9, platform.width, height, 11);
  context.fill();

  if (platform.type === 'trampoline') {
    drawTrampoline(context, platform.width);
  } else {
    const grass = context.createLinearGradient(0, -6, 0, height);
    grass.addColorStop(0, '#d9f37a');
    grass.addColorStop(0.35, '#7dce58');
    grass.addColorStop(1, '#3d9a51');
    context.fillStyle = grass;
    context.strokeStyle = '#4c2c19';
    context.lineWidth = 4;
    roundRect(context, 0, 0, platform.width, height, 11);
    context.fill();
    context.stroke();

    context.fillStyle = 'rgba(255,255,198,0.66)';
    roundRect(context, 7, 4, platform.width - 14, 4.5, 4);
    context.fill();
    context.fillStyle = 'rgba(40, 110, 44, 0.42)';
    roundRect(context, 9, height - 8, platform.width - 18, 3.5, 3);
    context.fill();
  }
  context.restore();
}

function drawTrampoline(context, width) {
  context.strokeStyle = '#4c2c19';
  context.lineWidth = 4;
  context.fillStyle = '#fead4f';
  roundRect(context, 0, 0, width, 22, 11);
  context.fill();
  context.stroke();
  context.fillStyle = '#fff1a8';
  roundRect(context, 7, 4, width - 14, 8, 5);
  context.fill();
  context.strokeStyle = '#c86034';
  context.lineWidth = 2;
  context.beginPath();
  for (let x = 15; x < width - 10; x += 15) {
    context.moveTo(x, 15);
    context.lineTo(x + 7, 21);
  }
  context.stroke();
  context.strokeStyle = '#4c2c19';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(16, 20);
  context.lineTo(11, 31);
  context.moveTo(width - 16, 20);
  context.lineTo(width - 11, 31);
  context.stroke();
}

function drawBone(context, state, x, y) {
  const bob = Math.sin(state.time * 4.2 + x) * 4;
  context.save();
  context.translate(x, y + bob);
  context.rotate(Math.sin(state.time * 1.8 + x) * 0.09);
  context.shadowColor = 'rgba(95, 56, 20, 0.32)';
  context.shadowBlur = 7;
  context.shadowOffsetY = 4;
  context.fillStyle = '#ffdf59';
  context.strokeStyle = '#60401f';
  context.lineWidth = 3;
  context.beginPath();
  context.arc(-11, -6, 6, 0, Math.PI * 2);
  context.arc(-11, 6, 6, 0, Math.PI * 2);
  context.arc(11, -6, 6, 0, Math.PI * 2);
  context.arc(11, 6, 6, 0, Math.PI * 2);
  context.rect(-11, -6, 22, 12);
  context.fill();
  context.stroke();
  context.shadowColor = 'transparent';
  context.fillStyle = 'rgba(255, 255, 226, 0.72)';
  context.beginPath();
  context.ellipse(-3, -4, 7, 2.2, -0.1, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawSnoetjes(context, state) {
  const { player } = state;
  const image = jumpSprites.snoetjes;
  const airStretch = Math.min(0.09, Math.abs(player.vy) / 830 * 0.1);
  const scaleX = 1 + player.squash * 0.15 - airStretch;
  const scaleY = 1 - player.squash * 0.12 + airStretch;
  const width = player.width * 1.55;
  const height = player.height * 1.55;

  context.save();
  context.translate(player.x, player.y);
  context.rotate(player.rotation);
  context.scale(player.facing, 1);
  context.scale(scaleX, scaleY);

  if (player.bounceFlash > 0) {
    context.globalAlpha = player.bounceFlash * 0.5;
    context.strokeStyle = '#fff5a1';
    context.lineWidth = 4;
    context.beginPath();
    context.arc(0, 4, 50 + (1 - player.bounceFlash) * 11, 0, Math.PI * 2);
    context.stroke();
    context.globalAlpha = 1;
  }

  context.fillStyle = 'rgba(75, 40, 19, 0.24)';
  context.beginPath();
  context.ellipse(0, 30, 31, 8, 0, 0, Math.PI * 2);
  context.fill();
  if (image.complete && image.naturalWidth > 0) {
    context.filter = 'drop-shadow(0px 5px 2px rgba(70, 38, 19, 0.35))';
    context.drawImage(image, -width * 0.5, -height * 0.58, width, height);
    context.filter = 'none';
  } else {
    drawFallbackDog(context);
  }
  context.restore();
}

function drawFallbackDog(context) {
  context.fillStyle = '#fffaf0';
  context.strokeStyle = '#4c2c19';
  context.lineWidth = 4;
  context.beginPath();
  context.ellipse(0, 0, 31, 24, 0, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.fillStyle = '#29221e';
  context.beginPath();
  context.ellipse(5, -2, 20, 18, 0, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(-20, -19, 16, 0, Math.PI * 2);
  context.fill();
}

function drawParticles(context, state) {
  state.particles.forEach((particle) => {
    context.save();
    context.globalAlpha = Math.min(1, particle.life * 1.8);
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    context.fill();
    context.restore();
  });
}

function drawPopups(context, state) {
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = '900 16px Trebuchet MS, system-ui, sans-serif';
  state.popups.forEach((popup) => {
    context.save();
    context.globalAlpha = Math.min(1, popup.life * 1.6);
    context.strokeStyle = '#4c2c19';
    context.fillStyle = popup.color;
    context.lineWidth = 4;
    context.strokeText(popup.text, popup.x, popup.y);
    context.fillText(popup.text, popup.x, popup.y);
    context.restore();
  });
}

function drawSparkle(context, x, y, scale, time) {
  const pulse = 0.72 + Math.sin(time * 2.6 + x) * 0.28;
  context.save();
  context.translate(x, y);
  context.scale(scale * pulse, scale * pulse);
  context.strokeStyle = 'rgba(255, 249, 190, 0.85)';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(-7, 0);
  context.lineTo(7, 0);
  context.moveTo(0, -7);
  context.lineTo(0, 7);
  context.stroke();
  context.restore();
}

function drawVignette(context, width, height) {
  const vignette = context.createRadialGradient(width * 0.5, height * 0.46, Math.min(width, height) * 0.25, width * 0.5, height * 0.46, Math.max(width, height) * 0.78);
  vignette.addColorStop(0.55, 'rgba(45, 72, 43, 0)');
  vignette.addColorStop(1, 'rgba(37, 65, 38, 0.18)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}
