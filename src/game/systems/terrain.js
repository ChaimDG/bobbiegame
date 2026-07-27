const themes = [
  { sky: '#8bd8ff', far: '#b8e999', near: '#5ebd4a', ground: '#3e953c' },
  { sky: '#98e4ff', far: '#ffe4a4', near: '#7acb65', ground: '#58a94a' },
  { sky: '#b5e6ff', far: '#c9ed9a', near: '#65c7a0', ground: '#4d9f61' },
];

export function createTerrain(seed = 1) {
  const waves = [
    { amp: 96, len: 560, phase: seeded(seed) * 10 },
    { amp: 48, len: 880, phase: seeded(seed + 3) * 10 },
    { amp: 26, len: 330, phase: seeded(seed + 7) * 10 },
  ];
  const advancedWaves = [
    { amp: 58, len: 430, phase: seeded(seed + 11) * 10 },
    { amp: 42, len: 275, phase: seeded(seed + 17) * 10 },
  ];

  function getBase(x) {
    const difficulty = getDifficulty(x);
    const themeShift = Math.sin(x / 4200) * (28 + difficulty * 18);
    return 455 + themeShift;
  }

  function getY(x) {
    const difficulty = getDifficulty(x);
    const intensity = 1 + difficulty * 1.05;
    let y = getBase(x);
    for (const wave of waves) {
      const tighterLength = wave.len * (1 - difficulty * 0.14);
      y += Math.sin(x / tighterLength + wave.phase) * wave.amp * intensity;
    }

    for (const wave of advancedWaves) {
      const fade = smoothstep((x - 1300) / 4200);
      const tighterLength = wave.len * (1 - difficulty * 0.18);
      y += Math.sin(x / tighterLength + wave.phase) * wave.amp * fade;
    }

    return blendStartRamp(x, y);
  }

  function getSlope(x) {
    const sample = 4;
    return (getY(x + sample) - getY(x - sample)) / (sample * 2);
  }

  function getTheme(x) {
    const index = Math.abs(Math.floor(x / 3600)) % themes.length;
    return themes[index];
  }

  return {
    getY,
    getSlope,
    getTheme,
    getDifficulty,
  };
}

function getDifficulty(x) {
  const earlyRamp = smoothstep((x - 850) / 3600);
  const lateRamp = smoothstep((x - 5600) / 7000);
  return Math.min(1, earlyRamp * 0.72 + lateRamp * 0.28);
}

function blendStartRamp(x, naturalY) {
  const rampStart = 40;
  const rampEnd = 1040;
  const blendEnd = 1480;
  const progress = smoothstep((x - rampStart) / (rampEnd - rampStart));
  const launchDip = Math.sin(progress * Math.PI) * 34;
  const rampY = 230 + progress * 410 + launchDip;

  if (x < rampEnd) {
    return rampY;
  }

  if (x < blendEnd) {
    const blend = smoothstep((x - rampEnd) / (blendEnd - rampEnd));
    return rampY * (1 - blend) + naturalY * blend;
  }

  return naturalY;
}

function smoothstep(value) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function seeded(value) {
  const x = Math.sin(value * 999) * 10000;
  return x - Math.floor(x);
}
