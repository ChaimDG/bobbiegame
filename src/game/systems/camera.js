export function updateCamera(state, dt) {
  const player = state.player;
  const view = state.view;
  const terrain = state.terrain;
  const speedLook = Math.min(330, Math.max(110, player.vx * 0.42));
  const lookX = player.x + speedLook + 160;
  const groundAheadY = terrain.getY(lookX) - player.radius;
  const heightAboveGround = Math.max(0, groundAheadY - player.y);
  const altitudeRatio = Math.min(1, heightAboveGround / 520);
  const targetX = player.x - view.width * 0.34 + speedLook;
  const playerFocusY = player.y - view.height * 0.5;
  const groundFocusY = groundAheadY - view.height * 0.72;
  const targetY = playerFocusY * (1 - altitudeRatio * 0.74) + groundFocusY * altitudeRatio * 0.74;
  const speedRatio = Math.min(1, Math.max(0, (player.vx - 360) / 650));
  const targetZoom = 1 - speedRatio * 0.1 - altitudeRatio * 0.18;
  const smoothing = 1 - Math.exp(-dt * 4.2);

  state.camera.x += (targetX - state.camera.x) * smoothing;
  state.camera.y += (targetY - state.camera.y) * smoothing * 0.82;
  state.camera.zoom += (targetZoom - state.camera.zoom) * smoothing;
  state.camera.zoom = Math.max(0.72, Math.min(1.02, state.camera.zoom));
  state.camera.y = Math.min(state.camera.y, 260);
}
