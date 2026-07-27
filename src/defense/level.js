export const defensePath = [
  { x: 0.05, y: 0.2 },
  { x: 0.24, y: 0.2 },
  { x: 0.24, y: 0.48 },
  { x: 0.5, y: 0.48 },
  { x: 0.5, y: 0.28 },
  { x: 0.78, y: 0.28 },
  { x: 0.78, y: 0.68 },
  { x: 0.95, y: 0.68 },
];

export const towerTypes = {
  tennis: {
    id: 'tennis',
    name: 'Tennis',
    role: 'Knockback',
    price: 55,
    range: 145,
    damage: 22,
    fireRate: 0.62,
    projectileSpeed: 430,
    color: '#ddea43',
    art: 'tennis',
    spriteSize: 104,
  },
  treat: {
    id: 'treat',
    name: 'Treat',
    role: 'Splash hit',
    price: 75,
    range: 118,
    damage: 42,
    fireRate: 0.9,
    projectileSpeed: 380,
    color: '#c9833f',
    art: 'treat',
    spriteSize: 116,
  },
  bark: {
    id: 'bark',
    name: 'Bark',
    role: 'Rapid slow',
    price: 95,
    range: 172,
    damage: 14,
    fireRate: 0.34,
    projectileSpeed: 520,
    color: '#66c9ef',
    art: 'bark',
    spriteSize: 112,
  },
};

export const waves = [
  { toy: 8, package: 0, interval: 0.8 },
  { toy: 10, package: 2, interval: 0.72 },
  { toy: 12, package: 4, interval: 0.64 },
  { toy: 15, package: 5, interval: 0.58 },
  { toy: 18, package: 7, interval: 0.52 },
];

export const enemyTypes = {
  toy: {
    id: 'toy',
    name: 'Squeaky Toy',
    hp: 42,
    speed: 58,
    reward: 12,
    color: '#ff6f87',
  },
  package: {
    id: 'package',
    name: 'Snack Thief',
    hp: 88,
    speed: 42,
    reward: 22,
    color: '#c98545',
  },
};
