const bestDistanceKey = 'snoetjes-wings-best-distance';

export function getBestDistance() {
  if (typeof window === 'undefined') {
    return 0;
  }

  const value = Number(window.localStorage.getItem(bestDistanceKey));
  return Number.isFinite(value) ? value : 0;
}

export function saveBestDistance(distance) {
  if (typeof window === 'undefined') {
    return;
  }

  const current = getBestDistance();
  if (distance > current) {
    window.localStorage.setItem(bestDistanceKey, String(Math.floor(distance)));
  }
}
