export function updateCollectibles(state, dt, playCue) {
  const player = state.player;
  const terrain = state.terrain;

  while (state.meta.nextBoneX < player.x + 1000) {
    const x = state.meta.nextBoneX;
    const y = terrain.getY(x) - 95 - Math.sin(x / 180) * 36;
    state.collectibles.push({
      id: x,
      x,
      y,
      collected: false,
      pop: 0,
    });
    state.meta.nextBoneX += 280 + Math.random() * 230;
  }

  for (const bone of state.collectibles) {
    if (bone.collected) {
      bone.pop += dt;
      continue;
    }

    const dx = bone.x - player.x;
    const dy = bone.y - player.y;
    if (dx * dx + dy * dy < 52 * 52) {
      bone.collected = true;
      bone.pop = 0.01;
      state.score.bones += 1;
      playCue('bone');
      state.particles.push({
        x: bone.x,
        y: bone.y,
        vx: 0,
        vy: -120,
        size: 14,
        color: '#fff1a8',
        life: 0.45,
      });
    }
  }

  state.collectibles = state.collectibles.filter(
    (bone) => bone.x > player.x - 300 && (!bone.collected || bone.pop < 0.5),
  );
}
