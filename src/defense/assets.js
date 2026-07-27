import arenaUrl from '../assets/defense-art/park-arena.png';
import tennisUrl from '../assets/defense-art/tennis-launcher.png';
import treatUrl from '../assets/defense-art/treat-toss.png';
import barkUrl from '../assets/defense-art/bark-speaker.png';
import troublemakerUrl from '../assets/defense-art/squeaky-troublemaker.png';

export const defenseAssetUrls = {
  arena: arenaUrl,
  tennis: tennisUrl,
  treat: treatUrl,
  bark: barkUrl,
  troublemaker: troublemakerUrl,
};

const imageCache = Object.fromEntries(
  Object.entries(defenseAssetUrls).map(([key, url]) => {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    return [key, image];
  }),
);

export function getDefenseAsset(key) {
  return imageCache[key] ?? null;
}

export function preloadDefenseAssets() {
  Object.values(imageCache).forEach((image) => image.decode?.().catch(() => {}));
}
